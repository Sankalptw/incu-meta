// contexts/EventsContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: string;
};

interface EventsContextProps {
  events: Event[];
  loading: boolean;
  createEvent: (event: Omit<Event, "id">) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextProps | undefined>(undefined);

export const EventsProvider = ({ children }: { children: React.ReactNode }) => {
  const { admin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/user/events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshEvents();
  }, []);

  const createEvent = async (event: Omit<Event, "id">) => {
    if (!admin?.token) return;

    try {
      const res = await fetch("http://localhost:3000/api/admin/create-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${admin.token}`,
        },
        body: JSON.stringify(event),
      });

      const data = await res.json();
      setEvents([data.event, ...events]);
      toast.success("Event created successfully");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };

  const deleteEvent = async (id: string) => {
    if (!admin?.token) return;

    try {
      await fetch("http://localhost:3000/api/admin/remove-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${admin.token}`,
        },
        body: JSON.stringify({ eventId: id }),
      });

      setEvents(events.filter((e) => e.id !== id));
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  return (
    <EventsContext.Provider
      value={{ events, loading, createEvent, deleteEvent, refreshEvents }}
    >
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) throw new Error("useEvents must be used within an EventsProvider");
  return context;
};
