'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { playerAPI } from '@/lib/api';
import { Player, PlayerMatchHistory } from '@/lib/types';
import { PageLoader, EmptyState, Pagination, Footer, Modal } from '@/components';
import { useAuth } from '@/lib/auth-context';

const ITEMS_PER_PAGE = 10;

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = Number(params.id);
  const { isAdmin } = useAuth();

  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<PlayerMatchHistory[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Delete player handler
  const handleDeletePlayer = async () => {
    setIsDeleting(true);
    try {
      await playerAPI.deletePlayer(playerId);
      router.push('/players?deleted=true');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to delete player');
      setShowDeleteModal(false);
      setIsDeleting(false);
    }
  };

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
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-slate-500">Active Competitor</p>
                  {player.total_matches > 5 && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-200">
                      Veteran
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto">
              {player.total_matches <= 5 ? (
                <div className="flex-1 md:flex-none bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 text-center min-w-[140px] relative group/rating">
                  <div className="flex items-center justify-center gap-1.5">
                    <p className="text-3xl font-black text-amber-700">{Math.round(player.elo)}</p>
                    <span className="text-amber-600 text-xl font-bold">?</span>
                  </div>
                  <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Provisional Rating</p>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/rating:block z-20 w-40">
                    <div className="bg-slate-900 text-white text-xs py-2 px-3 rounded-lg shadow-xl text-center">
                      <div className="font-bold mb-1">Provisional Rating</div>
                      <div className="text-[10px] text-slate-300">Play {6 - player.total_matches} more matches to establish</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 md:flex-none bg-indigo-50 rounded-2xl p-4 border border-indigo-100 text-center min-w-[140px] relative group/rating">
                  <div className="flex items-center justify-center gap-1.5">
                    <p className="text-3xl font-black text-indigo-600">{Math.round(player.elo)}</p>
                    <span className="text-indigo-500 text-base">✓</span>
                  </div>
                  <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">ELO Rating</p>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/rating:block z-20 w-32">
                    <div className="bg-slate-900 text-white text-xs py-2 px-3 rounded-lg shadow-xl text-center font-bold">
                      Established Rating
                    </div>
                  </div>
                </div>
              )}
              {isAdmin && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all font-semibold"
                  title="Delete Player"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete Player"
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Are you sure you want to delete {player?.name}?
              </h3>
              <p className="text-slate-600">
                This action cannot be undone. All match history and statistics for this player will be permanently deleted.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePlayer}
              disabled={isDeleting}
              className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                'Delete Player'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Error Alert */}
      {error && !showDeleteModal && (
        <div className="fixed bottom-4 right-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-lg max-w-md z-50">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-900 mb-1">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}