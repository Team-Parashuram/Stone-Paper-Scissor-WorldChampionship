package handlers

import (
	"strconv"

	"stone-paper-scissors/services"

	"github.com/gofiber/fiber/v2"
)

// GetCurrentChampion returns the current #1 ranked player's championship reign
func GetCurrentChampion(c *fiber.Ctx) error {
	reign, err := services.GetCurrentChampion()
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "No current champion found",
		})
	}

	return c.JSON(reign)
}

// GetChampionshipHistory returns all championship reigns
func GetChampionshipHistory(c *fiber.Ctx) error {
	limitStr := c.Query("limit", "50")
	limit, _ := strconv.Atoi(limitStr)

	reigns, err := services.GetChampionshipHistory(limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch championship history",
		})
	}

	return c.JSON(fiber.Map{
		"reigns": reigns,
		"total":  len(reigns),
	})
}

// GetChampionStats returns aggregated statistics for all champions
func GetChampionStats(c *fiber.Ctx) error {
	stats, err := services.GetChampionStats()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch champion stats",
		})
	}

	return c.JSON(fiber.Map{
		"champions": stats,
		"total":     len(stats),
	})
}

// GetPlayerChampionshipHistory returns championship history for a specific player
func GetPlayerChampionshipHistory(c *fiber.Ctx) error {
	playerID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid player ID",
		})
	}

	reigns, err := services.GetPlayerChampionshipHistory(uint(playerID))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch player championship history",
		})
	}

	return c.JSON(fiber.Map{
		"reigns": reigns,
		"total":  len(reigns),
	})
}
