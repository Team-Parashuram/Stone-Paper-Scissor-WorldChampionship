'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { playerAPI } from '@/lib/api';
import { Player } from '@/lib/types';
import { Card, Input, PageLoader, EmptyState } from '@/components';

export default function PlayersPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Check if redirected after deletion
  useEffect(() => {
    if (searchParams.get('deleted') === 'true') {
      setShowSuccessAlert(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setShowSuccessAlert(false), 5000);
    }
  }, [searchParams]);

  // Debounced search
  const searchPlayers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPlayers([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await playerAPI.searchPlayers(query);
      setPlayers(response.players || []);
      setError(null);
    } catch (err) {
      setError('Failed to search players');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPlayers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchPlayers]);

  // Helper for rank colors
  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-400 text-yellow-900 ring-4 ring-yellow-100';
      case 2: return 'bg-slate-300 text-slate-800 ring-4 ring-slate-100';
      case 3: return 'bg-orange-300 text-orange-900 ring-4 ring-orange-100';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-100/30 rounded-full mix-blend-multiply blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-100/30 rounded-full mix-blend-multiply blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="group inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-2 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            Back to Arena
          </Link>

          <Link
            href="/leaderboard"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            View Top Rankings →
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Find a Fighter</h1>
          <p className="text-lg text-slate-500">
            Search by name to view stats, match history, and ELO rating.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative mb-12 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-200"></div>
          <div className="relative bg-white rounded-xl shadow-xl shadow-slate-200/50">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </div>
            <Input
              type="text"
              placeholder="Enter player name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-5 text-lg bg-transparent border-0 focus:ring-0 placeholder:text-slate-400"
            />
          </div>
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="absolute -bottom-6 left-1 text-xs font-medium text-amber-500">
              Type at least 2 characters...
            </p>
          )}
        </div>

        {/* Results Area */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-12">
               <PageLoader />
            </div>
          ) : hasSearched && players.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12">
               <EmptyState
                title="No fighters found"
                description={`We couldn't find anyone named "${searchQuery}". Check the spelling or try another name.`}
              />
            </div>
          ) : players.length > 0 ? (
            <div className="grid gap-5">
              {players.map((player) => (
                <Link key={player.id} href={`/players/${player.id}`} className="block">
                  <div className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 transform hover:-translate-y-1">
                    
                    {/* Top Row: Identity & Rank */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg shadow-sm ${getRankBadgeColor(player.rank ?? 0)}`}>
                          #{player.rank}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {player.name}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium">
                            {player.total_matches} Games Played
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                           <p className="text-2xl font-black text-slate-800 group-hover:text-indigo-600">
                             {Math.round(player.elo)}
                           </p>
                           <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ELO Rating</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-5">
                      <div className="text-center p-2 rounded-lg bg-emerald-50/50 group-hover:bg-emerald-50 transition-colors">
                        <p className="text-lg font-bold text-emerald-600">{player.matches_won}</p>
                        <p className="text-[10px] font-bold uppercase text-emerald-400">Wins</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-rose-50/50 group-hover:bg-rose-50 transition-colors">
                        <p className="text-lg font-bold text-rose-600">{player.matches_lost}</p>
                        <p className="text-[10px] font-bold uppercase text-rose-400">Losses</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors">
                        <p className="text-lg font-bold text-slate-600">{player.matches_drawn}</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Draws</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-indigo-50/30 group-hover:bg-indigo-50/80 transition-colors">
                        <p
                          className={`text-lg font-bold ${
                            (player.win_rate ?? 0) >= 50
                              ? 'text-indigo-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {(player.win_rate ?? 0).toFixed(0)}%
                        </p>
                        <p className="text-[10px] font-bold uppercase text-indigo-300">Win Rate</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // Initial State
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Awaiting Input</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-1">
                    Enter a player's name above to reveal their combat statistics.
                </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed bottom-4 right-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 shadow-lg max-w-md z-50 animate-in slide-in-from-bottom">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-emerald-900 mb-1">Player Deleted</h4>
              <p className="text-sm text-emerald-700">The player has been successfully removed from the championship.</p>
            </div>
            <button
              onClick={() => setShowSuccessAlert(false)}
              className="text-emerald-400 hover:text-emerald-600 transition-colors"
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