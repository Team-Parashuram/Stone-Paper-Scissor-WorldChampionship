'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="font-semibold">{admin?.username}</span>
            <span className="ml-2 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full">
              Super Admin
            </span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Admins"
            value={admins.length}
            icon="👤"
          />
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
            title="System Status"
            value="Active"
            icon="✅"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Management */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Admin Management</h2>
              <Button
                size="sm"
                onClick={() => setCreateAdminModalOpen(true)}
              >
                + Add Admin
              </Button>
            </div>

            {adminsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : admins.length === 0 ? (
              <EmptyState
                title="No admins yet"
                description="Create your first admin account"
                icon="👤"
              />
            ) : (
              <div className="space-y-3">
                {admins.map((adminUser) => (
                  <div
                    key={adminUser.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {adminUser.username}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            adminUser.role === 'super_admin'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{adminUser.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(adminUser.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {adminUser.role !== 'super_admin' && (
                        <button
                          onClick={() => {
                            setAdminToDelete(adminUser);
                            setDeleteAdminModalOpen(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete admin"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Player Management */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Player Management</h2>
              <span className="text-sm text-gray-500">{players.length} players</span>
            </div>

            {playersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : players.length === 0 ? (
              <EmptyState
                title="No players yet"
                description="Players will appear here once created"
                icon="👥"
              />
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                          <span className="text-blue-700 font-bold text-sm">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{player.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>ELO: {player.elo}</span>
                            <span>•</span>
                            <span>{player.wins}W {player.losses}L {player.draws}D</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPlayerToDelete(player);
                          setDeletePlayerModalOpen(true);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete player (cascade)"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                ⚠️ <strong>Warning:</strong> Deleting a player will also delete all their match history.
              </p>
            </div>
          </Card>
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
