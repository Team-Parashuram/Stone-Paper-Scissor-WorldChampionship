'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { isAuthenticated, isSuperAdmin, isAdmin, admin, logout } = useAuth();
  const pathname = usePathname();

  // Don't show auth buttons on player-facing pages
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex gap-1">
                <Image src="/stone.png" alt="Stone" width={24} height={24} />
                <Image src="/paper.png" alt="Paper" width={24} height={24} />
                <Image src="/scissor.png" alt="Scissors" width={24} height={24} />
              </div>
              <span className="font-bold text-lg text-gray-900">ThrowDown</span>
            </Link>

            {/* Public navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Home
              </Link>
              <Link
                href="/leaderboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/leaderboard'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Leaderboard
              </Link>
              <Link
                href="/players"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname?.startsWith('/players')
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Players
              </Link>
              <Link
                href="/rules"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/rules'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Rules
              </Link>
            </div>
          </div>

          {/* Right side - only show auth controls on admin routes */}
          <div className="flex items-center">
            {isAdminRoute && isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Admin navigation */}
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/admin/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === '/admin/dashboard'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  {isSuperAdmin && (
                    <Link
                      href="/admin/super"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pathname === '/admin/super'
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Super Admin
                    </Link>
                  )}
                </div>

                {/* User info */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{admin?.username}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {admin?.role.replace('_', ' ')}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : isAdminRoute && !isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Admin Login
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname === '/'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Home
          </Link>
          <Link
            href="/leaderboard"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname === '/leaderboard'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Leaderboard
          </Link>
          <Link
            href="/players"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname?.startsWith('/players')
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Players
          </Link>
          <Link
            href="/rules"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname === '/rules'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Rules
          </Link>
          
          {/* Mobile Admin Links */}
          {isAdminRoute && isAuthenticated && (
            <>
              <div className="border-t border-gray-200 my-2" />
              <Link
                href="/admin/dashboard"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === '/admin/dashboard'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              {isSuperAdmin && (
                <Link
                  href="/admin/super"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === '/admin/super'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Super Admin
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
