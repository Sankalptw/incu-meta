import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Search, Building, Briefcase, Mail, TrendingUp, Users, Calendar, Filter } from "lucide-react";

const Startups = () => {
  const { admin } = useAuth();
  const [search, setSearch] = useState("");
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("name");
  const [filterStage, setFilterStage] = useState("all");

  useEffect(() => {
    const fetchStartups = async () => {
      if (!admin?.token) {
        console.warn("Admin token missing", admin);
        toast.error("Admin token missing");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch("http://localhost:3000/api/admin/all-startups", {
          headers: {
            token: admin.token,
          },
        });

        const data = await response.json();
        console.log("Fetched startups:", data);

        // Filter only approved startups
        const approvedStartups = (data.startups || []).filter(
          (startup: any) => startup.isApproved
        );

        setStartups(approvedStartups);
      } catch (error) {
        console.error("Error fetching startups:", error);
        toast.error("Failed to load startups");
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, [admin?.token]);

  // Get unique funding stages for filter dropdown
  const fundingStages = ["all", ...new Set(startups.map(startup => startup.fundingStage))];

  // Filter and sort startups
  const filteredStartups = startups
    .filter((startup) => 
      startup.name.toLowerCase().includes(search.toLowerCase()) && 
      (filterStage === "all" || startup.fundingStage === filterStage)
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "fundingStage") return a.fundingStage.localeCompare(b.fundingStage);
      return 0;
    });

  // Helper function to generate a background color based on funding stage
  const getFundingStageColor = (stage: string) => {
    const stageColors: {[key: string]: string} = {
      "Pre-Seed": "bg-gray-100",
      "Seed": "bg-gray-100",
      "Series A": "bg-gray-100",
      "Series B": "bg-gray-100",
      "Series C": "bg-gray-100",
      "Series D": "bg-gray-100",
      "Growth": "bg-gray-100",
    };
    return stageColors[stage] || "bg-gray-100";
  };

  // Helper function to format date (assuming we have created_at in the data)
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Incubated Startups</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view all approved startups in the incubator</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link 
            to="/dashboard" 
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            <span className="mr-2">←</span> Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search startups by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="pl-10 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-gray-500 focus:border-gray-500 w-full sm:w-auto"
              >
                <option value="all">All Stages</option>
                {fundingStages.filter(stage => stage !== "all").map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-4 bg-gray-50 border border-gray-200 rounded-md text-sm focus:ring-gray-500 focus:border-gray-500"
            >
              <option value="name">Sort by Name</option>
              <option value="fundingStage">Sort by Funding Stage</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Loading startups...</span>
          </div>
        </div>
      ) : filteredStartups.length === 0 ? (
        <div className="bg-white shadow-sm rounded-md p-8 text-center">
          <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-1">No startups found.</p>
          <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStartups.map((startup) => (
            <Link key={startup._id} to={`/admin/startups/${startup._id}`} className="block">
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-2 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-gray-800 truncate">
                      {startup.name}
                    </CardTitle>
                    <span className={`${getFundingStageColor(startup.fundingStage)} text-gray-600 text-xs px-2 py-1 rounded-md font-medium`}>
                      {startup.fundingStage}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600 truncate">{startup.email}</span>
                    </div>

                    {startup.teamSize && (
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{startup.teamSize} team members</span>
                      </div>
                    )}

                    {startup.revenue && (
                      <div className="flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">${startup.revenue.toLocaleString()}</span>
                      </div>
                    )}

                    {startup.industry && (
                      <div className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{startup.industry}</span>
                      </div>
                    )}

                    {startup.createdAt && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Joined {formatDate(startup.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <span className="text-xs font-medium text-gray-600 hover:text-gray-900">
                      View Details →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredStartups.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredStartups.length} {filteredStartups.length === 1 ? 'startup' : 'startups'}
          {filterStage !== 'all' ? ` in ${filterStage} stage` : ''}
        </div>
      )}
    </div>
  );
};

export default Startups;