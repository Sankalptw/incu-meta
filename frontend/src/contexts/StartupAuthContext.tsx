// src/contexts/StartupAuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const host = "http://localhost:3000"; // Backend server URL

type Startup = {
  email: string;
  name: string;
  token?: string;
} | null;

type StartupAuthContextType = {
  startup: Startup;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
};

const StartupAuthContext = createContext<StartupAuthContextType | undefined>(undefined);

export const StartupAuthProvider = ({ children }: { children: ReactNode }) => {
  const [startup, setStartup] = useState<Startup>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Attach Axios interceptor only once
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('startupToken');
      if (token) {
        config.headers.token = token; // ✅ This will match your backend
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Load startup from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('startupToken');
    const name = localStorage.getItem('startupName');
    const email = localStorage.getItem('startupEmail');

    if (token && name && email) {
      setStartup({ token, name, email });
    }
  }, []);

  const handleAuthError = (err: unknown, defaultMessage: string) => {
    const error = err as AxiosError<{ message: string }>;
    const message = error.response?.data?.message || defaultMessage;
    setError(message);
    toast.error(message);
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${host}/api/user/register`, { name, email, password });
      const { token } = response.data;

      localStorage.setItem('startupToken', token);
      localStorage.setItem('startupName', name);
      localStorage.setItem('startupEmail', email);

      setStartup({ token, name, email });
      toast.success('Registration successful!');
    } catch (err) {
      handleAuthError(err, 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${host}/api/user/login`, { email, password });
      const { token, name } = response.data;

      localStorage.setItem('startupToken', token);
      localStorage.setItem('startupName', name);
      localStorage.setItem('startupEmail', email);

      setStartup({ token, name, email });
      toast.success('Login successful!');
    } catch (err) {
      handleAuthError(err, 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('startupToken');
    localStorage.removeItem('startupName');
    localStorage.removeItem('startupEmail');
    setStartup(null);
    toast.success('Logout successful!');
  };

  const isAuthenticated = () => !!startup?.token;

  return (
    <StartupAuthContext.Provider
      value={{
        startup,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </StartupAuthContext.Provider>
  );
};

export const useStartupAuth = () => {
  const context = useContext(StartupAuthContext);
  if (context === undefined) {
    throw new Error('useStartupAuth must be used within a StartupAuthProvider');
  }
  return context;
};
