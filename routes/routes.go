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

	// Player routes
	players := api.Group("/players")
	players.Post("/", handlers.CreatePlayer)
	players.Get("/", handlers.GetAllPlayers)
	players.Get("/:id", handlers.GetPlayer)
	players.Put("/:id", handlers.UpdatePlayer)
	players.Delete("/:id", handlers.DeletePlayer)

	// Match routes
	matches := api.Group("/matches")
	matches.Post("/", handlers.SubmitMatch)
	matches.Get("/", handlers.GetMatchHistory)
	matches.Get("/:id", handlers.GetMatch)

	// Leaderboard routes
	leaderboard := api.Group("/leaderboard")
	leaderboard.Get("/", handlers.GetLeaderboard)
	leaderboard.Get("/top", handlers.GetTopPlayers)
	leaderboard.Get("/rank/:id", handlers.GetPlayerRank)
	leaderboard.Get("/predict", handlers.PredictMatch)
}
