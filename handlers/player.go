package handlers

import (
	"stone-paper-scissors/config"
	"stone-paper-scissors/models"

	"github.com/gofiber/fiber/v2"
)

// CreatePlayer creates a new player
func CreatePlayer(c *fiber.Ctx) error {
	var req models.CreatePlayerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Player name is required",
		})
	}

	// Check if player already exists
	var existingPlayer models.Player
	if result := config.DB.Where("name = ?", req.Name).First(&existingPlayer); result.Error == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Player with this name already exists",
		})
	}

	player := models.Player{
		Name: req.Name,
		Elo:  1000, // Starting ELO
	}

	if result := config.DB.Create(&player); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create player",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Player created successfully",
		"player":  player,
	})
}

// GetPlayer gets a single player by ID
func GetPlayer(c *fiber.Ctx) error {
	id := c.Params("id")

	var player models.Player
	if result := config.DB.First(&player, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Player not found",
		})
	}

	// Calculate rank
	var rank int64
	config.DB.Model(&models.Player{}).Where("elo > ?", player.Elo).Count(&rank)

	var winRate float64
	if player.TotalMatches > 0 {
		winRate = float64(player.MatchesWon) / float64(player.TotalMatches) * 100
	}

	response := models.PlayerResponse{
		ID:           player.ID,
		Name:         player.Name,
		Elo:          player.Elo,
		Rank:         int(rank) + 1,
		MatchesWon:   player.MatchesWon,
		MatchesLost:  player.MatchesLost,
		MatchesDrawn: player.MatchesDrawn,
		TotalMatches: player.TotalMatches,
		WinRate:      winRate,
	}

	return c.JSON(response)
}

// GetAllPlayers gets all players
func GetAllPlayers(c *fiber.Ctx) error {
	var players []models.Player
	if result := config.DB.Order("elo DESC").Find(&players); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch players",
		})
	}

	var response []models.PlayerResponse
	for i, player := range players {
		var winRate float64
		if player.TotalMatches > 0 {
			winRate = float64(player.MatchesWon) / float64(player.TotalMatches) * 100
		}

		response = append(response, models.PlayerResponse{
			ID:           player.ID,
			Name:         player.Name,
			Elo:          player.Elo,
			Rank:         i + 1,
			MatchesWon:   player.MatchesWon,
			MatchesLost:  player.MatchesLost,
			MatchesDrawn: player.MatchesDrawn,
			TotalMatches: player.TotalMatches,
			WinRate:      winRate,
		})
	}

	return c.JSON(fiber.Map{
		"players": response,
		"total":   len(response),
	})
}

// DeletePlayer deletes a player by ID
func DeletePlayer(c *fiber.Ctx) error {
	id := c.Params("id")

	var player models.Player
	if result := config.DB.First(&player, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Player not found",
		})
	}

	if result := config.DB.Delete(&player); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete player",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Player deleted successfully",
	})
}

// UpdatePlayer updates a player's name
func UpdatePlayer(c *fiber.Ctx) error {
	id := c.Params("id")

	var player models.Player
	if result := config.DB.First(&player, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Player not found",
		})
	}

	var req models.CreatePlayerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Name != "" {
		player.Name = req.Name
	}

	if result := config.DB.Save(&player); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update player",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Player updated successfully",
		"player":  player,
	})
}
