'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { leaderboardAPI } from '@/lib/api';
import { LeaderboardEntry } from '@/lib/types';
import { Card, PageLoader, EmptyState, Pagination } from '@/components';

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

  // Helper for rank badge styling
  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-700 ring-yellow-200 shadow-yellow-100';
    if (rank === 2) return 'bg-slate-100 text-slate-700 ring-slate-200 shadow-slate-100';
    if (rank === 3) return 'bg-orange-100 text-orange-700 ring-orange-200 shadow-orange-100';
    return 'bg-white text-slate-500 ring-slate-100';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full mix-blend-multiply blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full mix-blend-multiply blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation & Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="group inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-6"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-2 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            Back to Arena
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Global Rankings
              </h1>
              <p className="text-lg text-slate-500 mt-2">
                Compete against <span className="font-semibold text-slate-900">{total}</span> fighters for the top spot.
              </p>
            </div>
            
            <Link
              href="/players"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all font-medium text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Player
            </Link>
          </div>
        </div>

        {/* Leaderboard Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {players.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="No Rankings Yet"
                description="The arena is empty. Be the first to record a match."
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Rank</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fighter</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Rating (ELO)</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Matches</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Record</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {players.map((player, index) => (
                      <tr 
                        key={player.id} 
                        className="group hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ring-1 shadow-sm ${getRankBadgeStyle(index + 1)}`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/players/${player.id}`}
                            className="flex items-center"
                          >
                            <div>
                                <span className="block font-bold text-slate-700 group-hover:text-indigo-600 transition-colors text-base">
                                    {player.name}
                                </span>
                                {(index + 1) <= 3 ? (
                                    <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wide">
                                        Top Tier
                                    </span>
                                ) : player.total_matches > 5 && (
                                    <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wide">
                                        Veteran
                                    </span>
                                )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {player.total_matches <= 5 ? (
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 rounded-md relative group/provisional">
                              <span className="font-mono font-bold text-amber-700">{Math.round(player.elo)}</span>
                              <span className="text-amber-600 text-xs font-bold">?</span>
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/provisional:block z-10 w-36">
                                <div className="bg-slate-900 text-white text-xs py-2 px-3 rounded shadow-lg text-center">
                                  <div className="font-bold mb-1">Provisional Rating</div>
                                  <div className="text-[10px] text-slate-300">Play {6 - player.total_matches} more to establish</div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-md relative group/established">
                              <span className="font-mono font-bold text-slate-900">{Math.round(player.elo)}</span>
                              <span className="text-indigo-500 text-xs">✓</span>
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/established:block z-10 w-28">
                                <div className="bg-slate-900 text-white text-xs py-1.5 px-3 rounded shadow-lg text-center font-semibold">
                                  Established
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                          <span className="text-slate-500 font-medium">{player.total_matches}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center hidden md:table-cell">
                          <div className="flex items-center justify-center gap-2 text-sm font-medium">
                             <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded" title="Wins">{player.matches_won}W</span>
                             <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded" title="Losses">{player.matches_lost}L</span>
                             <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded" title="Draws">{player.matches_drawn}D</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                             <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                <div 
                                    className={`h-full rounded-full ${player.win_rate >= 50 ? 'bg-emerald-500' : 'bg-rose-400'}`} 
                                    style={{ width: `${player.win_rate}%` }}
                                ></div>
                             </div>
                             <span
                                className={`font-bold text-sm ${
                                player.win_rate >= 60 ? 'text-emerald-600' : 
                                player.win_rate >= 40 ? 'text-slate-600' : 'text-rose-600'
                                }`}
                            >
                                {player.win_rate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-6 border-t border-slate-100 bg-slate-50/50">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}