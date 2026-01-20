'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { leaderboardAPI } from '@/lib/api';
import { LeaderboardEntry } from '@/lib/types';
import { Card, PageLoader, EmptyState, Pagination, Footer } from '@/components';

const ITEMS_PER_PAGE = 20;

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (page: number) => {
    setIsLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const response = await leaderboardAPI.getLeaderboard(ITEMS_PER_PAGE, offset);
      const filteredPlayers = (response.leaderboard || []).filter(player => player.total_matches > 0);
      setPlayers(filteredPlayers);
      setTotal(response.total);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(currentPage);
  }, [currentPage]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (isLoading && players.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Global Leaderboard</h1>
          <p className="text-gray-600 mt-2">
            Rankings based on ELO rating. {total} players competing.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <Link
            href="/players"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Players
          </Link>
        </div>

        {/* Leaderboard Table */}
        <Card padding="none">
          {players.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No players yet"
                description="Players will appear here once matches are recorded."
              />
            </div>
          ) : (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th className="w-16">Rank</th>
                      <th>Player</th>
                      <th className="text-center">ELO</th>
                      <th className="text-center hidden sm:table-cell">Matches</th>
                      <th className="text-center hidden md:table-cell">W/L/D</th>
                      <th className="text-center">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr key={player.id}>
                        <td>
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
                            {player.rank}
                          </div>
                        </td>
                        <td>
                          <Link
                            href={`/players/${player.id}`}
                            className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                          >
                            {player.name}
                          </Link>
                        </td>
                        <td className="text-center">
                          <span className="font-bold text-green-600">
                            {Math.round(player.elo)}
                          </span>
                        </td>
                        <td className="text-center hidden sm:table-cell text-gray-600">
                          {player.total_matches}
                        </td>
                        <td className="text-center hidden md:table-cell">
                          <span className="text-green-600">{player.matches_won}</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-red-600">{player.matches_lost}</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="text-yellow-600">{player.matches_drawn}</span>
                        </td>
                        <td className="text-center">
                          <span
                            className={`font-medium ${
                              player.win_rate >= 60
                                ? 'text-green-600'
                                : player.win_rate >= 40
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {player.win_rate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <Footer />
    </div>
  );
}
