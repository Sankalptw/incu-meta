import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import { 
  Search, 
  Calendar,
  MapPin, 
  Info, 
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  Download,
  ChevronDown
} from "lucide-react";

type Event = {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: string;
};

const StartupEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc'
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/user/events");
        setEvents(response.data.events);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/user/events");
      setEvents(response.data.events);
      toast.success("Events refreshed");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to refresh events");
    } finally {
      setLoading(false);
    }
  };

  const viewEventDetails = (event: Event) => {
    setSelectedEvent(event);
  };

  // Filtering events based on search term
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    
    if (activeFilter === "all") {
      return matchesSearch;
    } 
    
    const today = new Date();
    const eventDate = new Date(event.date);
    
    if (activeFilter === "upcoming" && eventDate >= today) {
      return matchesSearch;
    }
    
    if (activeFilter === "past" && eventDate < today) {
      return matchesSearch;
    }
    
    return false;
  });

  // Sorting function
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    
    if (sortConfig.key === 'title') {
      return sortConfig.direction === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    
    return 0;
  });

  // Helper function to format date from ISO string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to toggle sort
  const handleSort = (key: string) => {
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({
        key,
        direction: 'asc'
      });
    }
  };

  // Get short date for display in table
  const getShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Count upcoming events
  const upcomingEventsCount = events.filter(
    event => new Date(event.date) >= new Date()
  ).length;

  // Count events created today
  const todayEventsCount = events.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const renderSkeletons = () => (
    <>
      {Array(5).fill(0).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-3/4" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-1/2" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-3/4" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end">
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upcoming Events</h1>
          <p className="text-muted-foreground mt-1">View all upcoming startup and community events</p>
        </div>
      </div>

      <Separator />

      {/* Filters and Actions */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                className={activeFilter === "all" ? "bg-accent" : ""} 
                onClick={() => setActiveFilter("all")}
              >
                All Events
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={activeFilter === "upcoming" ? "bg-accent" : ""} 
                onClick={() => setActiveFilter("upcoming")}
              >
                Upcoming Events
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={activeFilter === "past" ? "bg-accent" : ""} 
                onClick={() => setActiveFilter("past")}
              >
                Past Events
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEventsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEventsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[280px] cursor-pointer"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center">
                  Event Title
                  {sortConfig.key === 'title' && (
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Location</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.key === 'date' && (
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              renderSkeletons()
            ) : sortedEvents.length > 0 ? (
              sortedEvents.map((event) => (
                <TableRow key={event._id} className="group hover:bg-muted/40">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="truncate max-w-[250px]" title={event.title}>
                        {event.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md truncate" title={event.description}>
                      {event.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      <span className="truncate max-w-[150px]" title={event.location}>
                        {event.location}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {event.date ? getShortDate(event.date) : "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewEventDetails(event)}
                        className="h-8 w-8 opacity-70 group-hover:opacity-100"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <Info className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No events found</h3>
                    <p className="text-muted-foreground mb-4 text-center max-w-md">
                      {search ? 
                        "No events match your search criteria. Try a different search term or clear your filters." :
                        "There are no events to display at this time."}
                    </p>
                    {search && (
                      <Button variant="outline" onClick={() => setSearch("")}>
                        Clear search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-2 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {sortedEvents.length} of {events.length} events
          </div>
          <div className="flex items-center space-x-6">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent?.image && (
            <div className="w-full h-48 overflow-hidden rounded-md mb-4">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Info className="h-4 w-4" /> Description
              </h4>
              <p className="text-muted-foreground whitespace-pre-line">{selectedEvent?.description}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Date
              </h4>
              <p className="text-muted-foreground">
                {selectedEvent?.date ? formatDate(selectedEvent.date) : "Date not specified"}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </h4>
              <p className="text-muted-foreground">{selectedEvent?.location}</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartupEvents;