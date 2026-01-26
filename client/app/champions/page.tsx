'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { championshipAPI } from '@/lib/api';
import { ChampionStats, ChampionshipReign } from '@/lib/types';
import { PageLoader, EmptyState } from '@/components';

export default function ChampionsPage() {
  const [champions, setChampions] = useState<ChampionStats[]>([]);
  const [currentChampion, setCurrentChampion] = useState<ChampionshipReign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChampionData();
  }, []);

  const loadChampionData = async () => {
    setIsLoading(true);
    try {
      const [statsData, currentData] = await Promise.all([
        championshipAPI.getStats(),
        championshipAPI.getCurrentChampion().catch(() => null),
      ]);

      setChampions(statsData.champions || []);
      setCurrentChampion(currentData);
      setError(null);
    } catch (err) {
      setError('Failed to load championship data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Identify the All-Time Greatest (First in the list, as list is sorted by total days)
  const allTimeLegend = champions.length > 0 ? champions[0] : null;

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-200/40 rounded-full mix-blend-multiply blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-100/40 rounded-full mix-blend-multiply blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Navigation & Header */}
        <div className="mb-12">
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
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Hall of Champions
              </h1>
              <p className="text-lg text-slate-500 mt-2 max-w-2xl">
                The official registry of fighters who have ascended to the #1 rank.
              </p>
            </div>
            
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-sm"
            >
              Current Leaderboard
            </Link>
          </div>
        </div>

        {/* Hero Grid: Current Champion & All-Time Legend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            
            {/* 1. Current Champion Card (Amber Theme) */}
            {currentChampion && (
                <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200 shadow-xl shadow-amber-100/50 flex flex-col justify-between overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full">
                                Active Title Holder
                            </span>
                        </div>
                        <Link href={`/players/${currentChampion.player_id}`} className="block">
                            <h3 className="text-3xl font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                                {currentChampion.player.name}
                            </h3>
                        </Link>
                        <p className="text-slate-600 font-medium mt-1">
                            Reigning since {formatDate(currentChampion.started_at)}
                        </p>
                    </div>

                    <div className="relative z-10 mt-8 flex items-end justify-between">
                        <div>
                            <div className="text-5xl font-black text-amber-600 tracking-tighter">
                                {currentChampion.days}
                            </div>
                            <div className="text-xs font-bold uppercase text-amber-800/60 mt-1">Consecutive Days</div>
                        </div>
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-3xl ring-4 ring-amber-100">
                           👑
                        </div>
                    </div>
                </div>
            )}

            {/* 2. All-Time Legend Card (Dark Slate Theme) - SPECIAL HIGHLIGHT */}
            {allTimeLegend && (
                <div className="relative bg-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl flex flex-col justify-between overflow-hidden group text-white">
                    {/* Abstract texture */}
                    <div className="absolute inset-0 opacity-20">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] -mr-10 -mt-10"></div>
                         <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[80px] -ml-10 -mb-10"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/10 border border-white/20 text-indigo-200 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">
                                All-Time Record
                            </span>
                        </div>
                        <Link href={`/players/${allTimeLegend.player_id}`} className="block">
                            <h3 className="text-3xl font-black text-white group-hover:text-indigo-300 transition-colors">
                                {allTimeLegend.player_name}
                            </h3>
                        </Link>
                        <p className="text-slate-400 font-medium mt-1">
                            The longest total time spent at #1
                        </p>
                    </div>

                    <div className="relative z-10 mt-8 flex items-end justify-between">
                        <div>
                            <div className="text-5xl font-black text-indigo-400 tracking-tighter">
                                {allTimeLegend.total_days}
                            </div>
                            <div className="text-xs font-bold uppercase text-slate-400 mt-1">Total Days Reigned</div>
                        </div>
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md text-3xl border border-white/10">
                           🏆
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Champions List */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : champions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm">
            <EmptyState
              title="No champions yet"
              description="Be the first to reach #1 and claim your place in history!"
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Historical Records</h2>
                <p className="text-slate-500 text-xs font-medium">Ranked by total domination days</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-20">Rank</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Player</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Total Days</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Longest Streak</th>
                    <th className="px-8 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Titles</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">First Crowned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {champions.map((champion, index) => (
                    <tr
                      key={champion.player_id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Rank Icon */}
                      <td className="px-8 py-5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-indigo-100 text-indigo-700' :
                            index === 1 ? 'bg-slate-100 text-slate-700' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'text-slate-400 bg-slate-50'
                        }`}>
                           {index + 1}
                        </div>
                      </td>

                      {/* Player Name */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/players/${champion.player_id}`}
                            className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                          >
                            {champion.player_name}
                          </Link>
                          {currentChampion?.player_id === champion.player_id && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide rounded border border-green-200">
                              Active
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Days */}
                      <td className="px-8 py-5 text-center">
                        <div className="font-mono font-bold text-slate-700">
                          {champion.total_days}
                        </div>
                      </td>

                      {/* Longest Reign */}
                      <td className="px-8 py-5 text-center hidden md:table-cell">
                        <div className="text-sm font-medium text-slate-500">
                          {champion.longest_reign_days} days
                        </div>
                      </td>

                      {/* Total Reigns */}
                      <td className="px-8 py-5 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {champion.total_reigns}
                        </span>
                      </td>

                      {/* First Crowned */}
                      <td className="px-8 py-5 text-left hidden lg:table-cell">
                        <div className="text-sm text-slate-400 font-medium">
                          {formatDate(champion.first_crowned)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}