// Type definitions for the Rock Paper Scissors application

// Admin roles
export type AdminRole = 'super_admin' | 'admin';

// Admin types
export interface Admin {
  id: number;
  username: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  admin: Admin;
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateAdminRequest {
  username: string;
  email: string;
  password: string;
}

// Player types
export interface Player {
  id: number;
  name: string;
  elo: number;
  rank?: number;
  matches_won: number;
  matches_lost: number;
  matches_drawn: number;
  total_matches: number;
  win_rate?: number;
  // Alternative names for compatibility
  wins?: number;
  losses?: number;
  draws?: number;
}

export interface CreatePlayerRequest {
  name: string;
}

// Match types
export interface Match {
  id: number;
  player1_id: number;
  player2_id: number;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  winner_name?: string;
  player1_elo_change: number;
  player2_elo_change: number;
  player1_elo_before: number;
  player2_elo_before: number;
  player1_elo_after: number;
  player2_elo_after: number;
  created_by_admin_id?: number;
  created_at: string;
}

export interface CreateMatchRequest {
  player1_id?: number;
  player2_id?: number;
  player1_name?: string;
  player2_name?: string;
  player1_score: number;
  player2_score: number;
}

export interface PlayerMatchHistory {
  id: number;
  opponent_id: number;
  opponent_name: string;
  player_score: number;
  opponent_score: number;
  result: 'Win' | 'Loss' | 'Draw';
  elo_change: number;
  elo_before: number;
  elo_after: number;
  created_at: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  id: number;
  name: string;
  elo: number;
  matches_won: number;
  matches_lost: number;
  matches_drawn: number;
  total_matches: number;
  win_rate: number;
}

export interface PredictMatchResponse {
  player1: {
    id: number;
    name: string;
    elo: number;
    win_probability: number;
  };
  player2: {
    id: number;
    name: string;
    elo: number;
    win_probability: number;
  };
  elo_difference: number;
}

// API Response types
export interface PlayersResponse {
  players: Player[];
  total: number;
}

export interface MatchesResponse {
  matches: Match[];
  total: number;
  limit: number;
  offset: number;
}

export interface PlayerMatchesResponse {
  player: string;
  matches: PlayerMatchHistory[];
  total: number;
  limit: number;
  offset: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface TopPlayersResponse {
  top_players: LeaderboardEntry[];
  count: number;
}

export interface AdminsResponse {
  admins: Admin[];
  total: number;
}

export interface PlayerRankResponse {
  player: LeaderboardEntry;
  total_players: number;
  percentile: number;
}
