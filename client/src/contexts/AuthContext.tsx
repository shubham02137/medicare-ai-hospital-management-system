import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { demoUsers } from '../data/mockData';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://medicare-ai-hospital-management-system.onrender.com/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (data: { email: string; password: string; full_name: string; phone: string; role: UserRole }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount (either localStorage or sessionStorage)
    const storedUser = localStorage.getItem('medicare_user') || sessionStorage.getItem('medicare_user');
    const storedToken = localStorage.getItem('medicare_token') || sessionStorage.getItem('medicare_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('medicare_user');
        localStorage.removeItem('medicare_token');
        sessionStorage.removeItem('medicare_user');
        sessionStorage.removeItem('medicare_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = true): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Try backend first
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (response.ok) {
          const data = await response.json();
          const userData = data.data?.user || data.user;
          const token = data.data?.token || data.token;
          if (userData && token) {
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('medicare_token', token);
            storage.setItem('medicare_user', JSON.stringify(userData));
            setUser(userData);
            setIsLoading(false);
            return true;
          }
        }
      } catch {
        // Backend not available, fall through to demo mode
      }

      // Demo mode - use mock data
      const demoUser = demoUsers.find(u => u.email === email && u.password === password);
      if (demoUser) {
        const { password: _, ...userData } = demoUser;
        const fakeToken = btoa(JSON.stringify({ id: userData.id, role: userData.role, exp: Date.now() + 86400000 }));
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('medicare_token', fakeToken);
        storage.setItem('medicare_user', JSON.stringify(userData));
        setUser(userData);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch {
      setIsLoading(false);
      return false;
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; full_name: string; phone: string; role: UserRole }): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Try backend first
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          const result = await response.json();
          const userData = result.data?.user || result.user;
          const token = result.data?.token || result.token;
          if (userData && token) {
            localStorage.setItem('medicare_token', token);
            localStorage.setItem('medicare_user', JSON.stringify(userData));
            setUser(userData);
            setIsLoading(false);
            return true;
          }
        }
      } catch {
        // Backend not available, fall through to demo mode
      }

      // Demo mode
      const newUser: User = {
        id: String(Date.now()),
        email: data.email,
        role: data.role,
        full_name: data.full_name,
        phone: data.phone,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      const fakeToken = btoa(JSON.stringify({ id: newUser.id, role: newUser.role, exp: Date.now() + 86400000 }));
      localStorage.setItem('medicare_token', fakeToken);
      localStorage.setItem('medicare_user', JSON.stringify(newUser));
      setUser(newUser);
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');
    sessionStorage.removeItem('medicare_token');
    sessionStorage.removeItem('medicare_user');
    setUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      if (localStorage.getItem('medicare_user')) {
        localStorage.setItem('medicare_user', JSON.stringify(updated));
      }
      if (sessionStorage.getItem('medicare_user')) {
        sessionStorage.setItem('medicare_user', JSON.stringify(updated));
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
