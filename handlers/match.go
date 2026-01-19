package handlers

import (
	"stone-paper-scissors/config"
	"stone-paper-scissors/models"
	"stone-paper-scissors/services"

	"github.com/gofiber/fiber/v2"
)

// SubmitMatch records a match result and updates ELO ratings
func SubmitMatch(c *fiber.Ctx) error {
	var req models.MatchRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate request
	if req.Player1ID == req.Player2ID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Player cannot play against themselves",
		})
	}

	if req.Player1Score < 0 || req.Player2Score < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Scores cannot be negative",
		})
	}

	// Fetch both players
	var player1, player2 models.Player
	if result := config.DB.First(&player1, req.Player1ID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Player 1 not found",
		})
	}
	if result := config.DB.First(&player2, req.Player2ID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Player 2 not found",
		})
	}

	// Calculate new ELO ratings
	eloResult := services.CalculateElo(
		player1.Elo,
		player2.Elo,
		req.Player1Score,
		req.Player2Score,
		player1.TotalMatches,
		player2.TotalMatches,
	)

	// Determine winner
	var winnerID *uint
	if req.Player1Score > req.Player2Score {
		winnerID = &player1.ID
		player1.MatchesWon++
		player2.MatchesLost++
	} else if req.Player2Score > req.Player1Score {
		winnerID = &player2.ID
		player2.MatchesWon++
		player1.MatchesLost++
	} else {
		// Draw
		player1.MatchesDrawn++
		player2.MatchesDrawn++
	}

	// Create match record
	match := models.Match{
		Player1ID:        player1.ID,
		Player2ID:        player2.ID,
		Player1Score:     req.Player1Score,
		Player2Score:     req.Player2Score,
		WinnerID:         winnerID,
		Player1EloBefore: player1.Elo,
		Player2EloBefore: player2.Elo,
		Player1EloAfter:  eloResult.Player1NewElo,
		Player2EloAfter:  eloResult.Player2NewElo,
		Player1EloChange: eloResult.Player1EloChange,
		Player2EloChange: eloResult.Player2EloChange,
	}

	// Update player stats
	player1.Elo = eloResult.Player1NewElo
	player2.Elo = eloResult.Player2NewElo
	player1.TotalMatches++
	player2.TotalMatches++

	// Start transaction
	tx := config.DB.Begin()

	if err := tx.Save(&player1).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update player 1",
		})
	}

	if err := tx.Save(&player2).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update player 2",
		})
	}

	if err := tx.Create(&match).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create match record",
		})
	}

	tx.Commit()

	// Prepare response
	winnerName := ""
	if winnerID != nil {
		if *winnerID == player1.ID {
			winnerName = player1.Name
		} else {
			winnerName = player2.Name
		}
	}

	response := models.MatchResponse{
		ID:               match.ID,
		Player1Name:      player1.Name,
		Player2Name:      player2.Name,
		Player1Score:     match.Player1Score,
		Player2Score:     match.Player2Score,
		WinnerName:       winnerName,
		Player1EloChange: match.Player1EloChange,
		Player2EloChange: match.Player2EloChange,
		Player1EloBefore: match.Player1EloBefore,
		Player2EloBefore: match.Player2EloBefore,
		Player1EloAfter:  match.Player1EloAfter,
		Player2EloAfter:  match.Player2EloAfter,
		CreatedAt:        match.CreatedAt.Format("2006-01-02 15:04:05"),
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Match recorded successfully",
		"match":   response,
	})
}

// GetMatchHistory gets all matches with optional filtering
func GetMatchHistory(c *fiber.Ctx) error {
	playerID := c.Query("player_id")
	limit := c.QueryInt("limit", 50)

	query := config.DB.Model(&models.Match{}).
		Preload("Player1").
		Preload("Player2").
		Order("created_at DESC").
		Limit(limit)

	if playerID != "" {
		query = query.Where("player1_id = ? OR player2_id = ?", playerID, playerID)
	}

	var matches []models.Match
	if result := query.Find(&matches); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch matches",
		})
	}

	var response []models.MatchResponse
	for _, match := range matches {
		winnerName := ""
		if match.WinnerID != nil {
			if *match.WinnerID == match.Player1ID {
				winnerName = match.Player1.Name
			} else {
				winnerName = match.Player2.Name
			}
		}

		response = append(response, models.MatchResponse{
			ID:               match.ID,
			Player1Name:      match.Player1.Name,
			Player2Name:      match.Player2.Name,
			Player1Score:     match.Player1Score,
			Player2Score:     match.Player2Score,
			WinnerName:       winnerName,
			Player1EloChange: match.Player1EloChange,
			Player2EloChange: match.Player2EloChange,
			Player1EloBefore: match.Player1EloBefore,
			Player2EloBefore: match.Player2EloBefore,
			Player1EloAfter:  match.Player1EloAfter,
			Player2EloAfter:  match.Player2EloAfter,
			CreatedAt:        match.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	return c.JSON(fiber.Map{
		"matches": response,
		"total":   len(response),
	})
}

// GetMatch gets a single match by ID
func GetMatch(c *fiber.Ctx) error {
	id := c.Params("id")

	var match models.Match
	if result := config.DB.Preload("Player1").Preload("Player2").First(&match, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Match not found",
		})
	}

	winnerName := ""
	if match.WinnerID != nil {
		if *match.WinnerID == match.Player1ID {
			winnerName = match.Player1.Name
		} else {
			winnerName = match.Player2.Name
		}
	}

	response := models.MatchResponse{
		ID:               match.ID,
		Player1Name:      match.Player1.Name,
		Player2Name:      match.Player2.Name,
		Player1Score:     match.Player1Score,
		Player2Score:     match.Player2Score,
		WinnerName:       winnerName,
		Player1EloChange: match.Player1EloChange,
		Player2EloChange: match.Player2EloChange,
		Player1EloBefore: match.Player1EloBefore,
		Player2EloBefore: match.Player2EloBefore,
		Player1EloAfter:  match.Player1EloAfter,
		Player2EloAfter:  match.Player2EloAfter,
		CreatedAt:        match.CreatedAt.Format("2006-01-02 15:04:05"),
	}

	return c.JSON(response)
}
