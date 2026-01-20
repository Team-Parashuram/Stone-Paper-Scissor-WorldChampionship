import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              About
            </h3>
            <p className="text-sm text-gray-600">
              ThrowDown - Official Stone Paper Scissors World Championship tracker. Monitor player rankings,
              match results, and ELO ratings in real-time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/players" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Search Players
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Administration
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              Admin access required to create matches and manage players.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            © {currentYear} ThrowDown Championship. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
