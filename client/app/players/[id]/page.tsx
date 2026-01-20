'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { playerAPI } from '@/lib/api';
import { Player, PlayerMatchHistory } from '@/lib/types';
import { PageLoader, EmptyState, Pagination, Footer } from '@/components';

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

  // Helper for rank badge colors
  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900 shadow-yellow-200 ring-yellow-100';
    if (rank === 2) return 'bg-slate-300 text-slate-800 shadow-slate-300 ring-slate-200';
    if (rank === 3) return 'bg-orange-300 text-orange-900 shadow-orange-200 ring-orange-100';
    return 'bg-white text-slate-600 shadow-slate-100 ring-slate-100';
  };

  if (!player && isLoading) {
    return <PageLoader />;
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Fighter Not Found</h2>
          <p className="text-slate-500 mb-6">The player profile you are looking for does not exist.</p>
          <Link
            href="/players"
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors w-full"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-100/40 rounded-full mix-blend-multiply blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-100/40 rounded-full mix-blend-multiply blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm font-medium text-slate-500 mb-8">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <svg className="w-4 h-4 mx-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/players" className="hover:text-indigo-600 transition-colors">Fighters</Link>
          <svg className="w-4 h-4 mx-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900">{player.name}</span>
        </nav>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-16 -mt-16 z-0"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 flex-shrink-0 flex items-center justify-center rounded-2xl text-2xl font-black ring-4 shadow-lg ${getRankBadgeStyle(player.rank ?? 0)}`}>
                #{player.rank ?? 0}
              </div>
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  Fighter Profile
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{player.name}</h1>
                <p className="text-slate-500 mt-1">Active Competitor</p>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="flex-1 md:flex-none bg-indigo-50 rounded-2xl p-4 border border-indigo-100 text-center min-w-[140px]">
                <p className="text-3xl font-black text-indigo-600">{Math.round(player.elo)}</p>
                <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">ELO Rating</p>
              </div>
              <Link
                href="/leaderboard"
                className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-white transition-all"
                title="View Leaderboard"
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Matches</span>
            </div>
            <p className="text-2xl font-black text-slate-800">{player.total_matches}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase text-emerald-600/60 tracking-wider">Victories</span>
            </div>
            <p className="text-2xl font-black text-emerald-600">{player.matches_won}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-rose-200 transition-colors">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase text-rose-600/60 tracking-wider">Defeats</span>
            </div>
            <p className="text-2xl font-black text-rose-600">{player.matches_lost}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase text-indigo-600/60 tracking-wider">Win Rate</span>
            </div>
            <p className="text-2xl font-black text-indigo-600">{(player.win_rate ?? 0).toFixed(1)}%</p>
          </div>
        </div>

        {/* Match History Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Battle History</h2>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
              {totalMatches} Recorded
            </span>
          </div>

          {isLoading && matches.length === 0 ? (
            <div className="p-12">
               <PageLoader />
            </div>
          ) : matches.length === 0 ? (
            <div className="p-12">
                <EmptyState
                title="No history found"
                description="This fighter has not participated in any matches yet."
                />
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="group px-6 py-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-5">
                    {/* Result Badge */}
                    <div className={`w-16 flex-shrink-0 text-center py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border
                      ${match.result === 'Win' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        match.result === 'Loss' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                        'bg-slate-50 text-slate-600 border-slate-200'}`
                    }>
                      {match.result}
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-slate-500 text-sm mb-0.5">
                        <span>VS</span>
                        <Link
                          href={`/players/${match.opponent_id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {match.opponent_name}
                        </Link>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(match.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-8 pl-20 sm:pl-0">
                    <div className="text-right">
                       <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Score</span>
                       <span className="text-xl font-black text-slate-800 tracking-tight">
                         {match.player_score} - {match.opponent_score}
                       </span>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rating</span>
                      <span
                        className={`font-bold text-base ${
                          match.elo_change > 0 ? 'text-emerald-600' : 
                          match.elo_change < 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {match.elo_change > 0 ? '+' : ''}{match.elo_change.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-slate-50/50 p-6 border-t border-slate-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}