'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth-api';
import type { AuthResponse } from '@/lib/work-tracker-types';

export interface AuthUser {
  userId: number;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  enterDemo: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'wt_token';
const USER_KEY  = 'wt_user';
const DEMO_KEY  = 'wt_demo';

const DEMO_USER: AuthUser = { userId: 0, name: 'Demo User', email: 'demo@worktracker.ai' };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const isDemo = localStorage.getItem(DEMO_KEY) === 'true';
    if (isDemo) {
      setUser(DEMO_USER);
      setIsDemoMode(true);
    } else {
      const stored = localStorage.getItem(USER_KEY);
      const token  = localStorage.getItem(TOKEN_KEY);
      if (stored && token) {
        try { setUser(JSON.parse(stored)); } catch {
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(TOKEN_KEY);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthResponse = useCallback((data: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    const authUser: AuthUser = { userId: data.userId, name: data.name, email: data.email };
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    handleAuthResponse(data);
    router.push('/work-tracker');
  }, [handleAuthResponse, router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await authApi.register(name, email, password);
    handleAuthResponse(data);
    router.push('/work-tracker');
  }, [handleAuthResponse, router]);

  const enterDemo = useCallback(() => {
    localStorage.setItem(DEMO_KEY, 'true');
    setUser(DEMO_USER);
    setIsDemoMode(true);
    router.push('/work-tracker');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(DEMO_KEY);
    setUser(null);
    setIsDemoMode(false);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isDemoMode, login, register, logout, enterDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
