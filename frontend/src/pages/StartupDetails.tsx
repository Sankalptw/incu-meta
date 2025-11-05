import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Building, Mail, Briefcase, Users, TrendingUp, Calendar, CheckCircle, ArrowLeft,
  Zap, BarChart2, LineChart, Globe, Award, MessageSquare, Layers, Clock
} from "lucide-react";
import { 
  PieChart, Pie, Cell, LineChart as ReLineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from "recharts";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(value);
};

const StartupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartupDetails = async () => {
      if (!admin?.token) {
        toast.error("Admin token missing");
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/admin/all-startups/${id}`, {
          headers: {
            token: admin.token,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message || "Failed to fetch startup details");
          return;
        }

        setStartup(data.startup);
      } catch (error) {
        console.error("Error fetching startup details:", error);
        toast.error("Error loading startup details");
      } finally {
        setLoading(false);
      }
    };

    fetchStartupDetails();
  }, [id, admin?.token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg font-medium flex items-center gap-2 text-gray-700">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading startup details...
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Building className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-lg font-medium text-gray-700 mb-2">No startup details found</p>
        <button 
          onClick={() => navigate('/startups')}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center mt-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Return to startups list
        </button>
      </div>
    );
  }

  // Generate sample data for charts based on the startup data
  // Revenue Growth Chart (monthly data)
  const revenueGrowthData = [
    { month: 'Jan', revenue: Math.round(startup.revenue * 0.7) },
    { month: 'Feb', revenue: Math.round(startup.revenue * 0.75) },
    { month: 'Mar', revenue: Math.round(startup.revenue * 0.8) },
    { month: 'Apr', revenue: Math.round(startup.revenue * 0.85) },
    { month: 'May', revenue: Math.round(startup.revenue * 0.9) },
    { month: 'Jun', revenue: Math.round(startup.revenue * 0.95) },
    { month: 'Current', revenue: startup.revenue }
  ];

  // Team Composition
  const teamCompositionData = [
    { title: 'Engineering', value: Math.round(startup.teamSize * 0.4) },
    { title: 'Sales', value: Math.round(startup.teamSize * 0.25) },
    { title: 'Marketing', value: Math.round(startup.teamSize * 0.15) },
    { title: 'Operations', value: Math.round(startup.teamSize * 0.1) },
    { title: 'Management', value: Math.round(startup.teamSize * 0.1) }
  ];

  // KPI Metrics
  const kpiData = [
    { name: 'User Growth', current: '27%', target: '30%', value: 27/30 * 100 },
    { name: 'Customer Retention', current: '89%', target: '85%', value: 89/85 * 100 },
    { name: 'Market Share', current: '12%', target: '15%', value: 12/15 * 100 }
  ];

  // Funding History
  const fundingHistory = [
    { round: 'Pre-Seed', amount: startup.revenue * 0.1 },
    { round: 'Seed', amount: startup.revenue * 0.2 },
    { round: 'Series A', amount: startup.revenue * 0.7 }
  ];

  // COLORS for charts
  const COLORS = ['#475569', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Navigation Header */}
      <div className="mb-6">
        <Link to="/admin/startups" className="text-sm text-gray-600 hover:text-gray-900 flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Startups
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">{startup.name}</h1>
            <p className="text-sm text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> Joined {formatDate(startup.createdAt)}
              {startup.isApproved && (
                <span className="ml-3 flex items-center text-gray-500">
                  <CheckCircle className="h-4 w-4 mr-1 text-gray-500" /> Approved
                </span>
              )}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-medium">
              {startup.fundingStage}
            </span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-medium">
              {startup.industry}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Details Column */}
        <div>
          <Card className="mb-6 shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-800">Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-sm font-medium text-gray-700">{startup.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Industry</p>
                    <p className="text-sm font-medium text-gray-700">{startup.industry}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Annual Revenue</p>
                    <p className="text-sm font-medium text-gray-700">{formatCurrency(startup.revenue)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Team Size</p>
                    <p className="text-sm font-medium text-gray-700">{startup.teamSize} members</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Zap className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Funding Stage</p>
                    <p className="text-sm font-medium text-gray-700">{startup.fundingStage}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-800">Team Composition</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={teamCompositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {teamCompositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} team members`, 'Count']}
                      contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-2">
          <Card className="mb-6 shadow-sm border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-gray-800">Revenue Growth Trend</CardTitle>
              <CardDescription className="text-xs text-gray-500">Monthly revenue performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart
                    data={revenueGrowthData}
                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Revenue']}
                      contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4B5563"
                      strokeWidth={2}
                      activeDot={{ r: 5 }}
                      name="Revenue"
                      dot={{ stroke: '#4B5563', strokeWidth: 1, fill: '#fff', r: 3 }}
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-800">Funding History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={fundingHistory}
                      margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="round" tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), 'Amount']}
                        contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '4px' }}
                      />
                      <Bar dataKey="amount" name="Funding" fill="#4B5563" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-800">Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 pt-2">
                  {kpiData.map((kpi, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">{kpi.name}</p>
                        <p className="text-sm text-gray-500">
                          {kpi.current} / <span className="text-gray-400">{kpi.target}</span>
                        </p>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${kpi.value >= 100 ? 'bg-gray-600' : 'bg-gray-400'}`}
                          style={{ width: `${Math.min(kpi.value, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
                      <Globe className="h-5 w-5 text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500">Target Market</p>
                      <p className="text-sm font-medium text-gray-700">Enterprise</p>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
                      <Award className="h-5 w-5 text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500">Top Ranking</p>
                      <p className="text-sm font-medium text-gray-700">#3 in Industry</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-gray-800">Communication</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600">Last Meeting</p>
                <p className="text-sm font-medium text-gray-700">3 days ago</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-sm font-medium text-gray-700">24 hours</p>
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="text-sm text-gray-600">Next Check-in</p>
                <p className="text-sm font-medium text-gray-700">Apr 12, 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-gray-800">Technology Stack</CardTitle>
              <Layers className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {['React', 'Node.js', 'MongoDB', 'AWS', 'GraphQL', 'TypeScript'].map((tech, index) => (
                <div key={index} className="bg-gray-50 px-3 py-2 rounded-md">
                  <p className="text-sm font-medium text-gray-700">{tech}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-gray-800">Timeline</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="relative pl-5 pb-5 border-l-2 border-gray-200">
                <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-gray-400"></div>
                <p className="text-xs text-gray-500">Apr 2025</p>
                <p className="text-sm font-medium text-gray-700">Series A Funding</p>
              </div>
              <div className="relative pl-5 pb-5 border-l-2 border-gray-200">
                <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-gray-400"></div>
                <p className="text-xs text-gray-500">Dec 2024</p>
                <p className="text-sm font-medium text-gray-700">Market Expansion</p>
              </div>
              <div className="relative pl-5">
                <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-gray-400"></div>
                <p className="text-xs text-gray-500">Oct 2024</p>
                <p className="text-sm font-medium text-gray-700">Product Launch</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StartupDetails;