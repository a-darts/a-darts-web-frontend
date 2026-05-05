import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';

interface User {
  id: string;
  email: string;
  alias: string;
  // Add other user fields as needed
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      authService.logout();
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

  const logout = async () => {
    console.log('AuthContext: Logging out...');
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
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
