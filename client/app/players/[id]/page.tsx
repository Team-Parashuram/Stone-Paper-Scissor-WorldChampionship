'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { playerAPI } from '@/lib/api';
import { Player, PlayerMatchHistory } from '@/lib/types';
import { Card, PageLoader, EmptyState, Pagination, StatCard, Footer } from '@/components';

const ITEMS_PER_PAGE = 10;

export default function PlayerDetailPage() {
  const params = useParams();
  const playerId = Number(params.id);

  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<PlayerMatchHistory[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const playerData = await playerAPI.getPlayer(playerId);
        setPlayer(playerData);
      } catch (err) {
        setError('Player not found');
        console.error(err);
      }
    };

    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!playerId) return;
      
      setIsLoading(true);
      try {
        const offset = (currentPage - 1) * ITEMS_PER_PAGE;
        const response = await playerAPI.getPlayerMatches(playerId, ITEMS_PER_PAGE, offset);
        setMatches(response.matches || []);
        setTotalMatches(response.total);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [playerId, currentPage]);

  const totalPages = Math.ceil(totalMatches / ITEMS_PER_PAGE);

  if (!player && isLoading) {
    return <PageLoader />;
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <EmptyState
              title="Player not found"
              description="The player you're looking for doesn't exist."
              action={
                <Link
                  href="/players"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  ← Back to search
                </Link>
              }
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            Home
          </Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/players" className="text-gray-600 hover:text-gray-900 transition-colors">
            Search Players
          </Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{player.name}</span>
        </div>

        {/* Player Header */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`rank-badge w-16 h-16 text-xl ${
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
                <h1 className="text-2xl font-bold text-gray-900">{player.name}</h1>
                <p className="text-gray-500">Rank #{player.rank} in the championship</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="text-center sm:text-right">
                <p className="text-4xl font-bold text-blue-600">{Math.round(player.elo)}</p>
                <p className="text-gray-500">ELO Rating</p>
              </div>
              <Link
                href="/leaderboard"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap"
              >
                View Full Rankings
              </Link>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Matches"
            value={player.total_matches}
            color="gray"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            label="Wins"
            value={player.matches_won}
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Losses"
            value={player.matches_lost}
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Win Rate"
            value={`${(player.win_rate ?? 0).toFixed(1)}%`}
            color={(player.win_rate ?? 0) >= 60 ? 'green' : (player.win_rate ?? 0) >= 40 ? 'yellow' : 'red'}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>

        {/* Match History */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Match History</h2>
            <span className="text-sm text-gray-500">{totalMatches} matches total</span>
          </div>

          {isLoading && matches.length === 0 ? (
            <PageLoader />
          ) : matches.length === 0 ? (
            <EmptyState
              title="No matches yet"
              description="This player hasn't played any matches yet."
            />
          ) : (
            <>
              <div className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`result-badge ${
                          match.result === 'Win'
                            ? 'win'
                            : match.result === 'Loss'
                            ? 'loss'
                            : 'draw'
                        }`}
                      >
                        {match.result}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          vs{' '}
                          <Link
                            href={`/players/${match.opponent_id}`}
                            className="text-green-600 hover:text-green-700"
                          >
                            {match.opponent_name}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-500">{match.created_at}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {match.player_score} - {match.opponent_score}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          match.elo_change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {match.elo_change >= 0 ? '+' : ''}
                        {match.elo_change.toFixed(1)} ELO
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
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
