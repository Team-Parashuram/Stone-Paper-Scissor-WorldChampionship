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

// SearchPlayers searches players by name
func SearchPlayers(c *fiber.Ctx) error {
	query := c.Query("q")
	limit := c.QueryInt("limit", 20)

	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Search query is required",
		})
	}

	var players []models.Player
	if result := config.DB.Where("name LIKE ?", "%"+query+"%").Order("elo DESC").Limit(limit).Find(&players); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to search players",
		})
	}

	var response []models.PlayerResponse
	for i, player := range players {
		var winRate float64
		if player.TotalMatches > 0 {
			winRate = float64(player.MatchesWon) / float64(player.TotalMatches) * 100
		}

		// Calculate rank
		var rank int64
		config.DB.Model(&models.Player{}).Where("elo > ?", player.Elo).Count(&rank)

		response = append(response, models.PlayerResponse{
			ID:           player.ID,
			Name:         player.Name,
			Elo:          player.Elo,
			Rank:         int(rank) + 1,
			MatchesWon:   player.MatchesWon,
			MatchesLost:  player.MatchesLost,
			MatchesDrawn: player.MatchesDrawn,
			TotalMatches: player.TotalMatches,
			WinRate:      winRate,
		})
		_ = i // suppress unused variable warning
	}

	return c.JSON(fiber.Map{
		"players": response,
		"total":   len(response),
	})
}

// GetPlayerMatches gets all matches for a specific player
func GetPlayerMatches(c *fiber.Ctx) error {
	playerID := c.Params("id")
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)

	var player models.Player
	if result := config.DB.First(&player, playerID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Player not found",
		})
	}

	var matches []models.Match
	var total int64

	query := config.DB.Model(&models.Match{}).
		Preload("Player1").
		Preload("Player2").
		Where("player1_id = ? OR player2_id = ?", playerID, playerID).
		Order("created_at DESC")

	query.Count(&total)

	if result := query.Limit(limit).Offset(offset).Find(&matches); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch matches",
		})
	}

	type PlayerMatchResponse struct {
		ID            uint    `json:"id"`
		OpponentID    uint    `json:"opponent_id"`
		OpponentName  string  `json:"opponent_name"`
		PlayerScore   int     `json:"player_score"`
		OpponentScore int     `json:"opponent_score"`
		Result        string  `json:"result"`
		EloChange     float64 `json:"elo_change"`
		EloBefore     float64 `json:"elo_before"`
		EloAfter      float64 `json:"elo_after"`
		CreatedAt     string  `json:"created_at"`
	}

	var response []PlayerMatchResponse
	for _, match := range matches {
		var matchResp PlayerMatchResponse
		matchResp.ID = match.ID
		matchResp.CreatedAt = match.CreatedAt.Format("2006-01-02 15:04:05")

		if match.Player1ID == player.ID {
			matchResp.OpponentID = match.Player2ID
			matchResp.OpponentName = match.Player2.Name
			matchResp.PlayerScore = match.Player1Score
			matchResp.OpponentScore = match.Player2Score
			matchResp.EloChange = match.Player1EloChange
			matchResp.EloBefore = match.Player1EloBefore
			matchResp.EloAfter = match.Player1EloAfter

			if match.WinnerID != nil && *match.WinnerID == player.ID {
				matchResp.Result = "Win"
			} else if match.WinnerID != nil {
				matchResp.Result = "Loss"
			} else {
				matchResp.Result = "Draw"
			}
		} else {
			matchResp.OpponentID = match.Player1ID
			matchResp.OpponentName = match.Player1.Name
			matchResp.PlayerScore = match.Player2Score
			matchResp.OpponentScore = match.Player1Score
			matchResp.EloChange = match.Player2EloChange
			matchResp.EloBefore = match.Player2EloBefore
			matchResp.EloAfter = match.Player2EloAfter

			if match.WinnerID != nil && *match.WinnerID == player.ID {
				matchResp.Result = "Win"
			} else if match.WinnerID != nil {
				matchResp.Result = "Loss"
			} else {
				matchResp.Result = "Draw"
			}
		}

		response = append(response, matchResp)
	}

	return c.JSON(fiber.Map{
		"player":  player.Name,
		"matches": response,
		"total":   total,
		"limit":   limit,
		"offset":  offset,
	})
}
