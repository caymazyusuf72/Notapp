"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('kinetic-auth');
      if (storedAuth) {
        setIsAuthenticated(JSON.parse(storedAuth));
      }
    } catch (error) {
      console.error('Failed to load auth status from localStorage', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (user: string, pass: string): boolean => {
    // For demonstration purposes, using hardcoded credentials.
    // In a real app, this would involve an API call.
    if (user === 'admin' && pass === 'password') {
      try {
        localStorage.setItem('kinetic-auth', JSON.stringify(true));
      } catch (error) {
        console.error('Failed to save auth status to localStorage', error);
      }
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    try {
      localStorage.removeItem('kinetic-auth');
    } catch (error) {
      console.error('Failed to remove auth status from localStorage', error);
    }
    setIsAuthenticated(false);
    router.push('/login');
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
