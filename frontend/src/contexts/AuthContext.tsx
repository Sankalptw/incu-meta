import { createContext, useContext, useState, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';


const host = "http://localhost:3000"; // Backend server URL

// ✅ UPDATED: Admin type with new fields
type Admin = {
  email: string;
  name: string;
  token?: string;
  userType?: 'admin' | 'incubator'; // ✅ NEW
  specialization?: string; // ✅ NEW
  location?: string; // ✅ NEW
  website?: string; // ✅ NEW
} | null;

type AuthContextType = {
  admin: Admin;
  loading: boolean;
  error: string | null;
  // ✅ UPDATED: Register function signature
  register: (
    name: string,
    email: string,
    password: string,
    userType?: string,
    specialization?: string,
    location?: string,
    website?: string
  ) => Promise<void>;
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

  // ✅ UPDATED: Register function with new parameters
  const register = async (
    name: string,
    email: string,
    password: string,
    userType: string = 'admin',
    specialization?: string,
    location?: string,
    website?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${host}/api/admin/register`, {
        name,
        email,
        password,
        userType, // ✅ NEW
        specialization, // ✅ NEW
        location, // ✅ NEW
        website // ✅ NEW
      });

      // ✅ UPDATED: Store more admin info
      const adminData = {
        email: response.data.admin?.email || email,
        name: response.data.admin?.name || name,
        userType: response.data.admin?.userType || userType, // ✅ NEW
        specialization: response.data.admin?.specialization, // ✅ NEW
        location: response.data.admin?.location, // ✅ NEW
        website: response.data.admin?.website // ✅ NEW
      };

      setAdmin(adminData);
      toast.success(`${userType === 'incubator' ? 'Incubator' : 'Admin'} registration successful!`);
      return response.data;
    } catch (err) {
      handleAuthError(err, 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Login to include userType info
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${host}/api/admin/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      localStorage.setItem('adminToken', token);
      
      // ✅ UPDATED: Store complete admin data
      const adminData = {
        email: user?.email || email,
        name: user?.name || email.split('@')[0],
        token,
        userType: user?.userType, // ✅ NEW
        specialization: user?.specialization, // ✅ NEW
        location: user?.location, // ✅ NEW
        website: user?.website // ✅ NEW
      };

      setAdmin(adminData);
      
      // ✅ NEW: Store userType for quick access
      localStorage.setItem('userType', user?.userType || 'admin');
      
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
    localStorage.removeItem('userType'); // ✅ NEW
    setAdmin(null);
    toast.success('Logged out successfully');
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('adminToken');
  };

  const handleAuthError = (err: unknown, defaultMessage: string) => {
    const axiosError = err as AxiosError<{ message: string; error?: string }>;
    const errorMessage = 
      axiosError.response?.data?.message || 
      axiosError.response?.data?.error || 
      defaultMessage;
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