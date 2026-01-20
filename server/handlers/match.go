package handlers

import (
"fmt"
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

// Get admin from context (set by AuthMiddleware)
admin := c.Locals("admin").(*models.Admin)

var player1, player2 models.Player

// If player IDs are provided, use them; otherwise create/find by name
if req.Player1ID != 0 && req.Player2ID != 0 {
// Validate request
if req.Player1ID == req.Player2ID {
return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
"error": "Player cannot play against themselves",
})
}

// Fetch players by ID
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
} else if req.Player1Name != "" && req.Player2Name != "" {
// Validate names are different
if req.Player1Name == req.Player2Name {
return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
"error": "Player cannot play against themselves",
})
}

// Find or create player 1
if result := config.DB.Where("name = ?", req.Player1Name).First(&player1); result.Error != nil {
player1 = models.Player{Name: req.Player1Name, Elo: 1000}
if result := config.DB.Create(&player1); result.Error != nil {
return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
"error": "Failed to create player 1",
})
}
}

// Find or create player 2
if result := config.DB.Where("name = ?", req.Player2Name).First(&player2); result.Error != nil {
player2 = models.Player{Name: req.Player2Name, Elo: 1000}
if result := config.DB.Create(&player2); result.Error != nil {
return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
"error": "Failed to create player 2",
})
}
}
} else {
return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
"error": "Either player IDs or player names must be provided",
})
}

if req.Player1Score < 0 || req.Player2Score < 0 {
return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
"error": "Scores cannot be negative",
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

// Create match record with admin ID
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
CreatedByAdminID: &admin.ID,
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
Player1ID:        player1.ID,
Player2ID:        player2.ID,
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
CreatedByAdminID: match.CreatedByAdminID,
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
offset := c.QueryInt("offset", 0)

query := config.DB.Model(&models.Match{}).
Preload("Player1").
Preload("Player2").
Order("created_at DESC").
Limit(limit).
Offset(offset)

if playerID != "" {
query = query.Where("player1_id = ? OR player2_id = ?", playerID, playerID)
}

var matches []models.Match
var total int64

// Get total count
countQuery := config.DB.Model(&models.Match{})
if playerID != "" {
countQuery = countQuery.Where("player1_id = ? OR player2_id = ?", playerID, playerID)
}
countQuery.Count(&total)

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
Player1ID:        match.Player1ID,
Player2ID:        match.Player2ID,
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
CreatedByAdminID: match.CreatedByAdminID,
CreatedAt:        match.CreatedAt.Format("2006-01-02 15:04:05"),
})
}

return c.JSON(fiber.Map{
"matches": response,
"total":   total,
"limit":   limit,
"offset":  offset,
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
Player1ID:        match.Player1ID,
Player2ID:        match.Player2ID,
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
CreatedByAdminID: match.CreatedByAdminID,
CreatedAt:        match.CreatedAt.Format("2006-01-02 15:04:05"),
}

return c.JSON(response)
}

// GetMatchesByAdmin gets all matches created by a specific admin
func GetMatchesByAdmin(c *fiber.Ctx) error {
adminId := c.Params("adminId")
limit := c.QueryInt("limit", 50)
offset := c.QueryInt("offset", 0)

currentAdmin := c.Locals("admin").(*models.Admin)

// Only super admin can view other admin's matches, or the admin themselves
if currentAdmin.Role != models.RoleSuperAdmin {
if adminId != fmt.Sprintf("%d", currentAdmin.ID) {
return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
"error": "You can only view your own matches",
})
}
}

var matches []models.Match
var total int64

query := config.DB.Model(&models.Match{}).
Preload("Player1").
Preload("Player2").
Where("created_by_admin_id = ?", adminId).
Order("created_at DESC")

query.Count(&total)

if result := query.Limit(limit).Offset(offset).Find(&matches); result.Error != nil {
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
Player1ID:        match.Player1ID,
Player2ID:        match.Player2ID,
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
CreatedByAdminID: match.CreatedByAdminID,
CreatedAt:        match.CreatedAt.Format("2006-01-02 15:04:05"),
})
}

return c.JSON(fiber.Map{
"matches": response,
"total":   total,
"limit":   limit,
"offset":  offset,
})
}

// DeleteMatch deletes a match (admin can delete their own, super admin can delete any)
func DeleteMatch(c *fiber.Ctx) error {
id := c.Params("id")
currentAdmin := c.Locals("admin").(*models.Admin)

var match models.Match
if result := config.DB.Preload("Player1").Preload("Player2").First(&match, id); result.Error != nil {
return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
"error": "Match not found",
})
}

// Check permissions
if currentAdmin.Role != models.RoleSuperAdmin {
if match.CreatedByAdminID == nil || *match.CreatedByAdminID != currentAdmin.ID {
return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
"error": "You can only delete matches you created",
})
}
}

// Reverse the ELO changes and match counts
tx := config.DB.Begin()

var player1, player2 models.Player
if err := tx.First(&player1, match.Player1ID).Error; err != nil {
tx.Rollback()
return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
"error": "Failed to find player 1",
})
}
if err := tx.First(&player2, match.Player2ID).Error; err != nil {
tx.Rollback()
return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
"error": "Failed to find player 2",
})
}

// Reverse ELO
player1.Elo = match.Player1EloBefore
player2.Elo = match.Player2EloBefore
player1.TotalMatches--
player2.TotalMatches--

// Reverse win/loss/draw counts
if match.WinnerID != nil {
if *match.WinnerID == player1.ID {
player1.MatchesWon--
player2.MatchesLost--
} else {
player2.MatchesWon--
player1.MatchesLost--
}
} else {
player1.MatchesDrawn--
player2.MatchesDrawn--
}

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

if err := tx.Delete(&match).Error; err != nil {
tx.Rollback()
return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
"error": "Failed to delete match",
})
}

tx.Commit()

return c.JSON(fiber.Map{
"message": "Match deleted successfully and ELO changes reversed",
})
}
