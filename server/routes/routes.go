package routes

import (
	"stone-paper-scissors/handlers"

	"github.com/gofiber/fiber/v2"
)

// SetupRoutes configures all the API routes
func SetupRoutes(app *fiber.App) {
	// API versioning
	api := app.Group("/api/v1")

	// Health check
	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"service": "Stone-Paper-Scissors Championship API",
		})
	})

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.Post("/register", handlers.RegisterSuperAdmin)
	auth.Post("/login", handlers.Login)
	auth.Get("/check-super-admin", handlers.CheckSuperAdminExists)

	// Protected auth routes
	auth.Get("/me", handlers.AuthMiddleware, handlers.GetMe)

	// Admin management routes (super admin only)
	admins := api.Group("/admins", handlers.AuthMiddleware, handlers.SuperAdminOnly)
	admins.Post("/", handlers.CreateAdmin)
	admins.Get("/", handlers.GetAllAdmins)
	admins.Delete("/:id", handlers.DeleteAdmin)

	// Player routes (public read, admin write)
	players := api.Group("/players")
	players.Get("/", handlers.GetAllPlayers)
	players.Get("/search", handlers.SearchPlayers)
	players.Get("/:id", handlers.GetPlayer)
	players.Get("/:id/matches", handlers.GetPlayerMatches)

	// Protected player routes
	players.Post("/", handlers.AuthMiddleware, handlers.CreatePlayer)
	players.Put("/:id", handlers.AuthMiddleware, handlers.UpdatePlayer)
	players.Delete("/:id", handlers.AuthMiddleware, handlers.DeletePlayer)

	// Match routes
	matches := api.Group("/matches")
	matches.Get("/", handlers.GetMatchHistory)
	matches.Get("/:id", handlers.GetMatch)
	matches.Get("/admin/:adminId", handlers.AuthMiddleware, handlers.GetMatchesByAdmin)
	matches.Post("/", handlers.AuthMiddleware, handlers.SubmitMatch)
	matches.Delete("/:id", handlers.AuthMiddleware, handlers.DeleteMatch)

	// Leaderboard routes (public)
	leaderboard := api.Group("/leaderboard")
	leaderboard.Get("/", handlers.GetLeaderboard)
	leaderboard.Get("/top", handlers.GetTopPlayers)
	leaderboard.Get("/rank/:id", handlers.GetPlayerRank)
	leaderboard.Get("/predict", handlers.PredictMatch)
}
