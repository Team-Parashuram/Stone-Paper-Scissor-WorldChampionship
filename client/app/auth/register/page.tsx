'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Card, Button, Input } from '@/components';

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [superAdminExists, setSuperAdminExists] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    // Check if super admin exists
    const checkSuperAdmin = async () => {
      try {
        const response = await authAPI.checkSuperAdminExists();
        setSuperAdminExists(response.exists);
        
        // If super admin already exists, redirect to login
        if (response.exists) {
          router.push('/auth/login');
        }
      } catch (err) {
        console.error('Failed to check super admin status');
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkSuperAdmin();
  }, [router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.register({ username, email, password });
      login(response.token, response.admin);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If super admin exists, don't show the form (they'll be redirected)
  if (superAdminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              A Super Admin already exists. Please login instead.
            </p>
            <Link href="/auth/login">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 mb-4">
            <Image src="/stone.png" alt="Stone" width={40} height={40} />
            <Image src="/paper.png" alt="Paper" width={40} height={40} />
            <Image src="/scissor.png" alt="Scissors" width={40} height={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Super Admin</h1>
          <p className="text-gray-600 mt-2">ThrowDown Championship - First Admin Setup</p>
        </div>

        <Card>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Welcome!</strong> You&apos;re creating the first Super Admin account. 
              This account will have full control over the system and can create additional admins.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              hint="Must be at least 6 characters"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Create Super Admin Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Home
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
