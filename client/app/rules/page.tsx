'use client';

import Link from 'next/link';
import { Card, Footer } from '@/components';

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Championship Rules
          </h1>
          <p className="text-lg text-gray-600">
            Official rules and regulations for Stone Paper Scissors World Championship
          </p>
        </div>

        {/* Game Rules */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Rules</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Basic Gameplay</h3>
              <p className="text-gray-600 mb-2">
                Stone Paper Scissors is a hand game played between two players. Each player simultaneously forms one of three shapes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li><strong>Stone (Rock):</strong> A closed fist</li>
                <li><strong>Paper:</strong> An open hand</li>
                <li><strong>Scissors:</strong> A fist with the index and middle fingers extended</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Winning Conditions</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Stone crushes Scissors</li>
                <li>Scissors cuts Paper</li>
                <li>Paper covers Stone</li>
                <li>If both players choose the same shape, it's a draw</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Match Format</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Official matches consist of multiple rounds</li>
                <li>Players must throw simultaneously on the count of three</li>
                <li>No premature or delayed throws are permitted</li>
                <li>Match results are recorded by authorized administrators</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* ELO Rating System */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ELO Rating System</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How ELO Works</h3>
              <p className="text-gray-600 mb-2">
                The championship uses a chess-style ELO rating system to rank players. Key points:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>All players start with an ELO rating of <strong>1000</strong></li>
                <li>Winning against higher-rated players gives more ELO points</li>
                <li>Losing against lower-rated players costs more ELO points</li>
                <li>The margin of victory affects ELO changes (dominant wins = more points)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">K-Factor System</h3>
              <p className="text-gray-600 mb-2">
                The K-factor determines how much ELO changes after each match:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li><strong>New Players (0-9 matches):</strong> K = 40 (higher volatility)</li>
                <li><strong>Intermediate (10-29 matches):</strong> K = 32</li>
                <li><strong>Experienced (30+ matches):</strong> K = 16 (stable ratings)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Score Factor</h3>
              <p className="text-gray-600 mb-2">
                Match dominance affects ELO changes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li><strong>Close matches (60-70% win rate):</strong> Smaller ELO changes</li>
                <li><strong>Dominant wins (80%+ win rate):</strong> Larger ELO changes</li>
                <li>This rewards consistent performance and dominant victories</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Ranking System */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ranking & Leaderboard</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Rankings</h3>
              <p className="text-gray-600 mb-2">
                Players are ranked based on their current ELO rating:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Rankings update in real-time after each match</li>
                <li>Top 3 players receive special badge recognition (Gold, Silver, Bronze)</li>
                <li>Tied ELO ratings are ordered by total matches played</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Statistics Tracked</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li><strong>ELO Rating:</strong> Current skill rating</li>
                <li><strong>Total Matches:</strong> Number of official matches played</li>
                <li><strong>Win/Loss/Draw Record:</strong> Complete match history</li>
                <li><strong>Win Rate:</strong> Percentage of matches won</li>
                <li><strong>Global Rank:</strong> Position in the leaderboard</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Fair Play */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Fair Play & Conduct</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Player Conduct</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>All players must throw simultaneously</li>
                <li>No changing throws after seeing opponent's choice</li>
                <li>Respect your opponent and match officials</li>
                <li>Disputes are resolved by the match administrator</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Match Integrity</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Only authorized admins can record official matches</li>
                <li>All matches are permanently recorded in the system</li>
                <li>ELO changes can be reversed if a match is deleted by admin</li>
                <li>Match history is public and transparent</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Admin Information */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">For Administrators</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Match Recording</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Admins can create new players and record match results</li>
                <li>Match predictions are generated based on current ELO ratings</li>
                <li>Record the winner or mark as a draw</li>
                <li>ELO changes are calculated and applied automatically</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Super Admin Privileges</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Can create and manage other admin accounts</li>
                <li>Full access to player and match management</li>
                <li>Can delete matches (ELO changes are automatically reversed)</li>
                <li>Can update player information</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/leaderboard"
            className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-center"
          >
            View Leaderboard
          </Link>
          <Link
            href="/players"
            className="px-6 py-3 bg-white text-gray-900 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Search Players
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
