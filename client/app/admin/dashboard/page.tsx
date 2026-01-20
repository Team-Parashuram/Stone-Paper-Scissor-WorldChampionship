'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { matchAPI, playerAPI, leaderboardAPI } from '@/lib/api';
import { Match, Player } from '@/lib/types';
import { 
  Navbar, 
  Card, 
  Button, 
  Input, 
  Select, 
  Modal, 
  LoadingSpinner, 
  StatCard,
  EmptyState,
  Pagination 
} from '@/components';

type MatchResult = 'player1' | 'player2' | 'draw';

export default function AdminDashboard() {
  const router = useRouter();
  const { admin, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Match creation state
  const [players, setPlayers] = useState<Player[]>([]);
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [matchResult, setMatchResult] = useState<MatchResult | ''>('');
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchSuccess, setMatchSuccess] = useState<string | null>(null);

  // Match history state
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [totalMatches, setTotalMatches] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 5;

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Prediction state
  const [prediction, setPrediction] = useState<{
    player1WinChance: number;
    player2WinChance: number;
    player1Name?: string;
    player2Name?: string;
  } | null>(null);

  // Player creation modal state
  const [createPlayerModalOpen, setCreatePlayerModalOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);

  // Load data
  const loadPlayers = useCallback(async () => {
    try {
      const response = await playerAPI.getAllPlayers();
      setPlayers(response.players || []);
    } catch (err) {
      console.error('Failed to load players');
    }
  }, []);

  const loadMatches = useCallback(async () => {
    setMatchesLoading(true);
    try {
      const offset = (currentPage - 1) * matchesPerPage;
      const response = await matchAPI.getAllMatches(matchesPerPage, offset);
      setMatches(response.matches || []);
      setTotalMatches(response.total || 0);
    } catch (err) {
      console.error('Failed to load matches');
    } finally {
      setMatchesLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated) {
      loadPlayers();
      loadMatches();
    }
  }, [authLoading, isAuthenticated, router, loadPlayers, loadMatches]);

  // Get prediction when both players are selected
  useEffect(() => {
    const getPrediction = async () => {
      if (player1Id && player2Id && player1Id !== player2Id) {
        try {
          const result = await leaderboardAPI.predictMatch(
            parseInt(player1Id),
            parseInt(player2Id)
          );
          const p1 = players.find(p => p.id === parseInt(player1Id));
          const p2 = players.find(p => p.id === parseInt(player2Id));
          setPrediction({
            player1WinChance: result.player1.win_probability / 100,
            player2WinChance: result.player2.win_probability / 100,
            player1Name: p1?.name,
            player2Name: p2?.name,
          });
        } catch (err) {
          setPrediction(null);
        }
      } else {
        setPrediction(null);
      }
    };
    getPrediction();
  }, [player1Id, player2Id, players]);

  const handleSubmitMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMatchError(null);
    setMatchSuccess(null);

    if (!player1Id || !player2Id || !player1Score || !player2Score) {
      setMatchError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    if (player1Id === player2Id) {
      setMatchError('Please select two different players');
      setIsSubmitting(false);
      return;
    }

    const p1Score = parseInt(player1Score);
    const p2Score = parseInt(player2Score);

    if (isNaN(p1Score) || isNaN(p2Score) || p1Score < 0 || p2Score < 0) {
      setMatchError('Scores must be valid positive numbers');
      setIsSubmitting(false);
      return;
    }

    try {
      await matchAPI.createMatch({
        player1_id: parseInt(player1Id),
        player2_id: parseInt(player2Id),
        player1_score: p1Score,
        player2_score: p2Score,
      });

      setMatchSuccess('Match recorded successfully!');
      setPlayer1Id('');
      setPlayer2Id('');
      setMatchResult('');
      setPlayer1Score('');
      setPlayer2Score('');
      setPrediction(null);
      
      // Refresh data
      loadMatches();
      loadPlayers();
      
      // Clear success message after 3 seconds
      setTimeout(() => setMatchSuccess(null), 3000);
    } catch (err: any) {
      setMatchError(err.message || 'Failed to submit match');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMatch = async () => {
    if (!matchToDelete) return;
    
    setIsDeleting(true);
    try {
      await matchAPI.deleteMatch(matchToDelete.id);
      setDeleteModalOpen(false);
      setMatchToDelete(null);
      loadMatches();
      loadPlayers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete match');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    setIsCreatingPlayer(true);
    try {
      await playerAPI.createPlayer({ name: newPlayerName.trim() });
      setNewPlayerName('');
      setCreatePlayerModalOpen(false);
      loadPlayers();
    } catch (err: any) {
      alert(err.message || 'Failed to create player');
    } finally {
      setIsCreatingPlayer(false);
    }
  };

  const getResultText = (match: Match) => {
    if (match.player1_score === match.player2_score) return 'Draw';
    const winner = match.player1_score > match.player2_score ? match.player1_name : match.player2_name;
    return `${winner} won`;
  };

  const getResultBadge = (match: Match) => {
    if (match.player1_score === match.player2_score) {
      return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Draw</span>;
    }
    if (match.player1_score > match.player2_score) {
      return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{match.player1_name} Won</span>;
    }
    return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{match.player2_name} Won</span>;
  };

  const totalPages = Math.ceil(totalMatches / matchesPerPage);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const resultOptions = [
    { value: '', label: 'Select result' },
    { value: 'player1', label: 'Player 1 Won' },
    { value: 'player2', label: 'Player 2 Won' },
    { value: 'draw', label: 'Draw' },
  ];

  const playerOptions = [
    { value: '', label: 'Select player' },
    ...players.map(p => ({ value: String(p.id), label: `${p.name} (ELO: ${p.elo})` })),
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full mix-blend-multiply blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full mix-blend-multiply blur-3xl opacity-50" />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Header */}
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

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-lg text-slate-500 mt-2">
                Welcome back, <span className="font-bold text-slate-900">{admin?.username}</span>
                {admin?.role === 'super_admin' && (
                  <span className="ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-lg font-semibold">
                    Super Admin
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Players</p>
                <p className="text-3xl font-black text-slate-900">{players.length}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl">👥</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Matches</p>
                <p className="text-3xl font-black text-slate-900">{totalMatches}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl">🎮</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Your Role</p>
                <p className="text-3xl font-black text-slate-900">{admin?.role === 'super_admin' ? 'Super' : 'Admin'}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl">🔐</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Match Creation Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-slate-900">Record New Match</h2>
              <button
                type="button"
                onClick={() => setCreatePlayerModalOpen(true)}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                + Add Player
              </button>
            </div>

            <form onSubmit={handleSubmitMatch} className="p-6 space-y-5">
              {matchError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <p className="text-sm font-medium text-rose-600">{matchError}</p>
                </div>
              )}

              {matchSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-sm font-medium text-emerald-700">{matchSuccess}</p>
                </div>
              )}

              {/* Player 1 */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Player 1</h3>
                <Select
                  label="Player"
                  options={playerOptions}
                  value={player1Id}
                  onChange={(e) => setPlayer1Id(e.target.value)}
                  required
                />
              </div>

              {/* VS Indicator */}
              <div className="flex justify-center">
                <div className="px-6 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-black tracking-wider">VS</div>
              </div>

              {/* Player 2 */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Player 2</h3>
                <Select
                  label="Player"
                  options={playerOptions}
                  value={player2Id}
                  onChange={(e) => setPlayer2Id(e.target.value)}
                  required
                />
              </div>

              {/* Match Scores */}
              <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Match Scores</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Player 1 Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={player1Score}
                      onChange={(e) => setPlayer1Score(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono font-bold text-lg"
                      placeholder="10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Player 2 Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={player2Score}
                      onChange={(e) => setPlayer2Score(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono font-bold text-lg"
                      placeholder="8"
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-amber-700 mt-3 font-medium flex items-center gap-1">
                  <span>💡</span> Score difference affects ELO changes - bigger wins earn more points!
                </p>
              </div>

              {/* Prediction Display */}
              {prediction && (
                <div className="p-5 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">🔮 Win Probability</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-900">{prediction.player1Name}</span>
                      <span className="font-black text-indigo-600 text-lg">{(prediction.player1WinChance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${prediction.player1WinChance * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-900">{prediction.player2Name}</span>
                      <span className="font-black text-indigo-600 text-lg">{(prediction.player2WinChance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${prediction.player2WinChance * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none text-base"
              >
                {isSubmitting ? 'Recording...' : '✓ Record Match'}
              </button>
            </form>
          </div>

          {/* Recent Matches */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-white">
              <h2 className="text-lg font-bold text-slate-900">Match History</h2>
            </div>

            <div className="p-6">
              {matchesLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : matches.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    title="No matches yet"
                    description="Record your first match using the form"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 text-sm font-medium">
                            <span className="font-bold text-slate-900">{match.player1_name}</span>
                            <div className="px-2 py-0.5 bg-slate-200 rounded text-slate-600 text-xs font-mono font-bold">
                              {match.player1_score}-{match.player2_score}
                            </div>
                            <span className="font-bold text-slate-900">{match.player2_name}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            {getResultBadge(match)}
                            <span className="text-xs font-medium text-slate-400">
                              ELO: ±{Math.abs(match.player1_elo_change).toFixed(0)}
                            </span>
                            <span className="text-xs text-slate-300">•</span>
                            <span className="text-xs font-medium text-slate-400">
                              {new Date(match.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setMatchToDelete(match);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                          title="Delete match"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  {totalPages > 1 && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Match Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMatchToDelete(null);
        }}
        title="Delete Match"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this match? This will also reverse the ELO changes.
          </p>
          {matchToDelete && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <strong>{matchToDelete.player1_name}</strong> vs{' '}
                <strong>{matchToDelete.player2_name}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Result: {getResultText(matchToDelete)}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setMatchToDelete(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteMatch}
              isLoading={isDeleting}
              className="flex-1"
            >
              Delete Match
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Player Modal */}
      <Modal
        isOpen={createPlayerModalOpen}
        onClose={() => {
          setCreatePlayerModalOpen(false);
          setNewPlayerName('');
        }}
        title="Add New Player"
      >
        <form onSubmit={handleCreatePlayer} className="space-y-4">
          <Input
            label="Player Name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Enter player name"
            required
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreatePlayerModalOpen(false);
                setNewPlayerName('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isCreatingPlayer}
              className="flex-1"
            >
              Create Player
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
