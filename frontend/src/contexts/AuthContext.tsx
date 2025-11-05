import { createContext, useContext, useState, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';


const host = "http://localhost:3000"; // Backend server URL
type Admin = {
  email: string;
  name: string;
  token?: string;
} | null;

type AuthContextType = {
  admin: Admin;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize axios interceptors for token handling
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${host}/api/admin/register`, {
        name,
        email,
        password
      });

      setAdmin(response.data.admin);
      toast.success('Registration successful!');
      return response.data;
    } catch (err) {
      handleAuthError(err, 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${host}/api/admin/login`, {
        email,
        password
      });

      const { token } = response.data;
      localStorage.setItem('adminToken', token);
      
      // Decode token to get admin info (without sensitive data)
      const adminData = {
        email,
        name: email.split('@')[0], // Or fetch from backend if available
        token
      };

      setAdmin(adminData);
      toast.success('Login successful!');
      return response.data;
    } catch (err) {
      handleAuthError(err, 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    toast.success('Logged out successfully');
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('adminToken');
  };

  const handleAuthError = (err: unknown, defaultMessage: string) => {
    const axiosError = err as AxiosError<{ message: string }>;
    const errorMessage = axiosError.response?.data?.message || defaultMessage;
    setError(errorMessage);
    toast.error(errorMessage);
  };

  return (
    <AuthContext.Provider value={{ 
      admin, 
      loading, 
      error, 
      register, 
      login, 
      logout,
      isAuthenticated
    }}>
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