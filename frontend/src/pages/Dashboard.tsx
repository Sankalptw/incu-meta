import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell
} from "recharts";
import { Users, DollarSign, Calendar, MessageSquare, Building, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!admin?.token) {
        toast.error("Admin token missing");
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/api/admin/dashboard-stats", {
          headers: { token: admin.token },
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        toast.error("Failed to load dashboard stats");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [admin?.token]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-lg font-medium flex items-center gap-2 text-gray-700">
        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading dashboard...
      </div>
    </div>
  );

  if (!stats) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-lg font-medium text-gray-600">No stats available</div>
    </div>
  );

  // Prepare data for charts
  const startupStatusData = [
    { name: "Approved", value: stats.approvedStartups, color: "#4B5563" },
    { name: "Pending", value: stats.pendingStartups, color: "#9CA3AF" }
  ];

  const fundingStageData = stats.fundingStageBreakdown.map((stage, index) => ({
    name: stage._id,
    value: stage.count,
    // Generate professional, muted colors
    color: `hsl(${210 + index * 30}, 20%, ${45 + index * 5}%)`
  }));

  // Monthly startup growth data (mock data since we only have the current month)
  const monthlyGrowthData = [
    { month: "Jan", startups: Math.floor(stats.startupsThisMonth * 0.4) },
    { month: "Feb", startups: Math.floor(stats.startupsThisMonth * 0.5) },
    { month: "Mar", startups: Math.floor(stats.startupsThisMonth * 0.7) },
    { month: "Apr", startups: Math.floor(stats.startupsThisMonth * 0.8) },
    { month: "May", startups: Math.floor(stats.startupsThisMonth * 0.9) },
    { month: "Current", startups: stats.startupsThisMonth }
  ];

  // Professional, subdued color palette
  const COLORS = ["#4B5563", "#64748B", "#6B7280", "#4B5563", "#374151", "#1F2937"];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">Incubator Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back. Here's what's happening with your incubator today.</p>
      </div>
      
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="pt-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Startups</p>
                <h3 className="text-xl font-semibold mt-1 text-gray-800">{stats.totalStartups}</h3>
              </div>
              <div className="bg-gray-100 p-2 rounded-md">
                <Building className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0">
          <CardContent className="pt-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
                <h3 className="text-xl font-semibold mt-1 text-gray-800">${stats.totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="bg-gray-100 p-2 rounded-md">
                <DollarSign className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0">
          <CardContent className="pt-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Team Members</p>
                <h3 className="text-xl font-semibold mt-1 text-gray-800">{stats.totalTeamSize}</h3>
              </div>
              <div className="bg-gray-100 p-2 rounded-md">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0">
          <CardContent className="pt-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Upcoming Events</p>
                <h3 className="text-xl font-semibold mt-1 text-gray-800">{stats.upcomingEvents}</h3>
              </div>
              <div className="bg-gray-100 p-2 rounded-md">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Startup Status */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-800">Startup Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={startupStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {startupStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Startups`, 'Count']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Funding Stage Breakdown */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-800">Funding Stage Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={fundingStageData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`${value} Startups`, 'Count']}
                    contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="value" name="Startups">
                    {fundingStageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Growth & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Startup Growth */}
        <Card className="lg:col-span-2 bg-white shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-800">Monthly Startup Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyGrowthData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`${value} Startups`, 'Count']}
                    contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                  <Line
                    type="monotone"
                    dataKey="startups"
                    stroke="#4B5563"
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                    name="New Startups"
                    dot={{ stroke: '#4B5563', strokeWidth: 1, fill: '#fff', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Featured Stats */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-800">Featured Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 rounded-md bg-gray-50">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Top Revenue Startup</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-gray-600 mr-2" />
                  <p className="font-medium text-gray-800">{stats.topRevenueStartup?.name}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">${stats.topRevenueStartup?.revenue.toLocaleString()}</p>
              </div>
              
              <div className="p-4 border border-gray-100 rounded-md bg-gray-50">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Largest Team</p>
                <div className="flex items-center mt-2">
                  <Users className="h-4 w-4 text-gray-600 mr-2" />
                  <p className="font-medium text-gray-800">{stats.largestTeam?.name}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">{stats.largestTeam?.teamSize} team members</p>
              </div>
              
              <div className="p-4 border border-gray-100 rounded-md bg-gray-50">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Activity Summary</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-sm text-gray-700">Meetings Today</p>
                  </div>
                  <p className="font-medium text-gray-800">{stats.meetingsToday}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-sm text-gray-700">Recent Announcements</p>
                  </div>
                  <p className="font-medium text-gray-800">{stats.announcementsLast30Days}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-sm text-gray-700">New Startups (Month)</p>
                  </div>
                  <p className="font-medium text-gray-800">{stats.startupsThisMonth}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;