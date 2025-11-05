import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { TrendingUp, Users, Calendar, Target, FileText, Building, DollarSign, Clock } from "lucide-react";

// Professional, subdued color palette
const COLORS = ["#475569", "#64748b", "#94a3b8", "#cbd5e1", "#1e293b", "#334155"];

const StartupDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/user/dashboard-stats");
        setStats(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Generate monthly revenue data based on current revenue
  // Note: In production, this should come from your API
  const generateMonthlyData = (revenue) => {
    if (!revenue) return [];
    
    const baseRevenue = revenue * 0.8;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const currentMonth = new Date().getMonth();
    
    return monthNames.slice(0, currentMonth + 1).map((month, index) => {
      const monthRevenue = baseRevenue + (revenue - baseRevenue) * (index / currentMonth);
      const expenses = monthRevenue * 0.65;
      
      return {
        month,
        revenue: Math.round(monthRevenue),
        expenses: Math.round(expenses)
      };
    });
  };

  // Generate industry distribution data
  const generateIndustryData = (industry) => {
    return [
      { name: industry || "Tech", value: 1 },
      { name: "Other Industries", value: 4 }
    ];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-gray-600 border-b-gray-600 border-l-gray-200 border-r-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-xl font-medium text-red-700">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const monthlyRevenueData = generateMonthlyData(stats.revenue);
  const industryData = generateIndustryData(stats.industry);
  
  // Format creation date
  const formattedDate = stats.accountCreated ? new Date(stats.accountCreated).toLocaleDateString() : "N/A";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{stats.name} Dashboard</h1>
          <p className="text-gray-600 mt-2">Performance overview and key metrics</p>
        </header>
        
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Company Details</CardTitle>
              <Building className="text-gray-600 h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Industry:</span>
                  <span className="font-medium">{stats.industry || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium">{stats.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Funding Stage:</span>
                  <span className="font-medium">{stats.fundingStage || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Created:</span>
                  <span className="font-medium">{formattedDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Platform Activity</CardTitle>
              <Calendar className="text-gray-600 h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Events:</span>
                  <span className="font-medium">{stats.totalEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Announcements:</span>
                  <span className="font-medium">{stats.totalAnnouncements}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Upcoming Event:</span>
                  <span className="font-medium">{stats.upcomingEvent}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Total Revenue</CardTitle>
              <DollarSign className="text-gray-600 h-5 w-5" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold">${stats.revenue ? stats.revenue.toLocaleString() : "0"}</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">Annual revenue</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Team Size</CardTitle>
              <Users className="text-gray-600 h-5 w-5" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.teamSize || 0}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-gray-600 h-2 rounded-full" style={{ width: `${Math.min((stats.teamSize || 0) * 10, 100)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Team members</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Platform Events</CardTitle>
              <Calendar className="text-gray-600 h-5 w-5" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalEvents || 0}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-gray-700 h-2 rounded-full" style={{ width: `${Math.min((stats.totalEvents || 0) * 10, 100)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Available events</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend (based on estimated monthly revenue) */}
          <Card className="shadow-sm hover:shadow-md transition-shadow col-span-2">
            <CardHeader>
              <CardTitle>Estimated Revenue vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#475569" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#475569" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#475569" fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="expenses" stroke="#94a3b8" fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2 text-center">*Based on estimated monthly breakdown</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart - Industry Distribution */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Industry Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={industryData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100} 
                    fill="#8884d8" 
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {industryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2 text-center">Your industry compared to other startups</p>
            </CardContent>
          </Card>
          
          {/* Monthly Revenue Bar Chart */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Monthly Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenueData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#475569">
                    {monthlyRevenueData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === monthlyRevenueData.length - 1 ? '#1e293b' : '#475569'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2 text-center">*Based on estimated monthly breakdown</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StartupDashboard;