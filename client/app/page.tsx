'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { leaderboardAPI, matchAPI } from '@/lib/api';
import { LeaderboardEntry, Match } from '@/lib/types';
import { Card, PageLoader, EmptyState } from '@/components';

export default function Home() {
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, matchesRes, leaderboardRes] = await Promise.all([
          leaderboardAPI.getTopPlayers(5),
          matchAPI.getAllMatches(5, 0),
          leaderboardAPI.getLeaderboard(1, 0), // Get just to fetch totals
        ]);
        setTopPlayers(playersRes.top_players || []);
        setRecentMatches(matchesRes.matches || []);
        setTotalPlayers(leaderboardRes.total || 0);
        setTotalMatches(matchesRes.total || 0);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <div className="flex justify-center gap-6 mb-8">
              <Image
                src="/stone.png"
                alt="Stone"
                width={64}
                height={64}
                className="opacity-90"
              />
              <Image
                src="/paper.png"
                alt="Paper"
                width={64}
                height={64}
                className="opacity-90"
              />
              <Image
                src="/scissor.png"
                alt="Scissors"
                width={64}
                height={64}
                className="opacity-90"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              ThrowDown
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-2">
              Stone Paper Scissors Championship
            </p>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-8">
              Track matches, monitor ELO ratings, and follow player performance
              in competitive Stone Paper Scissors.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
              <Link
                href="/leaderboard"
                className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                View Leaderboard
              </Link>
              <Link
                href="/players"
                className="px-6 py-3 bg-white text-gray-900 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Search Players
              </Link>
            </div>
            <Link
              href="/rules"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Championship Rules
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {totalMatches.toLocaleString()}
            </div>
            <p className="text-gray-600">Matches Played</p>
          </Card>
          <Card className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {totalPlayers.toLocaleString()}
            </div>
            <p className="text-gray-600">Active Players</p>
          </Card>
          <Card className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {topPlayers.length > 0 ? Math.round(topPlayers[0]?.elo || 1000) : 1000}
            </div>
            <p className="text-gray-600">Highest ELO</p>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Players */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top Players</h2>
              <Link
                href="/leaderboard"
                className="text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                View All →
              </Link>
            </div>
            {topPlayers.length === 0 ? (
              <EmptyState
                title="No players yet"
                description="Players will appear here once matches are recorded."
              />
            ) : (
              <div className="space-y-4">
                {topPlayers.filter(player => player.total_matches > 0).map((player, index) => (
                  <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`rank-badge ${
                        index === 0
                          ? 'gold'
                          : index === 1
                          ? 'silver'
                          : index === 2
                          ? 'bronze'
                          : 'default'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-500">
                        {player.total_matches} matches · {(player.win_rate ?? 0).toFixed(1)}% win rate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{Math.round(player.elo)}</p>
                      <p className="text-xs text-gray-500">ELO</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Matches */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Matches</h2>
            </div>
            {recentMatches.length === 0 ? (
              <EmptyState
                title="No matches yet"
                description="Matches will appear here once they are recorded."
              />
            ) : (
              <div className="space-y-4">
                {recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            match.player1_score > match.player2_score
                              ? 'text-green-600'
                              : 'text-gray-700'
                          }`}
                        >
                          {match.player1_name}
                        </span>
                        <span className="text-gray-400">vs</span>
                        <span
                          className={`font-semibold ${
                            match.player2_score > match.player1_score
                              ? 'text-green-600'
                              : 'text-gray-700'
                          }`}
                        >
                          {match.player2_name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(match.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-center px-4">
                      <span className="text-lg font-bold text-gray-900">
                        {match.player1_score} - {match.player2_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* How ELO Works Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            How ELO Rating Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Win & Gain</h3>
              <p className="text-gray-600 text-sm">
                Beat a higher-ranked opponent and gain more ELO points. Upsets are rewarded!
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Score Matters</h3>
              <p className="text-gray-600 text-sm">
                Winning margins affect ELO changes. Dominate to earn more!
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fair System</h3>
              <p className="text-gray-600 text-sm">
                New players have higher K-factor for faster rating adjustments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-2 mb-4">
            <Image src="/stone.png" alt="Rock" width={24} height={24} />
            <Image src="/paper.png" alt="Paper" width={24} height={24} />
            <Image src="/scissor.png" alt="Scissors" width={24} height={24} />
          </div>
          <p className="text-gray-400">
            Rock Paper Scissors World Championship Tracker
          </p>
          <p className="text-sm text-gray-500 mt-2">
            © 2026 RPS Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
