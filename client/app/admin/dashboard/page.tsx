'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchSuccess, setMatchSuccess] = useState<string | null>(null);

  // Match history state
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [totalMatches, setTotalMatches] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 10;

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

    if (!player1Id || !player2Id || !matchResult) {
      setMatchError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    if (player1Id === player2Id) {
      setMatchError('Please select two different players');
      setIsSubmitting(false);
      return;
    }

    // Convert result to scores
    let player1Score = 0;
    let player2Score = 0;
    if (matchResult === 'player1') {
      player1Score = 1;
      player2Score = 0;
    } else if (matchResult === 'player2') {
      player1Score = 0;
      player2Score = 1;
    } else {
      player1Score = 0;
      player2Score = 0;
    }

    try {
      await matchAPI.createMatch({
        player1_id: parseInt(player1Id),
        player2_id: parseInt(player2Id),
        player1_score: player1Score,
        player2_score: player2Score,
      });

      setMatchSuccess('Match recorded successfully!');
      setPlayer1Id('');
      setPlayer2Id('');
      setMatchResult('');
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="font-semibold">{admin?.username}</span>
            {admin?.role === 'super_admin' && (
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                Super Admin
              </span>
            )}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Players"
            value={players.length}
            icon="👥"
          />
          <StatCard
            title="Total Matches"
            value={totalMatches}
            icon="🎮"
          />
          <StatCard
            title="Your Role"
            value={admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            icon="🔐"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Match Creation Form */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Record New Match</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreatePlayerModalOpen(true)}
              >
                + Add Player
              </Button>
            </div>

            <form onSubmit={handleSubmitMatch} className="space-y-4">
              {matchError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{matchError}</p>
                </div>
              )}

              {matchSuccess && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">{matchSuccess}</p>
                </div>
              )}

              {/* Player 1 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Player 1</h3>
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
                <span className="text-2xl font-bold text-gray-400">VS</span>
              </div>

              {/* Player 2 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Player 2</h3>
                <Select
                  label="Player"
                  options={playerOptions}
                  value={player2Id}
                  onChange={(e) => setPlayer2Id(e.target.value)}
                  required
                />
              </div>

              {/* Match Result */}
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Match Result</h3>
                <Select
                  label="Winner"
                  options={resultOptions}
                  value={matchResult}
                  onChange={(e) => setMatchResult(e.target.value as MatchResult | '')}
                  required
                />
              </div>

              {/* Prediction Display */}
              {prediction && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Win Probability</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{prediction.player1Name}</span>
                      <span className="font-semibold text-blue-600">{(prediction.player1WinChance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-blue-600"
                        style={{ width: `${prediction.player1WinChance * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{prediction.player2Name}</span>
                      <span className="font-semibold text-blue-600">{(prediction.player2WinChance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-blue-600"
                        style={{ width: `${prediction.player2WinChance * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
              >
                Record Match
              </Button>
            </form>
          </Card>

          {/* Recent Matches */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Matches</h2>

            {matchesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : matches.length === 0 ? (
              <EmptyState
                title="No matches yet"
                description="Record your first match using the form"
                icon="🎮"
              />
            ) : (
              <div className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{match.player1_name}</span>
                          <span className="text-gray-400">vs</span>
                          <span className="font-medium">{match.player2_name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getResultBadge(match)}
                          <span className="text-xs text-gray-400">
                            ELO: ±{Math.abs(match.player1_elo_change).toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setMatchToDelete(match);
                          setDeleteModalOpen(true);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete match"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="mt-4 pt-4 border-t">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>
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
