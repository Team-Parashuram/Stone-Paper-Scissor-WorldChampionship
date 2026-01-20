package main

import (
	"log"
	"os"

	"stone-paper-scissors/config"
	"stone-paper-scissors/models"
	"stone-paper-scissors/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Connect to database
	config.ConnectDatabase()

	// Auto migrate models
	err := config.DB.AutoMigrate(&models.Player{}, &models.Match{}, &models.Admin{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database migrated successfully!")

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Stone-Paper-Scissors Championship API v1.0.0",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Welcome route
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Welcome to Stone-Paper-Scissors World Championship API!",
			"version": "1.0.0",
			"endpoints": fiber.Map{
				"health":      "GET /api/v1/health",
				"players":     "GET, POST /api/v1/players",
				"player":      "GET, PUT, DELETE /api/v1/players/:id",
				"matches":     "GET, POST /api/v1/matches",
				"match":       "GET /api/v1/matches/:id",
				"leaderboard": "GET /api/v1/leaderboard",
				"top_players": "GET /api/v1/leaderboard/top?n=10",
				"player_rank": "GET /api/v1/leaderboard/rank/:id",
				"predict":     "GET /api/v1/leaderboard/predict?player1_id=1&player2_id=2",
			},
		})
	})

	// Setup routes
	routes.SetupRoutes(app)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	log.Printf("🏆 Stone-Paper-Scissors Championship API starting on http://localhost:%s", port)
	log.Fatal(app.Listen(":" + port))
}
