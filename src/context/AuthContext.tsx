import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

export enum UserRoles {
  ADMIN = 'ADMIN',
  PLAYER = 'PLAYER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
}

interface User {
  id: string;
  email: string;
  alias: string;
  role: UserRoles;
  registeredAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, alias: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateEmail: (userId: string, newEmail: string) => Promise<void>;
  updateAlias: (userId: string, newAlias: string) => Promise<void>;
  updatePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<void>;
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
    await authService.login(email, password);
    await refreshUser();
  };

  const register = async (email: string, password: string, alias: string) => {
    await authService.register(email, password, alias);
    await login(email, password);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/');
  };

  const updateEmail = async (userId: string, newEmail: string) => {
    await authService.updateEmail(userId, newEmail);
    await refreshUser();
  };

  const updateAlias = async (userId: string, newAlias: string) => {
    await authService.updateAlias(userId, newAlias);
    await refreshUser();
  };

  const updatePassword = async (userId: string, oldPassword: string, newPassword: string) => {
    await authService.updatePassword(userId, oldPassword, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, updateEmail, updateAlias, updatePassword }}>
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
