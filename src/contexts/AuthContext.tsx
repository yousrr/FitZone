import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMe } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  features: string[];
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  subscription: Subscription | null;
  plan: Plan | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await getMe();
      setUser(response.data.user);
      setSubscription(response.data.subscription);
      setPlan(response.data.plan);
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setSubscription(null);
      setPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    refreshAuth();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setSubscription(null);
    setPlan(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        subscription,
        plan,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshAuth,
      }}
    >
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
