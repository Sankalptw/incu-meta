// src/pages/startup/StartupAnnouncements.tsx

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useStartupAuth } from "@/contexts/StartupAuthContext";

type Announcement = {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
};

const StartupAnnouncements = () => {
  const [search, setSearch] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("startupToken");

      const response = await fetch("http://localhost:3000/api/user/announcements", {
        headers: {
          token: token || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch announcements");
      }

      const data = await response.json();
      setAnnouncements(data.announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Announcements</h2>

      <div className="flex items-center gap-2 mb-6">
        <Input
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="w-4 h-4 text-muted-foreground" />
      </div>

      {loading ? (
        <p>Loading announcements...</p>
      ) : filteredAnnouncements.length === 0 ? (
        <p>No announcements found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement._id}>
              <CardHeader>
                <CardTitle>{announcement.title}</CardTitle>
                <CardDescription>
                  {new Date(announcement.createdAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{announcement.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StartupAnnouncements;
