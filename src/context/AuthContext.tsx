import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  alias: string;
  role: string;
  registratedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, alias: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getMe();
        console.log('AuthContext: User refreshed:', userData);
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('AuthContext: Error refreshing user:', error);
      setUser(null);
      await authService.logout();
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('AuthContext: Attempting login...');
    await authService.login(email, password);
    console.log('AuthContext: Login success, refreshing user...');
    await refreshUser();
  };

  const register = async (email: string, password: string, alias: string) => {
    console.log('AuthContext: Attempting registration...');
    await authService.register(email, password, alias);
    console.log('AuthContext: Registration success, logging in...');
    await login(email, password);
  };

  const logout = async () => {
    console.log('AuthContext: Logging out...');
    await authService.logout();
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
