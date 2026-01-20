'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { adminAPI, playerAPI, matchAPI } from '@/lib/api';
import { Admin, Player } from '@/lib/types';
import { 
  Navbar, 
  Card, 
  Button, 
  Input, 
  Modal, 
  LoadingSpinner, 
  StatCard,
  EmptyState 
} from '@/components';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { admin, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Admin management state
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  
  // Create admin modal state
  const [createAdminModalOpen, setCreateAdminModalOpen] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [createAdminError, setCreateAdminError] = useState<string | null>(null);

  // Delete admin modal state
  const [deleteAdminModalOpen, setDeleteAdminModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);

  // Player management state
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [deletePlayerModalOpen, setDeletePlayerModalOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false);

  // Stats
  const [totalMatches, setTotalMatches] = useState(0);

  // Load data
  const loadAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const response = await adminAPI.getAllAdmins();
      setAdmins(response.admins || []);
    } catch (err) {
      console.error('Failed to load admins');
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  const loadPlayers = useCallback(async () => {
    setPlayersLoading(true);
    try {
      const response = await playerAPI.getAllPlayers();
      setPlayers(response.players || []);
    } catch (err) {
      console.error('Failed to load players');
    } finally {
      setPlayersLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = await matchAPI.getAllMatches(1, 0);
      setTotalMatches(response.total || 0);
    } catch (err) {
      console.error('Failed to load stats');
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && isAuthenticated && admin?.role !== 'super_admin') {
      router.push('/admin/dashboard');
      return;
    }

    if (isAuthenticated && admin?.role === 'super_admin') {
      loadAdmins();
      loadPlayers();
      loadStats();
    }
  }, [authLoading, isAuthenticated, admin, router, loadAdmins, loadPlayers, loadStats]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    setCreateAdminError(null);

    if (newAdminPassword.length < 6) {
      setCreateAdminError('Password must be at least 6 characters');
      setIsCreatingAdmin(false);
      return;
    }

    try {
      await adminAPI.createAdmin({
        username: newAdminUsername,
        email: newAdminEmail,
        password: newAdminPassword,
      });
      setCreateAdminModalOpen(false);
      setNewAdminUsername('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      loadAdmins();
    } catch (err: any) {
      setCreateAdminError(err.message || 'Failed to create admin');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    
    setIsDeletingAdmin(true);
    try {
      await adminAPI.deleteAdmin(adminToDelete.id);
      setDeleteAdminModalOpen(false);
      setAdminToDelete(null);
      loadAdmins();
    } catch (err: any) {
      alert(err.message || 'Failed to delete admin');
    } finally {
      setIsDeletingAdmin(false);
    }
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;
    
    setIsDeletingPlayer(true);
    try {
      await playerAPI.deletePlayer(playerToDelete.id);
      setDeletePlayerModalOpen(false);
      setPlayerToDelete(null);
      loadPlayers();
      loadStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete player');
    } finally {
      setIsDeletingPlayer(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || admin?.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full mix-blend-multiply blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full mix-blend-multiply blur-3xl opacity-50" />
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
                Super Admin Dashboard
              </h1>
              <p className="text-lg text-slate-500 mt-2">
                Welcome back, <span className="font-bold text-slate-900">{admin?.username}</span>
                <span className="ml-2 px-2.5 py-1 bg-amber-500 text-white text-xs rounded-lg font-semibold shadow-sm">
                  Super Admin
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Admins</p>
                <p className="text-3xl font-black text-slate-900">{admins.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl">👤</div>
            </div>
          </div>
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
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">System Status</p>
                <p className="text-3xl font-black text-emerald-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl">✅</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Management */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-slate-900">Admin Management</h2>
              <button
                onClick={() => setCreateAdminModalOpen(true)}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                + Add Admin
              </button>
            </div>

            <div className="p-6">
              {adminsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : admins.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    title="No admins yet"
                    description="Create your first admin account"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {admins.map((adminUser) => (
                    <div
                      key={adminUser.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {adminUser.username}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                              adminUser.role === 'super_admin'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{adminUser.email}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Created: {new Date(adminUser.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {adminUser.role !== 'super_admin' && (
                          <button
                            onClick={() => {
                              setAdminToDelete(adminUser);
                              setDeleteAdminModalOpen(true);
                            }}
                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                            title="Delete admin"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Player Management */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-slate-900">Player Management</h2>
              <span className="text-sm font-medium text-slate-500">{players.length} players</span>
            </div>

            <div className="p-6">
              {playersLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : players.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    title="No players yet"
                    description="Players will appear here once created"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <span className="text-indigo-700 font-bold text-base">
                                {player.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{player.name}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <span className="font-mono font-semibold">ELO: {Math.round(player.elo)}</span>
                                <span className="text-slate-300">•</span>
                                <span>{player.wins}W {player.losses}L {player.draws}D</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setPlayerToDelete(player);
                              setDeletePlayerModalOpen(true);
                            }}
                            className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                            title="Delete player (cascade)"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <p className="text-xs text-rose-700 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <strong>Warning:</strong> Deleting a player will also delete all their match history.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Admin Modal */}
      <Modal
        isOpen={createAdminModalOpen}
        onClose={() => {
          setCreateAdminModalOpen(false);
          setNewAdminUsername('');
          setNewAdminEmail('');
          setNewAdminPassword('');
          setCreateAdminError(null);
        }}
        title="Create New Admin"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          {createAdminError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{createAdminError}</p>
            </div>
          )}

          <Input
            label="Username"
            value={newAdminUsername}
            onChange={(e) => setNewAdminUsername(e.target.value)}
            placeholder="Enter username"
            required
          />

          <Input
            label="Email"
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="Enter email"
            required
          />

          <Input
            label="Password"
            type="password"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            placeholder="Create password"
            hint="Must be at least 6 characters"
            required
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreateAdminModalOpen(false);
                setNewAdminUsername('');
                setNewAdminEmail('');
                setNewAdminPassword('');
                setCreateAdminError(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isCreatingAdmin}
              className="flex-1"
            >
              Create Admin
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Admin Modal */}
      <Modal
        isOpen={deleteAdminModalOpen}
        onClose={() => {
          setDeleteAdminModalOpen(false);
          setAdminToDelete(null);
        }}
        title="Delete Admin"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this admin account?
          </p>
          {adminToDelete && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{adminToDelete.username}</p>
              <p className="text-sm text-gray-500">{adminToDelete.email}</p>
            </div>
          )}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              ⚠️ This will permanently remove the admin account. Any matches they created will remain.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteAdminModalOpen(false);
                setAdminToDelete(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAdmin}
              isLoading={isDeletingAdmin}
              className="flex-1"
            >
              Delete Admin
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Player Modal */}
      <Modal
        isOpen={deletePlayerModalOpen}
        onClose={() => {
          setDeletePlayerModalOpen(false);
          setPlayerToDelete(null);
        }}
        title="Delete Player"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this player?
          </p>
          {playerToDelete && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">{playerToDelete.name}</p>
              <p className="text-sm text-gray-500">
                ELO: {playerToDelete.elo} • {playerToDelete.wins}W {playerToDelete.losses}L {playerToDelete.draws}D
              </p>
            </div>
          )}
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-800">
              ⚠️ <strong>Cascade Delete:</strong> This will permanently delete the player AND all their match history. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeletePlayerModalOpen(false);
                setPlayerToDelete(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeletePlayer}
              isLoading={isDeletingPlayer}
              className="flex-1"
            >
              Delete Player
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
