package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"github.com/myorg/api-gateway/internal/config"
	"github.com/myorg/api-gateway/internal/database"
	"github.com/myorg/api-gateway/internal/handlers"
	"github.com/myorg/api-gateway/internal/middleware"
)

func main() {
	cfg := config.Load()
	database.Connect(cfg)
	defer database.Close()

	loginLimiter := middleware.NewRateLimiter(10, time.Minute)
	registerLimiter := middleware.NewRateLimiter(5, time.Minute)
	generalLimiter := middleware.NewRateLimiter(cfg.GeneralRateLimit, cfg.RateWindow)
	defer loginLimiter.Stop()
	defer registerLimiter.Stop()
	defer generalLimiter.Stop()

	r := chi.NewRouter()

	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.RequestID)
	r.Use(middleware.SecurityHeaders)
	r.Use(middleware.CORS(cfg.CORSOrigins))
	r.Use(middleware.AccessLog)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"api-gateway"}`))
	})

	r.Route("/api/v1", func(r chi.Router) {
		r.Use(middleware.RateLimit(generalLimiter))

		// Auth - stricter rate limits
		r.Group(func(r chi.Router) {
			r.Use(middleware.RateLimit(loginLimiter))
			r.Post("/auth/register", handlers.Register(cfg))
			r.Post("/auth/login", handlers.Login(cfg))
		})
		r.Group(func(r chi.Router) {
			r.Use(middleware.RateLimit(loginLimiter))
			r.Post("/admin/login", handlers.AdminLogin(cfg))
		})
		r.Post("/auth/refresh", handlers.RefreshToken(cfg))
		r.Post("/auth/logout", handlers.Logout(cfg))
		r.Post("/admin/logout", handlers.AdminLogout(cfg))

		// Public read-only
		r.Get("/settings", handlers.GetSettings)
		r.Get("/products", handlers.ListProducts)
		r.Get("/categories", handlers.ListCategories)

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth(cfg))
			r.Use(middleware.BodySizeLimit(cfg.BodyMaxBytes))

			r.Get("/auth/me", handlers.Me)
			r.Put("/auth/me", handlers.UpdateMe)

			r.With(middleware.AdminOnly).Post("/products", handlers.CreateProduct)
			r.Get("/products/{id}", handlers.GetProduct)
			r.With(middleware.AdminOnly).Put("/products/{id}", handlers.UpdateProduct)
			r.With(middleware.AdminOnly).Delete("/products/{id}", handlers.DeleteProduct)

			r.With(middleware.AdminOnly).Post("/categories", handlers.CreateCategory)
			r.Get("/categories/{id}", handlers.GetCategory)
			r.With(middleware.AdminOnly).Put("/categories/{id}", handlers.UpdateCategory)
			r.With(middleware.AdminOnly).Delete("/categories/{id}", handlers.DeleteCategory)

			r.Get("/orders", handlers.ListOrders)
			r.Post("/orders", handlers.CreateOrder)
			r.Get("/orders/{id}", handlers.GetOrder)
			r.With(middleware.AdminOnly).Put("/orders/{id}", handlers.UpdateOrder)

			r.With(middleware.AdminOnly).Get("/users", handlers.ListUsers)
			r.With(middleware.AdminOnly).Post("/users", handlers.CreateUser)
			r.With(middleware.AdminOnly).Get("/users/{id}", handlers.GetUser)
			r.With(middleware.AdminOnly).Put("/users/{id}", handlers.UpdateUser)
			r.With(middleware.AdminOnly).Delete("/users/{id}", handlers.DeleteUser)

			r.Get("/quotations", handlers.ListQuotations)
			r.Post("/quotations", handlers.CreateQuotation)

			r.With(middleware.AdminOnly).Get("/dashboard/stats", handlers.DashboardStats)

			r.With(middleware.AdminOnly).Put("/settings", handlers.UpdateSettings)

			r.With(middleware.AdminOnly).Post("/admin/backup", handlers.BackupDatabase)
			r.With(middleware.AdminOnly).Get("/admin/export", handlers.ExportDatabase)
			r.With(middleware.AdminOnly).Post("/admin/import", handlers.ImportDatabase)
		})
	})

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown on SIGINT/SIGTERM
	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		sig := <-sigCh
		log.Printf("Received %s, shutting down...", sig)

		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		if err := srv.Shutdown(ctx); err != nil {
			log.Printf("Graceful shutdown failed: %v", err)
		}
	}()

	log.Printf("API Gateway running on :%s", cfg.Port)
	if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
	log.Println("API Gateway stopped cleanly")
}
