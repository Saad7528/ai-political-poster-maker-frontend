'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, userData: IUser) => void;
  logout: () => void;
  demoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('poster_token');
    const storedUser = localStorage.getItem('poster_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err: unknown) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('poster_token');
        localStorage.removeItem('poster_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, userData: IUser) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('poster_token', newToken);
    localStorage.setItem('poster_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('poster_token');
    localStorage.removeItem('poster_user');
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, demoLogin }}>
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
