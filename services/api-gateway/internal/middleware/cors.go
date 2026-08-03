package middleware

import (
	"net/http"

	"github.com/go-chi/cors"
)

// CORS returns a middleware that only allows requests from the configured
// origin allowlist. Unlike a wildcard/echo-back setup this never reflects an
// arbitrary Origin, which would let any site read credentialed responses.
func CORS(origins []string) func(http.Handler) http.Handler {
	return cors.Handler(cors.Options{
		AllowedOrigins:   origins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Auth-Type"},
		ExposedHeaders:   []string{"X-Request-Id"},
		AllowCredentials: true,
		MaxAge:           300,
	})
}
