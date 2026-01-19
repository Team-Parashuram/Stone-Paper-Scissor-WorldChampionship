# Stone-Paper-Scissors World Championship API 🏆

A Go backend API using Fiber framework for managing a Stone-Paper-Scissors championship with an ELO rating system.

## Features

- **ELO Rating System**: Chess-like ELO calculation with score-based adjustments
- **Leaderboard**: Real-time rankings based on ELO ratings
- **Match History**: Complete record of all matches with ELO changes
- **Win Prediction**: Predict match outcomes based on player ratings
- **SQLite Database**: Persistent storage for players and matches

## ELO Calculation

The ELO system considers two factors:

1. **Win Ratio**: `winner_score / total_points` (e.g., 8/15 = 0.533 for a 7-8 game)
2. **Point Difference**: `(winner_score - loser_score) / total_points` (e.g., 1/15 = 0.067)

This means:
- Close games (7-8) result in smaller ELO changes
- Dominant wins (10-2) result in larger ELO changes
- Upsets (low ELO beats high ELO) yield bigger rewards

## Quick Start

```bash
# Install dependencies
go mod tidy

# Run the server
go run main.go
```

Server starts at `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /api/v1/health
```

### Players
```
POST   /api/v1/players          # Create a new player
GET    /api/v1/players          # Get all players
GET    /api/v1/players/:id      # Get player by ID
PUT    /api/v1/players/:id      # Update player name
DELETE /api/v1/players/:id      # Delete player
```

### Matches
```
POST /api/v1/matches            # Submit match result
GET  /api/v1/matches            # Get match history (optional: ?player_id=1&limit=50)
GET  /api/v1/matches/:id        # Get match by ID
```

### Leaderboard
```
GET /api/v1/leaderboard              # Full leaderboard (pagination: ?limit=100&offset=0)
GET /api/v1/leaderboard/top          # Top players (?n=10)
GET /api/v1/leaderboard/rank/:id     # Get player's rank
GET /api/v1/leaderboard/predict      # Predict match (?player1_id=1&player2_id=2)
```

## Example Usage

### Create Players
```bash
curl -X POST http://localhost:3001/api/v1/players \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'

curl -X POST http://localhost:3001/api/v1/players \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob"}'
```

### Submit a Match Result
```bash
# Alice (ID: 1) vs Bob (ID: 2) with score 8-7
curl -X POST http://localhost:3001/api/v1/matches \
  -H "Content-Type: application/json" \
  -d '{"player1_id": 1, "player2_id": 2, "player1_score": 8, "player2_score": 7}'
```

Response:
```json
{
  "message": "Match recorded successfully",
  "match": {
    "id": 1,
    "player1_name": "Alice",
    "player2_name": "Bob",
    "player1_score": 8,
    "player2_score": 7,
    "winner_name": "Alice",
    "player1_elo_change": 17.23,
    "player2_elo_change": -17.23,
    "player1_elo_before": 1000,
    "player2_elo_before": 1000,
    "player1_elo_after": 1017.23,
    "player2_elo_after": 982.77
  }
}
```

### Get Leaderboard
```bash
curl http://localhost:3001/api/v1/leaderboard
```

### Predict Match Outcome
```bash
curl "http://localhost:3001/api/v1/leaderboard/predict?player1_id=1&player2_id=2"
```

## Project Structure

```
├── main.go                 # Application entry point
├── go.mod                  # Go module file
├── config/
│   └── database.go         # Database configuration
├── models/
│   ├── player.go           # Player model
│   └── match.go            # Match model
├── handlers/
│   ├── player.go           # Player handlers
│   ├── match.go            # Match handlers
│   └── leaderboard.go      # Leaderboard handlers
├── services/
│   └── elo.go              # ELO calculation service
├── routes/
│   └── routes.go           # API routes
└── sps_championship.db     # SQLite database (auto-created)
```

## ELO Constants

| Constant | Value | Description |
|----------|-------|-------------|
| Base K   | 32    | Standard K-factor |
| Min K    | 16    | K-factor for experienced players (30+ matches) |
| Max K    | 40    | K-factor for new players (<10 matches) |
| Starting ELO | 1000 | Initial rating for new players |

## Tech Stack

- **Go 1.21+**
- **Fiber v2** - Web framework
- **GORM** - ORM
- **SQLite** - Database

## License

MIT
