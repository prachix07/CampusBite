import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, registerUser, getAuthToken, setAuthToken, clearAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session from localStorage on startup
    const storedToken = getAuthToken();
    const storedUserJson = localStorage.getItem('campusbite_user');

    if (storedToken && storedUserJson) {
      try {
        const parsedUser = JSON.parse(storedUserJson);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (e) {
        clearAuthToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await loginUser({ email, password });
    setIsLoading(false);

    if (res.success && res.data) {
      const { token: jwtToken, user: userData } = res.data;
      setAuthToken(jwtToken);
      localStorage.setItem('campusbite_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return { success: true };
    }

    return {
      success: false,
      error: res.error || 'Invalid email or password',
    };
  };

  const register = async (fullName: string, email: string, password: string, phone?: string) => {
    setIsLoading(true);
    const res = await registerUser({ fullName, email, password, phone });
    setIsLoading(false);

    if (res.success && res.data) {
      const { token: jwtToken, user: userData } = res.data;
      setAuthToken(jwtToken);
      localStorage.setItem('campusbite_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return { success: true };
    }

    return {
      success: false,
      error: res.error || 'Registration failed',
    };
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
