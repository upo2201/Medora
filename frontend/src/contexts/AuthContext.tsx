import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pw: string) => Promise<void>;
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    emergency_notification_email: string;
    preferred_language?: string;
    emergency_second_language?: string | null;
    full_name_secondary?: string | null;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('medora_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('medora_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, pw: string) => {
    const data = await api.login(email, pw);
    setUser(data.user);
  };

  const register = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    emergency_notification_email: string;
    preferred_language?: string;
    emergency_second_language?: string | null;
    full_name_secondary?: string | null;
  }) => {
    const res = await api.register(data);
    setUser(res.user);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

