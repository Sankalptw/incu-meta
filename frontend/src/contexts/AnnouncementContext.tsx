import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
const host = "http://localhost:3000"; // Backend server URL
// Type definition matching MongoDB schema
export type Announcement = {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  type?: 'news' | 'funding' | 'government' | 'other'; // Optional field for future use
};

// Context type definition
type AnnouncementsContextType = {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  fetchAnnouncements: () => Promise<void>;
  createAnnouncement: (announcement: Omit<Announcement, '_id' | 'createdAt'>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
};

// Create context with undefined default value
const AnnouncementsContext = createContext<AnnouncementsContextType | undefined>(undefined);

// Provider component
export const AnnouncementsProvider = ({ children }: { children: ReactNode }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${host}/api/user/announcements`);
      setAnnouncements(response.data.announcements || []);
    } catch (err) {
      handleError(err, 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (newAnnouncement: Omit<Announcement, '_id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/create-announcement', newAnnouncement);
      setAnnouncements(prev => [response.data.announcement, ...prev]);
      toast.success('Announcement created successfully');
    } catch (err) {
      handleError(err, 'Failed to create announcement');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/admin/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      toast.success('Announcement deleted successfully');
    } catch (err) {
      handleError(err, 'Failed to delete announcement');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: unknown, defaultMessage: string) => {
    const axiosError = err as AxiosError<{ message: string }>;
    const errorMessage = axiosError.response?.data?.message || defaultMessage;
    setError(errorMessage);
    toast.error(errorMessage);
  };

  // Initial data fetch
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <AnnouncementsContext.Provider 
      value={{
        announcements,
        loading,
        error,
        fetchAnnouncements,
        createAnnouncement,
        deleteAnnouncement
      }}
    >
      {children}
    </AnnouncementsContext.Provider>
  );
};

// Custom hook for consuming context
export const useAnnouncements = (): AnnouncementsContextType => {
  const context = useContext(AnnouncementsContext);
  if (context === undefined) {
    throw new Error('useAnnouncements must be used within an AnnouncementsProvider');
  }
  return context;
};