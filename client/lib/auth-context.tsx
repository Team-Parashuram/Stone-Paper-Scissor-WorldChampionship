'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Admin, AdminRole } from './types';
import { authAPI } from './api';

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAdmin(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.getMe();
      setAdmin(response.admin);
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('token');
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = (token: string, adminData: Admin) => {
    localStorage.setItem('token', token);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAdmin(null);
  };

  const value: AuthContextType = {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    isSuperAdmin: admin?.role === 'super_admin',
    isAdmin: admin?.role === 'admin' || admin?.role === 'super_admin',
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: AdminRole
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, admin } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return null;
    }

    if (requiredRole === 'super_admin' && admin?.role !== 'super_admin') {
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/dashboard';
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
