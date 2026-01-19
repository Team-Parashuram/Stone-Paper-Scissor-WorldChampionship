package models

import (
	"time"

	"gorm.io/gorm"
)

// Match represents a game between two players
type Match struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	Player1ID        uint           `gorm:"not null" json:"player1_id"`
	Player2ID        uint           `gorm:"not null" json:"player2_id"`
	Player1Score     int            `gorm:"not null" json:"player1_score"`
	Player2Score     int            `gorm:"not null" json:"player2_score"`
	WinnerID         *uint          `json:"winner_id"` // nil for draw
	Player1EloChange float64        `json:"player1_elo_change"`
	Player2EloChange float64        `json:"player2_elo_change"`
	Player1EloBefore float64        `json:"player1_elo_before"`
	Player2EloBefore float64        `json:"player2_elo_before"`
	Player1EloAfter  float64        `json:"player1_elo_after"`
	Player2EloAfter  float64        `json:"player2_elo_after"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Player1 Player `gorm:"foreignKey:Player1ID" json:"player1,omitempty"`
	Player2 Player `gorm:"foreignKey:Player2ID" json:"player2,omitempty"`
}

// MatchRequest for submitting match results
type MatchRequest struct {
	Player1ID    uint `json:"player1_id" validate:"required"`
	Player2ID    uint `json:"player2_id" validate:"required"`
	Player1Score int  `json:"player1_score" validate:"min=0"`
	Player2Score int  `json:"player2_score" validate:"min=0"`
}

// MatchResponse for API responses
type MatchResponse struct {
	ID               uint    `json:"id"`
	Player1Name      string  `json:"player1_name"`
	Player2Name      string  `json:"player2_name"`
	Player1Score     int     `json:"player1_score"`
	Player2Score     int     `json:"player2_score"`
	WinnerName       string  `json:"winner_name,omitempty"`
	Player1EloChange float64 `json:"player1_elo_change"`
	Player2EloChange float64 `json:"player2_elo_change"`
	Player1EloBefore float64 `json:"player1_elo_before"`
	Player2EloBefore float64 `json:"player2_elo_before"`
	Player1EloAfter  float64 `json:"player1_elo_after"`
	Player2EloAfter  float64 `json:"player2_elo_after"`
	CreatedAt        string  `json:"created_at"`
}
