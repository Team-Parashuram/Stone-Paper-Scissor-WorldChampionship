// API Service Layer for Stone Paper Scissors application

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateAdminRequest,
  Admin,
  AdminsResponse,
  Player,
  PlayersResponse,
  CreatePlayerRequest,
  Match,
  MatchesResponse,
  CreateMatchRequest,
  PlayerMatchesResponse,
  LeaderboardResponse,
  TopPlayersResponse,
  PlayerRankResponse,
  PredictMatchResponse,
  ChampionshipReign,
  ChampionStats,
  ChampionshipHistoryResponse,
  ChampionStatsResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }

  return data;
}

// ============ AUTH API ============

export const authAPI = {
  // Check if super admin exists
  checkSuperAdminExists: async (): Promise<{ exists: boolean }> => {
    return fetchAPI('/auth/check-super-admin');
  },

  // Register super admin (only works if no super admin exists)
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get current user
  getMe: async (): Promise<{ admin: Admin }> => {
    return fetchAPI('/auth/me');
  },
};

// ============ ADMIN MANAGEMENT API ============

export const adminAPI = {
  // Create a new admin (super admin only)
  createAdmin: async (data: CreateAdminRequest): Promise<{ message: string; admin: Admin }> => {
    return fetchAPI('/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all admins (super admin only)
  getAllAdmins: async (): Promise<AdminsResponse> => {
    return fetchAPI('/admins');
  },

  // Delete an admin (super admin only)
  deleteAdmin: async (id: number): Promise<{ message: string }> => {
    return fetchAPI(`/admins/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ PLAYER API ============

export const playerAPI = {
  // Get all players
  getAllPlayers: async (): Promise<PlayersResponse> => {
    return fetchAPI('/players');
  },

  // Get player by ID
  getPlayer: async (id: number): Promise<Player> => {
    return fetchAPI(`/players/${id}`);
  },

  // Search players
  searchPlayers: async (query: string, limit = 20): Promise<PlayersResponse> => {
    return fetchAPI(`/players/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  // Get player matches
  getPlayerMatches: async (
    id: number,
    limit = 20,
    offset = 0
  ): Promise<PlayerMatchesResponse> => {
    return fetchAPI(`/players/${id}/matches?limit=${limit}&offset=${offset}`);
  },

  // Create player (admin only)
  createPlayer: async (data: CreatePlayerRequest): Promise<{ message: string; player: Player }> => {
    return fetchAPI('/players', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update player (admin only)
  updatePlayer: async (id: number, data: CreatePlayerRequest): Promise<{ message: string; player: Player }> => {
    return fetchAPI(`/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete player (admin only)
  deletePlayer: async (id: number): Promise<{ message: string }> => {
    return fetchAPI(`/players/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ MATCH API ============

export const matchAPI = {
  // Get all matches
  getAllMatches: async (limit = 50, offset = 0, playerId?: number): Promise<MatchesResponse> => {
    let url = `/matches?limit=${limit}&offset=${offset}`;
    if (playerId) {
      url += `&player_id=${playerId}`;
    }
    return fetchAPI(url);
  },

  // Get match by ID
  getMatch: async (id: number): Promise<Match> => {
    return fetchAPI(`/matches/${id}`);
  },

  // Get matches by admin
  getMatchesByAdmin: async (
    adminId: number,
    limit = 50,
    offset = 0
  ): Promise<MatchesResponse> => {
    return fetchAPI(`/matches/admin/${adminId}?limit=${limit}&offset=${offset}`);
  },

  // Create match (admin only)
  createMatch: async (data: CreateMatchRequest): Promise<{ message: string; match: Match }> => {
    return fetchAPI('/matches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Delete match (admin only)
  deleteMatch: async (id: number): Promise<{ message: string }> => {
    return fetchAPI(`/matches/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ LEADERBOARD API ============

export const leaderboardAPI = {
  // Get leaderboard
  getLeaderboard: async (limit = 100, offset = 0): Promise<LeaderboardResponse> => {
    return fetchAPI(`/leaderboard?limit=${limit}&offset=${offset}`);
  },

  // Get top players
  getTopPlayers: async (limit = 10): Promise<TopPlayersResponse> => {
    return fetchAPI(`/leaderboard/top?n=${limit}`);
  },

  // Get player rank
  getPlayerRank: async (id: number): Promise<PlayerRankResponse> => {
    return fetchAPI(`/leaderboard/rank/${id}`);
  },

  // Predict match outcome
  predictMatch: async (player1Id: number, player2Id: number): Promise<PredictMatchResponse> => {
    return fetchAPI(`/leaderboard/predict?player1_id=${player1Id}&player2_id=${player2Id}`);
  },
};

// Championship API
export const championshipAPI = {
  // Get current champion
  getCurrentChampion: async (): Promise<ChampionshipReign> => {
    return fetchAPI('/championships/current');
  },

  // Get championship history
  getHistory: async (limit = 50): Promise<ChampionshipHistoryResponse> => {
    return fetchAPI(`/championships/history?limit=${limit}`);
  },

  // Get champion stats (Hall of Fame)
  getStats: async (): Promise<ChampionStatsResponse> => {
    return fetchAPI('/championships/stats');
  },

  // Get player's championship history
  getPlayerHistory: async (playerId: number): Promise<ChampionshipHistoryResponse> => {
    return fetchAPI(`/championships/player/${playerId}`);
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; service: string }> => {
  return fetchAPI('/health');
};
