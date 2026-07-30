package main

import (
	"log"
	"net/http"
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
	defer loginLimiter.Stop()
	defer registerLimiter.Stop()

	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.RequestID)
	r.Use(middleware.SecurityHeaders)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin != "" {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Auth-Type")
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Set("Access-Control-Max-Age", "300")
			}
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"api-gateway"}`))
	})

	r.Route("/api/v1", func(r chi.Router) {
		// Auth - rate limited
		r.Group(func(r chi.Router) {
			r.Use(middleware.RateLimit(loginLimiter))
			r.Post("/auth/register", handlers.Register(cfg))
			r.Post("/auth/login", handlers.Login(cfg))
		})
		r.Post("/auth/refresh", handlers.RefreshToken(cfg))
		r.Post("/auth/logout", handlers.Logout)
		r.Post("/admin/login", handlers.AdminLogin(cfg))
		r.Post("/admin/logout", handlers.AdminLogout)

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

			r.With(middleware.AdminOnly).Post("/admin/backup", handlers.BackupDatabase)
			r.With(middleware.AdminOnly).Get("/admin/export", handlers.ExportDatabase)
			r.With(middleware.AdminOnly).Post("/admin/import", handlers.ImportDatabase)
		})
	})

	log.Printf("API Gateway running on :%s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}
