import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CalendarIcon, ClockIcon, Building2Icon, InfoIcon, ArrowLeftIcon, VideoIcon } from "lucide-react";

// UI Components
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

type Schedule = {
  _id: string;
  startupId: {
    _id: string;
    name: string;
  };
  date: string;
  time: string;
  description: string;
  createdAt: string;
};

const ScheduleDetails = () => {
  const { id } = useParams();
  const { admin } = useAuth();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      if (!admin?.token || !id) return;

      try {
        const response = await fetch(`http://localhost:3000/api/admin/all-schedules`, {
          headers: {
            token: admin.token,
          },
        });

        const data = await response.json();
        const foundSchedule = data.schedules.find((sched: Schedule) => sched._id === id);

        if (!foundSchedule) {
          toast.error("Schedule not found");
        } else {
          setSchedule(foundSchedule);
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
        toast.error("Failed to load schedule details");
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleDetails();
  }, [admin?.token, id]);

  // Format date as "Monday, January 1, 2023"
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for better readability
  const formatTime = (timeString: string) => {
    return timeString;
  };

  if (loading) {
    return <ScheduleDetailsSkeleton />;
  }

  if (!schedule) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6">
        <InfoIcon className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-medium text-gray-700">Schedule not found</h2>
        <p className="text-gray-500 mt-2">The requested schedule could not be found</p>
        <Link to="/schedules">
          <Button variant="outline" className="mt-6">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Schedules
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <Link to="/admin/schedules" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          <span>Back to all schedules</span>
        </Link>
      </div>

      <Card className="shadow-lg border-t-4 border-t-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Schedule Details</CardTitle>
              <CardDescription className="mt-1 text-gray-600">
                Meeting with {schedule.startupId?.name || "Unknown Startup"}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
              ID: {schedule._id.substring(0, 8)}...
            </Badge>
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="flex">
                <CalendarIcon className="w-5 h-5 mr-3 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-base font-medium">{formatDate(schedule.date)}</p>
                </div>
              </div>
              
              <div className="flex">
                <ClockIcon className="w-5 h-5 mr-3 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p className="text-base font-medium">{formatTime(schedule.time)}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex">
                <Building2Icon className="w-5 h-5 mr-3 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Startup</p>
                  <p className="text-base font-medium">{schedule.startupId?.name || "Unknown"}</p>
                </div>
              </div>
              
              <div className="flex">
                <InfoIcon className="w-5 h-5 mr-3 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-base font-medium">{new Date(schedule.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-3">Description</h3>
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              {schedule.description ? (
                <p className="text-gray-700">{schedule.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>
          </div>
        </CardContent>
        
        <Separator className="my-2" />
        
        <CardFooter className="flex justify-center py-6">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-5 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
            onClick={() => window.open("http://localhost:5000/", "_blank")}
          >
            <VideoIcon className="w-5 h-5 mr-2" />
            Start Video Conference
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Loading skeleton for better UX during data fetch
const ScheduleDetailsSkeleton = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <Skeleton className="h-6 w-32" />
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex">
                <Skeleton className="w-5 h-5 mr-3" />
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <Skeleton className="h-6 w-32 mb-3" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </CardContent>
        
        <Separator className="my-2" />
        
        <CardFooter className="flex justify-center py-6">
          <Skeleton className="h-12 w-64 rounded-lg" />
        </CardFooter>
      </Card>
    </div>
  );
};

export default ScheduleDetails;