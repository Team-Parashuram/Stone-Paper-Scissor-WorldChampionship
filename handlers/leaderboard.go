package handlers

import (
	"stone-paper-scissors/config"
	"stone-paper-scissors/models"
	"stone-paper-scissors/services"

	"github.com/gofiber/fiber/v2"
)

// LeaderboardEntry represents a single entry in the leaderboard
type LeaderboardEntry struct {
	Rank         int     `json:"rank"`
	ID           uint    `json:"id"`
	Name         string  `json:"name"`
	Elo          float64 `json:"elo"`
	MatchesWon   int     `json:"matches_won"`
	MatchesLost  int     `json:"matches_lost"`
	MatchesDrawn int     `json:"matches_drawn"`
	TotalMatches int     `json:"total_matches"`
	WinRate      float64 `json:"win_rate"`
}

// GetLeaderboard returns the ranked leaderboard of all players
func GetLeaderboard(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 100)
	offset := c.QueryInt("offset", 0)

	var players []models.Player
	var total int64

	// Get total count
	config.DB.Model(&models.Player{}).Count(&total)

	// Get players sorted by ELO
	if result := config.DB.Order("elo DESC").Limit(limit).Offset(offset).Find(&players); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch leaderboard",
		})
	}

	var leaderboard []LeaderboardEntry
	for i, player := range players {
		var winRate float64
		if player.TotalMatches > 0 {
			winRate = float64(player.MatchesWon) / float64(player.TotalMatches) * 100
		}

		leaderboard = append(leaderboard, LeaderboardEntry{
			Rank:         offset + i + 1,
			ID:           player.ID,
			Name:         player.Name,
			Elo:          player.Elo,
			MatchesWon:   player.MatchesWon,
			MatchesLost:  player.MatchesLost,
			MatchesDrawn: player.MatchesDrawn,
			TotalMatches: player.TotalMatches,
			WinRate:      winRate,
		})
	}

	return c.JSON(fiber.Map{
		"leaderboard": leaderboard,
		"total":       total,
		"limit":       limit,
		"offset":      offset,
	})
}

// GetTopPlayers returns top N players
func GetTopPlayers(c *fiber.Ctx) error {
	n := c.QueryInt("n", 10)

	var players []models.Player
	if result := config.DB.Order("elo DESC").Limit(n).Find(&players); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch top players",
		})
	}

	var leaderboard []LeaderboardEntry
	for i, player := range players {
		var winRate float64
		if player.TotalMatches > 0 {
			winRate = float64(player.MatchesWon) / float64(player.TotalMatches) * 100
		}

		leaderboard = append(leaderboard, LeaderboardEntry{
			Rank:         i + 1,
			ID:           player.ID,
			Name:         player.Name,
			Elo:          player.Elo,
			MatchesWon:   player.MatchesWon,
			MatchesLost:  player.MatchesLost,
			MatchesDrawn: player.MatchesDrawn,
			TotalMatches: player.TotalMatches,
			WinRate:      winRate,
		})
	}

	return c.JSON(fiber.Map{
		"top_players": leaderboard,
		"count":       len(leaderboard),
	})
}

// GetPlayerRank returns the rank of a specific player
func GetPlayerRank(c *fiber.Ctx) error {
	id := c.Params("id")

	var player models.Player
	if result := config.DB.First(&player, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Player not found",
		})
	}

	// Count players with higher ELO
	var rank int64
	config.DB.Model(&models.Player{}).Where("elo > ?", player.Elo).Count(&rank)

	// Get total players
	var total int64
	config.DB.Model(&models.Player{}).Count(&total)

	var winRate float64
	if player.TotalMatches > 0 {
		winRate = float64(player.MatchesWon) / float64(player.TotalMatches) * 100
	}

	return c.JSON(fiber.Map{
		"player": LeaderboardEntry{
			Rank:         int(rank) + 1,
			ID:           player.ID,
			Name:         player.Name,
			Elo:          player.Elo,
			MatchesWon:   player.MatchesWon,
			MatchesLost:  player.MatchesLost,
			MatchesDrawn: player.MatchesDrawn,
			TotalMatches: player.TotalMatches,
			WinRate:      winRate,
		},
		"total_players": total,
		"percentile":    (1 - float64(rank)/float64(total)) * 100,
	})
}

// PredictMatch predicts the outcome of a match between two players
func PredictMatch(c *fiber.Ctx) error {
	player1ID := c.QueryInt("player1_id", 0)
	player2ID := c.QueryInt("player2_id", 0)

	if player1ID == 0 || player2ID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Both player1_id and player2_id are required",
		})
	}

	var player1, player2 models.Player
	if result := config.DB.First(&player1, player1ID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Player 1 not found",
		})
	}
	if result := config.DB.First(&player2, player2ID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Player 2 not found",
		})
	}

	player1WinProb := services.CalculateWinProbability(player1.Elo, player2.Elo)
	player2WinProb := services.CalculateWinProbability(player2.Elo, player1.Elo)

	return c.JSON(fiber.Map{
		"player1": fiber.Map{
			"id":              player1.ID,
			"name":            player1.Name,
			"elo":             player1.Elo,
			"win_probability": player1WinProb,
		},
		"player2": fiber.Map{
			"id":              player2.ID,
			"name":            player2.Name,
			"elo":             player2.Elo,
			"win_probability": player2WinProb,
		},
		"elo_difference": player1.Elo - player2.Elo,
	})
}
