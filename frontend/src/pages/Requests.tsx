import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InboxIcon, Users2Icon, CheckCircleIcon, XCircleIcon } from "lucide-react";

type Startup = {
  _id: string;
  name: string;
  email: string;
  isApproved: boolean;
  fundingStage: string;
};


const Requests = () => {
  const { admin } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStartups = async () => {
      if (!admin?.token) return;

      try {
        const response = await fetch("http://localhost:3000/api/admin/all-startups", {
          headers: {
            token: admin.token,
          },
        });
        const data = await response.json();
        const unapprovedStartups = (data.startups || []).filter((startup: Startup) => !startup.isApproved);
        setStartups(unapprovedStartups);
      } catch (error) {
        console.error("Error fetching startups:", error);
        toast.error("Failed to load startups");
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, [admin?.token]);

  const handleApproveClick = (startup: Startup) => {
    setSelectedStartup(startup);
    setIsDialogOpen(true);
  };

  const approveStartup = async () => {
    if (!admin?.token || !selectedStartup) return;

    try {
      const response = await fetch("http://localhost:3000/api/admin/approve-startup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: admin.token,
        },
        body: JSON.stringify({ id: selectedStartup._id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setStartups((prev) => prev.filter((startup) => startup._id !== selectedStartup._id));
      } else {
        toast.error(data.message || "Failed to approve startup");
      }
    } catch (error) {
      console.error("Error approving startup:", error);
      toast.error("Server error");
    } finally {
      setIsDialogOpen(false);
      setSelectedStartup(null);
    }
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="hover:shadow-xl transition">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-9 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-12" />
      </div>
      <LoadingSkeleton />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/30">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <InboxIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Approval Requests</h1>
              <p className="text-muted-foreground">
                {startups.length} pending {startups.length === 1 ? 'request' : 'requests'}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Users2Icon className="w-4 h-4" />
            Total Requests: {startups.length}
          </Badge>
        </div>

        {startups.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <CheckCircleIcon className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">All Caught Up!</h3>
              <p className="text-muted-foreground">There are no pending approval requests at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
              {startups.map((startup) => (
                <Card
                  key={startup._id}
                  className="hover:shadow-xl transition duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{startup.name}</CardTitle>
                      <Badge variant="outline" className="text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30">
                        Pending
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      {startup.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      {/* <p className="text-sm text-muted-foreground">
                        {startup.fundingStage === "seed" && <Badge variant="secondary">Seed Stage</Badge>}
                        {startup.fundingStage === "series_a" && <Badge>Series A</Badge>}
                        {startup.fundingStage === "bootstrapped" && <Badge variant="outline">Bootstrapped</Badge>}
                      </p> */}

                    </div>
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveClick(startup);
                        }}
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/startup/${startup._id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Startup Approval</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0">
                  <Users2Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{selectedStartup?.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedStartup?.email}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This action will approve the startup and grant them access to the platform. This cannot be undone.
              </p>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <XCircleIcon className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={approveStartup}>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Confirm Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Requests;