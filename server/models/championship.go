package models

import (
	"time"

	"gorm.io/gorm"
)

// ChampionshipReign represents a period when a player held the #1 rank
type ChampionshipReign struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	PlayerID  uint           `gorm:"not null;index" json:"player_id"`
	Player    Player         `gorm:"foreignKey:PlayerID" json:"player"`
	StartedAt time.Time      `gorm:"not null" json:"started_at"`
	EndedAt   *time.Time     `json:"ended_at"` // null if currently champion
	Days      int            `gorm:"-" json:"days"` // calculated field
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// CalculateDays calculates the number of days for this reign
func (c *ChampionshipReign) CalculateDays() int {
	endTime := time.Now()
	if c.EndedAt != nil {
		endTime = *c.EndedAt
	}
	duration := endTime.Sub(c.StartedAt)
	return int(duration.Hours() / 24)
}

// ChampionStats represents aggregated championship statistics for a player
type ChampionStats struct {
	PlayerID      uint    `json:"player_id"`
	PlayerName    string  `json:"player_name"`
	TotalReigns   int     `json:"total_reigns"`
	TotalDays     int     `json:"total_days"`
	LongestReign  int     `json:"longest_reign_days"`
	CurrentChamp  bool    `json:"current_champion"`
	FirstCrowned  time.Time `json:"first_crowned"`
	LastCrowned   *time.Time `json:"last_crowned,omitempty"`
}
