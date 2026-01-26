package main

import (
	"fmt"
	"log"
	"stone-paper-scissors/config"
	"stone-paper-scissors/models"
	"time"
)

// BackfillChampionshipHistory reconstructs championship reigns from match history
func BackfillChampionshipHistory() error {
	db := config.DB

	// Get all matches ordered by time
	var matches []models.Match
	if err := db.Order("created_at ASC").Find(&matches).Error; err != nil {
		return fmt.Errorf("failed to fetch matches: %v", err)
	}

	if len(matches) == 0 {
		log.Println("No matches found, nothing to backfill")
		return nil
	}

	// Track player ELOs over time
	playerElos := make(map[uint]float64)
	
	// Get all players with their current stats
	var players []models.Player
	if err := db.Find(&players).Error; err != nil {
		return fmt.Errorf("failed to fetch players: %v", err)
	}

	// Initialize all players with starting ELO
	for _, player := range players {
		playerElos[player.ID] = 1000.0
	}

	var currentChampionID uint
	var championshipStart time.Time
	var reigns []models.ChampionshipReign

	log.Printf("Processing %d matches to reconstruct championship history...\n", len(matches))

	// Process each match chronologically
	for i, match := range matches {
		// Update ELOs based on this match
		playerElos[match.Player1ID] = match.Player1EloAfter
		playerElos[match.Player2ID] = match.Player2EloAfter

		// Find current leader
		var topPlayerID uint
		var topElo float64 = 0

		for playerID, elo := range playerElos {
			if elo > topElo {
				topElo = elo
				topPlayerID = playerID
			}
		}

		// Check if champion changed
		if i == 0 {
			// First match - initialize champion
			currentChampionID = topPlayerID
			championshipStart = match.CreatedAt
			log.Printf("Initial champion: Player ID %d at %s\n", currentChampionID, championshipStart.Format("2006-01-02"))
		} else if topPlayerID != currentChampionID {
			// Champion changed!
			endTime := match.CreatedAt

			// Save previous champion's reign
			reign := models.ChampionshipReign{
				PlayerID:  currentChampionID,
				StartedAt: championshipStart,
				EndedAt:   &endTime,
			}
			reigns = append(reigns, reign)

			log.Printf("Champion changed: Player %d -> Player %d at %s (reign lasted %d days)\n",
				currentChampionID, topPlayerID, endTime.Format("2006-01-02"),
				int(endTime.Sub(championshipStart).Hours()/24))

			// Start new reign
			currentChampionID = topPlayerID
			championshipStart = match.CreatedAt
		}
	}

	// Add current champion's ongoing reign
	reigns = append(reigns, models.ChampionshipReign{
		PlayerID:  currentChampionID,
		StartedAt: championshipStart,
		EndedAt:   nil, // Ongoing
	})

	log.Printf("Current champion: Player ID %d since %s (%d days)\n",
		currentChampionID, championshipStart.Format("2006-01-02"),
		int(time.Since(championshipStart).Hours()/24))

	// Clear existing championship data
	if err := db.Exec("DELETE FROM championship_reigns").Error; err != nil {
		return fmt.Errorf("failed to clear existing championship data: %v", err)
	}

	// Insert all reigns in a transaction
	tx := db.Begin()
	for _, reign := range reigns {
		if err := tx.Create(&reign).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create reign record: %v", err)
		}
	}
	tx.Commit()

	log.Printf("✅ Successfully backfilled %d championship reigns!\n", len(reigns))
	
	// Show summary
	log.Println("\n=== Championship Summary ===")
	for i, reign := range reigns {
		var player models.Player
		db.First(&player, reign.PlayerID)
		
		days := 0
		if reign.EndedAt != nil {
			days = int(reign.EndedAt.Sub(reign.StartedAt).Hours() / 24)
			log.Printf("%d. %s - %d days (%s to %s)\n",
				i+1, player.Name, days,
				reign.StartedAt.Format("2006-01-02"),
				reign.EndedAt.Format("2006-01-02"))
		} else {
			days = int(time.Since(reign.StartedAt).Hours() / 24)
			log.Printf("%d. %s - %d days (Current Champion since %s) 👑\n",
				i+1, player.Name, days,
				reign.StartedAt.Format("2006-01-02"))
		}
	}

	return nil
}

func main() {
	// Load environment and connect to database
	config.ConnectDatabase()

	// Run auto-migration to ensure table exists
	if err := config.DB.AutoMigrate(&models.ChampionshipReign{}); err != nil {
		log.Fatalf("Failed to migrate: %v", err)
	}

	// Backfill championship history
	if err := BackfillChampionshipHistory(); err != nil {
		log.Fatalf("Backfill failed: %v", err)
	}

	log.Println("\n🎉 Championship history backfill complete!")
}
