package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

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
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

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

			r.Get("/quotations", handlers.ListQuotations)
			r.Post("/quotations", handlers.CreateQuotation)

			r.With(middleware.AdminOnly).Get("/dashboard/stats", handlers.DashboardStats)
		})
	})

	log.Printf("API Gateway running on :%s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}
