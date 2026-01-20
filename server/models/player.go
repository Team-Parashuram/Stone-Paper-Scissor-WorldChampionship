package models

import (
	"time"

	"gorm.io/gorm"
)

type Player struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `gorm:"uniqueIndex;not null" json:"name"`
	Elo          float64        `gorm:"default:1000" json:"elo"`
	MatchesWon   int            `gorm:"default:0" json:"matches_won"`
	MatchesLost  int            `gorm:"default:0" json:"matches_lost"`
	MatchesDrawn int            `gorm:"default:0" json:"matches_drawn"`
	TotalMatches int            `gorm:"default:0" json:"total_matches"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// PlayerResponse for API responses
type PlayerResponse struct {
	ID           uint    `json:"id"`
	Name         string  `json:"name"`
	Elo          float64 `json:"elo"`
	Rank         int     `json:"rank"`
	MatchesWon   int     `json:"matches_won"`
	MatchesLost  int     `json:"matches_lost"`
	MatchesDrawn int     `json:"matches_drawn"`
	TotalMatches int     `json:"total_matches"`
	WinRate      float64 `json:"win_rate"`
}

// CreatePlayerRequest for creating new players
type CreatePlayerRequest struct {
	Name string `json:"name" validate:"required"`
}
