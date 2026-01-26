package services

import (
	"time"

	"stone-paper-scissors/config"
	"stone-paper-scissors/models"
)

// TrackChampionshipChange checks if there's a rank change and updates championship reigns
func TrackChampionshipChange(newChampionID uint, oldChampionID *uint) error {
	db := config.DB

	// If same champion, do nothing
	if oldChampionID != nil && *oldChampionID == newChampionID {
		return nil
	}

	now := time.Now()

	// End the previous champion's reign if exists
	if oldChampionID != nil && *oldChampionID != newChampionID {
		var currentReign models.ChampionshipReign
		err := db.Where("player_id = ? AND ended_at IS NULL", *oldChampionID).
			First(&currentReign).Error
		
		if err == nil {
			currentReign.EndedAt = &now
			if err := db.Save(&currentReign).Error; err != nil {
				return err
			}
		}
	}

	// Start new reign for new champion
	newReign := models.ChampionshipReign{
		PlayerID:  newChampionID,
		StartedAt: now,
	}

	return db.Create(&newReign).Error
}

// GetCurrentChampion returns the current champion's reign
func GetCurrentChampion() (*models.ChampionshipReign, error) {
	var reign models.ChampionshipReign
	err := config.DB.
		Preload("Player").
		Where("ended_at IS NULL").
		Order("started_at DESC").
		First(&reign).Error
	
	if err != nil {
		return nil, err
	}

	reign.Days = reign.CalculateDays()
	return &reign, nil
}

// GetChampionshipHistory returns all championship reigns ordered by start date
func GetChampionshipHistory(limit int) ([]models.ChampionshipReign, error) {
	var reigns []models.ChampionshipReign
	query := config.DB.
		Preload("Player").
		Order("started_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&reigns).Error
	if err != nil {
		return nil, err
	}

	// Calculate days for each reign
	for i := range reigns {
		reigns[i].Days = reigns[i].CalculateDays()
	}

	return reigns, nil
}

// GetChampionStats returns aggregated statistics for all champions
func GetChampionStats() ([]models.ChampionStats, error) {
	var stats []models.ChampionStats

	// PostgreSQL-compatible query
	query := `
		SELECT 
			p.id as player_id,
			p.name as player_name,
			COUNT(cr.id) as total_reigns,
			SUM(
				CASE 
					WHEN cr.ended_at IS NULL THEN EXTRACT(DAY FROM (NOW() - cr.started_at))::INTEGER
					ELSE EXTRACT(DAY FROM (cr.ended_at - cr.started_at))::INTEGER
				END
			) as total_days,
			MAX(
				CASE 
					WHEN cr.ended_at IS NULL THEN EXTRACT(DAY FROM (NOW() - cr.started_at))::INTEGER
					ELSE EXTRACT(DAY FROM (cr.ended_at - cr.started_at))::INTEGER
				END
			) as longest_reign_days,
			MAX(CASE WHEN cr.ended_at IS NULL THEN 1 ELSE 0 END) as current_champion,
			MIN(cr.started_at) as first_crowned,
			MAX(CASE WHEN cr.ended_at IS NOT NULL THEN cr.started_at END) as last_crowned
		FROM players p
		INNER JOIN championship_reigns cr ON p.id = cr.player_id
		WHERE cr.deleted_at IS NULL
		GROUP BY p.id, p.name
		ORDER BY total_days DESC
	`

	err := config.DB.Raw(query).Scan(&stats).Error
	return stats, err
}

// GetPlayerChampionshipHistory returns all reigns for a specific player
func GetPlayerChampionshipHistory(playerID uint) ([]models.ChampionshipReign, error) {
	var reigns []models.ChampionshipReign
	err := config.DB.
		Where("player_id = ?", playerID).
		Order("started_at DESC").
		Find(&reigns).Error

	if err != nil {
		return nil, err
	}

	// Calculate days for each reign
	for i := range reigns {
		reigns[i].Days = reigns[i].CalculateDays()
	}

	return reigns, nil
}
