'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser } from '@/types';
import { api } from '@/lib/api';
import { authClient } from '@/lib/auth-client';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: IUser) => void;
  logout: () => void;
  demoLogin: () => Promise<void>;
  adminDemoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('poster_token');
      const storedUser = localStorage.getItem('poster_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        } catch (err: unknown) {
          console.error('Failed to parse stored user:', err);
          localStorage.removeItem('poster_token');
          localStorage.removeItem('poster_user');
        }
      }

      // Check Better Auth Session (e.g. from Google Login)
      try {
        const { data: session } = await authClient.getSession();
        if (session && session.user) {
          // Sync with backend API to obtain a valid JWT token and Database User record
          const syncRes = await api.syncOAuth({
            name: session.user.name,
            email: session.user.email,
            avatarUrl: session.user.image || '',
          });

          if (syncRes.success && syncRes.data) {
            login(syncRes.data.token, syncRes.data.user);
          } else {
            const betterUser: IUser = {
              id: session.user.id,
              name: session.user.name,
              emailOrPhone: session.user.email,
              role: ((session.user as Record<string, unknown>).role as 'user' | 'admin') || 'user',
              avatarUrl: session.user.image || '',
            };
            login('better_auth_session_token', betterUser);
          }
        }
      } catch (err) {
        console.warn('Better Auth session check:', err);
      } finally {
        setLoading(false);
      }

    };

    initAuth();
  }, []);

  const login = (newToken: string, userData: IUser) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('poster_token', newToken);
    localStorage.setItem('poster_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch {
      // Ignore
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('poster_token');
    localStorage.removeItem('poster_user');

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin') || currentPath.startsWith('/history') || currentPath.startsWith('/auth')) {
        window.location.href = '/';
      } else if (currentPath.startsWith('/studio')) {
        window.location.href = '/studio';
      } else {
        window.location.href = '/';
      }
    }
  };

  const demoLogin = async () => {
    try {
      const demoEmail = 'user@politicalposter.bd';
      const demoPassword = 'Password123!';

      let res = await api.login({ emailOrPhone: demoEmail, password: demoPassword });

      if (!res.success) {
        res = await api.register({
          name: 'বীর মুক্তিযোদ্ধা ও সমাজসেবক',
          emailOrPhone: demoEmail,
          password: demoPassword,
        });
      }

      if (res.success && res.data) {
        login(res.data.token, res.data.user);
      }
    } catch (error: unknown) {
      console.warn('Demo login automatic setup:', error);
    }
  };

  const adminDemoLogin = async () => {
    try {
      const adminEmail = 'admin@politicalposter.bd';
      const adminPassword = 'Admin12345!';

      let res = await api.login({ emailOrPhone: adminEmail, password: adminPassword });

      if (res.success && res.data) {
        login(res.data.token, res.data.user);
      }
    } catch (error: unknown) {
      console.warn('Admin demo login failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, demoLogin, adminDemoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
