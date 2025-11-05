
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Clock, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import fetchWithMock, { Meeting, Startup } from "@/utils/mockApiService";
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
import { Badge } from "@/components/ui/badge";

const Meetings = () => {
  const { admin } = useAuth();
  const [search, setSearch] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    startupId: "",
    date: "",
    time: "",
    duration: 60,
    notes: "",
  });

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!admin?.token) return;
      
      try {
        const [meetingsResponse, startupsResponse] = await Promise.all([
          fetchWithMock("http://localhost:3000/api/admin/all-schedules", {
            headers: {
              Authorization: `Bearer ${admin.token}`,
            },
          }),
          fetchWithMock("http://localhost:3000/api/admin/all-startups", {
            headers: {
              Authorization: `Bearer ${admin.token}`,
            },
          })
        ]);
        
        setMeetings(meetingsResponse.meetings || []);
        setStartups(startupsResponse.startups || []);
      } catch (error) {
        console.error("Error fetching meetings:", error);
        toast.error("Failed to load meetings");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [admin?.token]);

  const handleScheduleMeeting = async () => {
    if (!admin?.token) return;
    
    if (!newMeeting.title || !newMeeting.startupId || !newMeeting.date || !newMeeting.time) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      const response = await fetchWithMock("http://localhost:3000/api/admin/schedule-meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${admin.token}`,
        },
        body: JSON.stringify(newMeeting),
      });
      
      // Add the new meeting to the list
      setMeetings([
        response.meeting,
        ...meetings,
      ]);
      
      // Reset form and close dialog
      setNewMeeting({
        title: "",
        startupId: "",
        date: "",
        time: "",
        duration: 60,
        notes: "",
      });
      setIsDialogOpen(false);
      
      toast.success("Meeting scheduled successfully");
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast.error("Failed to schedule meeting");
    }
  };

  // Filter meetings based on search
  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(search.toLowerCase()) ||
    meeting.startupName.toLowerCase().includes(search.toLowerCase()) ||
    meeting.notes?.toLowerCase().includes(search.toLowerCase()) ||
    meeting.status.toLowerCase().includes(search.toLowerCase())
  );

  // Sort by date/time 
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Group by upcoming/past
  const currentDate = new Date();
  const upcomingMeetings = sortedMeetings.filter(meeting => {
    const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
    return meetingDate > currentDate;
  });
  
  const pastMeetings = sortedMeetings.filter(meeting => {
    const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
    return meetingDate <= currentDate;
  });

  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case 'scheduled':
      default:
        return <Badge variant="outline" className="text-blue-600 border-blue-400">Scheduled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Scheduled Meetings</h1>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search meetings..."
              className="pl-8 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule Meeting</DialogTitle>
                <DialogDescription>
                  Schedule a new meeting with a startup
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="meeting-title" className="text-right text-sm font-medium col-span-1">
                    Title
                  </label>
                  <Input
                    id="meeting-title"
                    placeholder="Enter meeting title"
                    className="col-span-3"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="meeting-startup" className="text-right text-sm font-medium col-span-1">
                    Startup
                  </label>
                  <Select
                    value={newMeeting.startupId}
                    onValueChange={(value) => setNewMeeting({ ...newMeeting, startupId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select startup" />
                    </SelectTrigger>
                    <SelectContent>
                      {startups.map(startup => (
                        <SelectItem key={startup.id} value={startup.id}>
                          {startup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="meeting-date" className="text-right text-sm font-medium col-span-1">
                    Date
                  </label>
                  <Input
                    id="meeting-date"
                    type="date"
                    className="col-span-3"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="meeting-time" className="text-right text-sm font-medium col-span-1">
                    Time
                  </label>
                  <Input
                    id="meeting-time"
                    type="time"
                    className="col-span-3"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="meeting-duration" className="text-right text-sm font-medium col-span-1">
                    Duration
                  </label>
                  <Select
                    value={newMeeting.duration.toString()}
                    onValueChange={(value) => setNewMeeting({ ...newMeeting, duration: parseInt(value) })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <label htmlFor="meeting-notes" className="text-right text-sm font-medium col-span-1">
                    Notes
                  </label>
                  <Textarea
                    id="meeting-notes"
                    placeholder="Enter meeting agenda or notes"
                    className="col-span-3"
                    rows={3}
                    value={newMeeting.notes}
                    onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleMeeting}>
                  Schedule Meeting
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Meetings</CardTitle>
          <CardDescription>
            {upcomingMeetings.length} upcoming meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array(2).fill(0).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse bg-gray-100 h-24" />
              ))}
            </div>
          ) : upcomingMeetings.length > 0 ? (
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-incumeta-100 rounded-md flex items-center justify-center text-incumeta-600">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500">
                          <span className="font-medium text-gray-600">{meeting.startupName}</span>
                          <span>•</span>
                          <span>{formatMeetingDate(meeting.date)}</span>
                          <span>•</span>
                          <span>{meeting.time}</span>
                          <span>•</span>
                          <span>{meeting.duration} min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      {getStatusBadge(meeting.status)}
                    </div>
                  </div>
                  {meeting.notes && (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                      {meeting.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No upcoming meetings found
            </div>
          )}
        </CardContent>
      </Card>

      {pastMeetings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Meetings</CardTitle>
            <CardDescription>
              {pastMeetings.length} past meetings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white opacity-80"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500">
                          <span className="font-medium text-gray-600">{meeting.startupName}</span>
                          <span>•</span>
                          <span>{formatMeetingDate(meeting.date)}</span>
                          <span>•</span>
                          <span>{meeting.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      {getStatusBadge(meeting.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Meetings;
