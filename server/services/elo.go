package services

import (
	"math"
)

const (
	// BaseK is the base K-factor for ELO calculations (like in chess)
	BaseK = 32.0
	// MinK is the minimum K-factor
	MinK = 16.0
	// MaxK is the maximum K-factor for newer players
	MaxK = 40.0
)

// EloResult contains the result of an ELO calculation
type EloResult struct {
	Player1NewElo    float64
	Player2NewElo    float64
	Player1EloChange float64
	Player2EloChange float64
}

// CalculateExpectedScore calculates the expected score for a player
// Based on the chess ELO formula: E = 1 / (1 + 10^((Rb - Ra) / 400))
func CalculateExpectedScore(playerElo, opponentElo float64) float64 {
	return 1.0 / (1.0 + math.Pow(10, (opponentElo-playerElo)/400.0))
}

// CalculateScoreFactor calculates a factor based on the match score
// This considers:
// 1. Win ratio: winnerScore / totalPoints
// 2. Point difference: difference / totalPoints
func CalculateScoreFactor(winnerScore, loserScore int) float64 {
	totalPoints := winnerScore + loserScore
	if totalPoints == 0 {
		return 1.0
	}

	// Win ratio: how dominant was the winner (e.g., 8/15 = 0.533)
	winRatio := float64(winnerScore) / float64(totalPoints)

	// Point difference ratio: margin of victory (e.g., 1/15 = 0.067)
	pointDiffRatio := float64(winnerScore-loserScore) / float64(totalPoints)

	// Combined factor:
	// - A close game (7-8) gives a smaller bonus
	// - A dominant win (10-2) gives a larger bonus
	// Scale factor between 0.9 and 1.3 based on dominance (reduced range for better balance)
	scoreFactor := 0.9 + (winRatio * 0.2) + (pointDiffRatio * 0.3)

	return math.Min(1.3, math.Max(0.9, scoreFactor))
}

// GetKFactor returns an appropriate K-factor based on player's total matches
// Newer players have higher K-factors for faster rating adjustment
func GetKFactor(totalMatches int) float64 {
	if totalMatches < 10 {
		return MaxK
	} else if totalMatches < 30 {
		return BaseK
	}
	return MinK
}

// CalculateElo calculates new ELO ratings for both players after a match
// Uses chess-style ELO with modifications for score-based adjustment
func CalculateElo(player1Elo, player2Elo float64, player1Score, player2Score int, player1Matches, player2Matches int) EloResult {
	// Calculate expected scores
	expected1 := CalculateExpectedScore(player1Elo, player2Elo)
	expected2 := CalculateExpectedScore(player2Elo, player1Elo)

	// Determine actual scores (1 for win, 0.5 for draw, 0 for loss)
	var actual1, actual2 float64
	var scoreFactor float64

	if player1Score > player2Score {
		actual1 = 1.0
		actual2 = 0.0
		scoreFactor = CalculateScoreFactor(player1Score, player2Score)
	} else if player2Score > player1Score {
		actual1 = 0.0
		actual2 = 1.0
		scoreFactor = CalculateScoreFactor(player2Score, player1Score)
	} else {
		// Draw
		actual1 = 0.5
		actual2 = 0.5
		scoreFactor = 1.0
	}

	// Get K-factors for each player
	k1 := GetKFactor(player1Matches)
	k2 := GetKFactor(player2Matches)

	// Calculate ELO changes with score factor
	player1Change := k1 * scoreFactor * (actual1 - expected1)
	player2Change := k2 * scoreFactor * (actual2 - expected2)

	return EloResult{
		Player1NewElo:    math.Round((player1Elo+player1Change)*100) / 100,
		Player2NewElo:    math.Round((player2Elo+player2Change)*100) / 100,
		Player1EloChange: math.Round(player1Change*100) / 100,
		Player2EloChange: math.Round(player2Change*100) / 100,
	}
}

// CalculateWinProbability returns the probability of player1 winning based on ELO
func CalculateWinProbability(player1Elo, player2Elo float64) float64 {
	return CalculateExpectedScore(player1Elo, player2Elo) * 100
}
