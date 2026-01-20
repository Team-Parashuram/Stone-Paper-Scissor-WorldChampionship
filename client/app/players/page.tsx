'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { playerAPI } from '@/lib/api';
import { Player } from '@/lib/types';
import { Card, Input, PageLoader, EmptyState, Footer } from '@/components';

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  const searchPlayers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPlayers([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await playerAPI.searchPlayers(query);
      setPlayers(response.players || []);
      setError(null);
    } catch (err) {
      setError('Failed to search players');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlayers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchPlayers]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Find Players</h1>
          <p className="text-gray-600 mt-2">
            Search for players by name to view their stats and match history.
          </p>
        </div>

        {/* Quick Action */}
        <div className="mb-6 flex justify-center">
          <Link
            href="/leaderboard"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Leaderboard
          </Link>
        </div>

        {/* Search Box */}
        <Card className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by player name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 text-lg py-4"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="text-sm text-gray-500 mt-2">
              Type at least 2 characters to search
            </p>
          )}
        </Card>

        {/* Results */}
        {isLoading ? (
          <PageLoader />
        ) : hasSearched && players.length === 0 ? (
          <Card>
            <EmptyState
              title="No players found"
              description={`No players match "${searchQuery}". Try a different search term.`}
              icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
            />
          </Card>
        ) : players.length > 0 ? (
          <div className="grid gap-4">
            {players.map((player) => (
              <Link key={player.id} href={`/players/${player.id}`}>
                <Card className="player-card hover:border-green-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`rank-badge ${
                          player.rank === 1
                            ? 'gold'
                            : player.rank === 2
                            ? 'silver'
                            : player.rank === 3
                            ? 'bronze'
                            : 'default'
                        }`}
                      >
                        #{player.rank}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {player.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {player.total_matches} matches played
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(player.elo)}
                      </p>
                      <p className="text-sm text-gray-500">ELO Rating</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">
                        {player.matches_won}
                      </p>
                      <p className="text-xs text-gray-500">Wins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-red-600">
                        {player.matches_lost}
                      </p>
                      <p className="text-xs text-gray-500">Losses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-yellow-600">
                        {player.matches_drawn}
                      </p>
                      <p className="text-xs text-gray-500">Draws</p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-lg font-semibold ${
                          (player.win_rate ?? 0) >= 60
                            ? 'text-green-600'
                            : (player.win_rate ?? 0) >= 40
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {(player.win_rate ?? 0).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">Win Rate</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              title="Search for players"
              description="Enter a player name to see their stats, ELO rating, and match history."
              icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            />
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
