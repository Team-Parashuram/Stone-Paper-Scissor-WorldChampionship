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
          leaderboardAPI.getTopPlayers(10),
          matchAPI.getAllMatches(3, 0),
          leaderboardAPI.getLeaderboard(1, 0),
        ]);
        const activePlayers = (playersRes.top_players || []).filter(p => p.total_matches > 0).slice(0, 5);
        setTopPlayers(activePlayers);
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

  // Helper to determine podium styles
  const getRankStyles = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-50 border-yellow-200 from-yellow-50 to-white';
      case 1: return 'bg-slate-50 border-slate-200 from-slate-50 to-white';
      case 2: return 'bg-orange-50 border-orange-200 from-orange-50 to-white';
      default: return 'bg-white border-transparent hover:border-gray-100';
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-400 text-yellow-900 ring-4 ring-yellow-100';
      case 1: return 'bg-slate-300 text-slate-800 ring-4 ring-slate-100';
      case 2: return 'bg-orange-300 text-orange-900 ring-4 ring-orange-100';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 bg-white/60 backdrop-blur-sm border-b border-slate-200/60 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Animated Icons */}
          <div className="flex justify-center items-end gap-8 mb-8">
             <div className="relative group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <Image src="/stone.png" alt="Stone" width={72} height={72} className="relative z-10 drop-shadow-lg" />
             </div>
             <div className="relative group hover:-translate-y-4 transition-transform duration-300 -mt-4">
                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <Image src="/paper.png" alt="Paper" width={84} height={84} className="relative z-10 drop-shadow-xl" />
             </div>
             <div className="relative group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute inset-0 bg-pink-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <Image src="/scissor.png" alt="Scissors" width={72} height={72} className="relative z-10 drop-shadow-lg" />
             </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              ThrowDown
            </span>
          </h1>
          <p className="text-2xl font-light text-slate-600 mb-2">
            The Stone Paper Scissors Championship
          </p>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Compete for glory. Track your stats. Climb the ELO ladder.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/leaderboard"
              className="px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-800 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              View Leaderboard
            </Link>
            <Link
              href="/players"
              className="px-8 py-4 bg-white text-slate-700 font-semibold border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Find Players
            </Link>
          </div>
          
          <div className="mt-8">
            <Link href="/rules" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
              <span className="flex items-center justify-center w-5 h-5 rounded-full border border-current text-[10px] font-bold">i</span>
              Official Championship Rules
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Stats Section */}
      <section className="relative z-20 max-w-5xl mx-auto px-4 -mt-16 mb-16">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-6 text-center hover:bg-slate-50/50 transition-colors first:rounded-t-2xl md:first:rounded-l-2xl md:first:rounded-tr-none">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Matches</p>
            <div className="text-4xl font-black text-indigo-600">{totalMatches.toLocaleString()}</div>
          </div>
          <div className="p-6 text-center hover:bg-slate-50/50 transition-colors">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1">Active Fighters</p>
            <div className="text-4xl font-black text-purple-600">{totalPlayers.toLocaleString()}</div>
          </div>
          <div className="p-6 text-center hover:bg-slate-50/50 transition-colors last:rounded-b-2xl md:last:rounded-r-2xl md:last:rounded-bl-none">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1">Highest Rating</p>
            <div className="text-4xl font-black text-pink-600">
              {topPlayers.length > 0 ? Math.round(topPlayers[0]?.elo || 1000) : 1000}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Top Players (Takes up 7 columns) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Leaderboard</h2>
                  <p className="text-sm text-slate-500">Current top ranking fighters</p>
                </div>
                <Link href="/leaderboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  View Full List &rarr;
                </Link>
              </div>

              <div className="p-4 sm:p-6 bg-slate-50/50">
                {topPlayers.length === 0 ? (
                  <EmptyState title="No players yet" description="Be the first to join the arena!" />
                ) : (
                  <div className="space-y-3">
                    {topPlayers.map((player, index) => (
                      <Link
                        key={player.id}
                        href={`/players/${player.id}`}
                        className={`group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 bg-gradient-to-r shadow-sm hover:shadow-md hover:-translate-y-0.5 ${getRankStyles(index)}`}
                      >
                        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-sm ${getRankBadge(index)}`}>
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                            {player.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-0.5">
                            <span className="bg-white/60 px-2 py-0.5 rounded-md border border-black/5">
                              {player.total_matches} Games
                            </span>
                            <span className={`${(player.win_rate ?? 0) > 50 ? 'text-green-600' : 'text-slate-500'}`}>
                              {(player.win_rate ?? 0).toFixed(1)}% WR
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-black text-slate-800 tracking-tight">
                            {Math.round(player.elo)}
                          </p>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ELO</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Matches (Takes up 5 columns) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
              <div className="px-6 py-6 border-b border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Live Feed</h2>
                  <p className="text-sm text-slate-500">Recent arena activity</p>
                </div>
                <Link
                  href="/admin/dashboard"
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>
              
              <div className="p-4 sm:p-6 bg-slate-50/50 flex-1">
                {recentMatches.length === 0 ? (
                  <EmptyState title="Quiet Arena" description="Waiting for the first throw down." />
                ) : (
                  <div className="space-y-4">
                    {recentMatches.map((match) => {
                      const p1Winner = match.player1_score > match.player2_score;
                      const p2Winner = match.player2_score > match.player1_score;
                      const isDraw = match.player1_score === match.player2_score;

                      return (
                        <div key={match.id} className="relative bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                          {/* VS Badge */}
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 z-10">
                            <span className="text-[10px] font-black text-slate-400">VS</span>
                          </div>

                          <div className="flex justify-between items-center relative z-0">
                            {/* Player 1 */}
                            <div className={`flex-1 text-center ${p1Winner ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                              <p className={`font-bold text-sm mb-1 ${p1Winner ? 'text-indigo-700' : 'text-slate-700'}`}>
                                {match.player1_name}
                              </p>
                              <span className={`text-2xl font-black ${p1Winner ? 'text-indigo-600' : 'text-slate-300'}`}>
                                {match.player1_score}
                              </span>
                            </div>

                            {/* Player 2 */}
                            <div className={`flex-1 text-center ${p2Winner ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                              <p className={`font-bold text-sm mb-1 ${p2Winner ? 'text-purple-700' : 'text-slate-700'}`}>
                                {match.player2_name}
                              </p>
                              <span className={`text-2xl font-black ${p2Winner ? 'text-purple-600' : 'text-slate-300'}`}>
                                {match.player2_score}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-center mt-3 pt-3 border-t border-slate-50">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              {new Date(match.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              {' • '}
                              {p1Winner ? 'P1 Victory' : p2Winner ? 'P2 Victory' : 'Draw'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Improved ELO Explanation Section - Light & Clean */}
      <section className="py-24 bg-white border-t border-slate-200 mt-12 relative overflow-hidden">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100">
               The Mechanics
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Mastering the System</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We use a modified ELO rating system designed to reward skill and consistency. Here is how your rating evolves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-slate-50/50 rounded-3xl p-8 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Win & Climb</h3>
              <p className="text-slate-500 leading-relaxed">
                Defeating a higher-ranked opponent yields significantly more points than beating a novice. High risk, high reward.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-slate-50/50 rounded-3xl p-8 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-slate-100 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Score Matters</h3>
              <p className="text-slate-500 leading-relaxed">
                A crushing 10-0 victory boosts your rating faster than a close 5-4 shave. Every single round counts.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-slate-50/50 rounded-3xl p-8 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Calibration</h3>
              <p className="text-slate-500 leading-relaxed">
                New contenders have a higher K-factor (volatility), allowing them to reach their true rank quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white text-slate-400 py-12 text-center text-sm border-t border-slate-100">
        <p>&copy; {new Date().getFullYear()} ThrowDown Championship. All rights reserved.</p>
      </footer>
    </div>
  );
}