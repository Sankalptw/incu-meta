import { useState } from "react";
import { useAnnouncements } from "@/contexts/AnnouncementContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Trash2, Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AnnouncementType = 'news' | 'funding' | 'government' | 'other';

const Announcements = () => {
  const { admin } = useAuth();
  const { 
    announcements, 
    loading, 
    error, 
    createAnnouncement: contextCreateAnnouncement,
    deleteAnnouncement: contextDeleteAnnouncement,
    fetchAnnouncements
  } = useAnnouncements();
  
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    description: "",
    type: "news" as AnnouncementType, // Explicitly type this
  });


  const handleCreateAnnouncement = async () => {
    if (
      !newAnnouncement.title.trim() ||
      !newAnnouncement.description.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/api/admin/create-announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: `${admin?.token}`,
        },
        body: JSON.stringify({
          title: newAnnouncement.title,
          message: newAnnouncement.description,
          type: newAnnouncement.type,
        }),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create announcement");
      }
  
      toast.success("Announcement created successfully");
  
      // Reset form
      setNewAnnouncement({ title: "", description: "", type: "news" });
      setIsDialogOpen(false);
  
      //  Fetch updated announcements
      fetchAnnouncements();
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Failed to create announcement");
    }
  };
  
  
  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/remove-announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: `${admin?.token}`, // Make sure `admin` is available from context
        },
        body: JSON.stringify({ announcementId: id }),
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete announcement");
      }
  
      toast.success("Announcement deleted");
      fetchAnnouncements(); // Make sure this is defined to refresh the UI
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to delete announcement");
    }
  };
  
  // Filter announcements based on search
  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.title.toLowerCase().includes(search.toLowerCase()) ||
    announcement.message.toLowerCase().includes(search.toLowerCase()) ||
    (announcement.type && announcement.type.toLowerCase().includes(search.toLowerCase()))
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'funding': return 'Funding Opportunity';
      case 'government': return 'Government Scheme';
      case 'news': return 'News & Updates';
      case 'other':
      default: return 'Other';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'funding': return 'bg-green-100 text-green-800 border-green-200';
      case 'government': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'news': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'other':
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search announcements..."
              className="pl-8 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Create a new announcement for startups. This will be visible to all incubated startups.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="announcement-title" className="text-right text-sm font-medium col-span-1">
                    Title
                  </label>
                  <Input
                    id="announcement-title"
                    placeholder="Enter announcement title"
                    className="col-span-3"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="announcement-type" className="text-right text-sm font-medium col-span-1">
                    Type
                  </label>
                  <Select
      value={newAnnouncement.type}
          onValueChange={(value: AnnouncementType) => 
                 setNewAnnouncement({ ...newAnnouncement, type: value })
    }
  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="funding">Funding Opportunity</SelectItem>
                      <SelectItem value="government">Government Scheme</SelectItem>
                      <SelectItem value="news">News & Updates</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <label htmlFor="announcement-description" className="text-right text-sm font-medium col-span-1">
                    Description
                  </label>
                  <Textarea
                    id="announcement-description"
                    placeholder="Enter announcement details"
                    className="col-span-3"
                    rows={5}
                    value={newAnnouncement.description}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAnnouncement}>
                  Create Announcement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>
            {filteredAnnouncements.length} announcements found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse bg-gray-100 h-32" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : filteredAnnouncements.length > 0 ? (
            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{announcement.title}</h3>
                      {announcement.type && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                          {getTypeLabel(announcement.type)}
                        </span>
                      )}
                    </div>
                    {admin && (
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          title="Delete"
                          onClick={() => handleDeleteAnnouncement(announcement._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                    {announcement.message}
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    Posted: {new Date(announcement.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No announcements found matching your search criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Announcements;
