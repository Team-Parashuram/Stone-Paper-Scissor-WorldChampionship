'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { leaderboardAPI, matchAPI } from '@/lib/api';
import { LeaderboardEntry, Match } from '@/lib/types';
import { Card, PageLoader, EmptyState, LoadingSpinner } from '@/components';

export default function Home() {
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load players
    const fetchPlayers = async () => {
      try {
        const playersRes = await leaderboardAPI.getTopPlayers(10);
        const activePlayers = (playersRes.top_players || []).filter(p => p.total_matches > 0).slice(0, 5);
        setTopPlayers(activePlayers);
      } catch (err) {
        console.error('Failed to load players:', err);
      } finally {
        setIsLoadingPlayers(false);
      }
    };

    // Load matches
    const fetchMatches = async () => {
      try {
        const matchesRes = await matchAPI.getAllMatches(3, 0);
        setRecentMatches(matchesRes.matches || []);
        setTotalMatches(matchesRes.total || 0);
      } catch (err) {
        console.error('Failed to load matches:', err);
      } finally {
        setIsLoadingMatches(false);
      }
    };

    // Load stats
    const fetchStats = async () => {
      try {
        const leaderboardRes = await leaderboardAPI.getLeaderboard(1, 0);
        setTotalPlayers(leaderboardRes.total || 0);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    // Fetch all in parallel but update independently
    fetchPlayers();
    fetchMatches();
    fetchStats();
  }, []);

  // Helper to determine podium styles - kept professional/subtle
  const getRankStyles = (index: number) => {
    switch (index) {
      case 0: return 'bg-amber-50/50 border-amber-200';
      case 1: return 'bg-slate-50/50 border-slate-200';
      case 2: return 'bg-orange-50/50 border-orange-200';
      default: return 'bg-white border-transparent hover:border-slate-200';
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return 'bg-amber-100 text-amber-800 ring-1 ring-amber-200';
      case 1: return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
      case 2: return 'bg-orange-100 text-orange-800 ring-1 ring-orange-200';
      default: return 'bg-white text-slate-500 border border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Background - Subtle Professional Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-60"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-30"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-28 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Icons */}
          <div className="flex justify-center items-end gap-6 mb-10 opacity-90">
             <div className="relative group hover:-translate-y-2 transition-transform duration-300">
                <Image src="/stone.png" alt="Stone" width={64} height={64} className="drop-shadow-md grayscale-[0.2] group-hover:grayscale-0 transition-all" />
             </div>
             <div className="relative group hover:-translate-y-4 transition-transform duration-300 -mt-6">
                <Image src="/paper.png" alt="Paper" width={76} height={76} className="drop-shadow-lg grayscale-[0.2] group-hover:grayscale-0 transition-all" />
             </div>
             <div className="relative group hover:-translate-y-2 transition-transform duration-300">
                <Image src="/scissor.png" alt="Scissors" width={64} height={64} className="drop-shadow-md grayscale-[0.2] group-hover:grayscale-0 transition-all" />
             </div>
          </div>

          {/* Title - Clean, Solid, Professional */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6">
            ThrowDown
          </h1>
          
          <p className="text-xl md:text-2xl font-medium text-slate-500 mb-3">
            The Official Stone Paper Scissors Championship
          </p>
          <p className="text-base text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            A professional arena for the world's oldest game. Track stats, calculate ELO, and claim your rank.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/leaderboard"
              className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-lg shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-sm tracking-wide"
            >
              View Standings
            </Link>
            <Link
              href="/champions"
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold rounded-lg shadow-lg hover:from-amber-600 hover:to-yellow-600 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-sm tracking-wide"
            >
              🏆 Hall of Champions
            </Link>
            <Link
              href="/players"
              className="px-8 py-3.5 bg-white text-slate-700 font-bold border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-sm tracking-wide"
            >
              Find Players
            </Link>
          </div>
          
          <div className="mt-10">
            <Link href="/rules" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-indigo-600 transition-colors">
              <span className="flex items-center justify-center w-4 h-4 rounded-full border border-current text-[10px]">i</span>
              Official Ruleset
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Stats Section */}
      <section className="relative z-20 max-w-4xl mx-auto px-4 -mt-14 mb-16">
        <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="p-6 text-center hover:bg-slate-50/30 transition-colors">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Matches</p>
            {isLoadingMatches ? (
              <div className="flex justify-center"><LoadingSpinner size="sm" /></div>
            ) : (
              <div className="text-3xl font-black text-slate-900">{totalMatches.toLocaleString()}</div>
            )}
          </div>
          <div className="p-6 text-center hover:bg-slate-50/30 transition-colors">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Active Fighters</p>
            {isLoadingStats ? (
              <div className="flex justify-center"><LoadingSpinner size="sm" /></div>
            ) : (
              <div className="text-3xl font-black text-slate-900">{totalPlayers.toLocaleString()}</div>
            )}
          </div>
          <div className="p-6 text-center hover:bg-slate-50/30 transition-colors">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Highest Rating</p>
            {isLoadingPlayers ? (
              <div className="flex justify-center"><LoadingSpinner size="sm" /></div>
            ) : (
              <div className="text-3xl font-black text-indigo-600">
                {topPlayers.length > 0 ? Math.round(topPlayers[0]?.elo || 1000) : 1000}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Top Players (Takes up 7 columns) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Leaderboard</h2>
                </div>
                <Link href="/leaderboard" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                  View Full List &rarr;
                </Link>
              </div>

              <div className="p-4 bg-slate-50/30 min-h-[400px]">
                {isLoadingPlayers ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <LoadingSpinner />
                  </div>
                ) : topPlayers.length === 0 ? (
                  <EmptyState title="No players yet" description="Be the first to join the arena!" />
                ) : (
                  <div className="space-y-2">
                    {topPlayers.map((player, index) => (
                      <Link
                        key={player.id}
                        href={`/players/${player.id}`}
                        className={`group relative flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-[1px] ${getRankStyles(index)}`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold shadow-sm ${getRankBadge(index)}`}>
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                            {player.name}
                          </p>
                          <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-0.5">
                            <span>{player.total_matches} Games</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className={`${(player.win_rate ?? 0) > 50 ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {(player.win_rate ?? 0).toFixed(1)}% WR
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          {player.total_matches <= 5 ? (
                            <div className="relative group/rating">
                              <div className="bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                                <span className="text-base font-black text-amber-700">
                                  {Math.round(player.elo)}
                                </span>
                                <span className="text-[10px] font-bold text-amber-600 ml-1">?</span>
                              </div>
                              <div className="absolute right-0 top-full mt-1 hidden group-hover/rating:block z-10 w-32">
                                <div className="bg-slate-900 text-white text-xs py-1 px-2 rounded shadow-lg">
                                  Provisional Rating
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative group/rating">
                              <div className="bg-white/50 px-2 py-1 rounded-md border border-black/5">
                                <span className="text-base font-black text-slate-700">
                                  {Math.round(player.elo)}
                                </span>
                              </div>
                              <div className="absolute right-0 top-full mt-1 hidden group-hover/rating:block z-10 w-28">
                                <div className="bg-slate-900 text-white text-xs py-1 px-2 rounded shadow-lg">
                                  Established
                                </div>
                              </div>
                            </div>
                          )}
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Live Feed</h2>
                </div>
                <Link
                  href="/admin/dashboard"
                  className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors"
                >
                  View All
                </Link>
              </div>
              
              <div className="p-4 bg-slate-50/30 flex-1">
                {isLoadingMatches ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <LoadingSpinner />
                  </div>
                ) : recentMatches.length === 0 ? (
                  <EmptyState title="Quiet Arena" description="Waiting for the first throw down." />
                ) : (
                  <div className="space-y-3">
                    {recentMatches.map((match) => {
                      const p1Winner = match.player1_score > match.player2_score;
                      const p2Winner = match.player2_score > match.player1_score;

                      return (
                        <div key={match.id} className="relative bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-slate-300 transition-colors">
                          <div className="flex justify-between items-center text-sm">
                            {/* Player 1 */}
                            <div className={`flex-1 text-center ${p1Winner ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                              {match.player1_name}
                            </div>

                            {/* Score */}
                            <div className="px-4 flex flex-col items-center">
                                <span className="text-xs font-bold text-slate-300 uppercase mb-1">VS</span>
                                <div className="bg-slate-100 px-3 py-1 rounded-md text-slate-900 font-mono font-bold tracking-widest">
                                    {match.player1_score}-{match.player2_score}
                                </div>
                            </div>

                            {/* Player 2 */}
                            <div className={`flex-1 text-center ${p2Winner ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                              {match.player2_name}
                            </div>
                          </div>
                          
                          <div className="text-center mt-3 pt-2 border-t border-slate-50">
                            <span className="text-[10px] font-medium text-slate-400">
                              {new Date(match.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              {' • '}
                              {p1Winner ? `${match.player1_name} Won` : p2Winner ? `${match.player2_name} Won` : 'Draw'}
                            </span>
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

      {/* ELO Explanation Section - Professional & Clean */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Chess-Inspired Rating System</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              Our modified ELO algorithm rewards skill, punishes complacency, and makes every match count.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-7 rounded-xl border-2 border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">High Stakes</h3>
              <p className="text-base text-slate-700 leading-relaxed">
                Defeating a higher-ranked opponent yields <span className="font-bold text-emerald-600">massive gains</span>. Upset victories can catapult you up the rankings.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-7 rounded-xl border-2 border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Margin Matters</h3>
              <p className="text-base text-slate-700 leading-relaxed">
                A <span className="font-bold text-amber-600">10-2 domination</span> earns more than a narrow 5-4 win. Show your superiority to climb faster.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-7 rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Quick Calibration</h3>
              <p className="text-base text-slate-700 leading-relaxed">
                New players have <span className="font-bold text-indigo-600">higher volatility</span>, meaning rapid climbs (or falls) until your true skill level stabilizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white text-slate-400 py-10 text-center text-sm border-t border-slate-100">
        <p>&copy; {new Date().getFullYear()} ThrowDown Championship. All rights reserved.</p>
      </footer>
    </div>
  );
}