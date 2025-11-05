import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Building2, Mail, Lock, Briefcase, Users, 
  DollarSign, LineChart, ArrowRight
} from "lucide-react";
// import { motion } from "framer-motion";
// import { Label } from "@/components/ui/label";
// import { NavLink } from "react-router-dom";
const Apply = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    industry: "",
    fundingStage: "Ideation",
    revenue: "",
    teamSize: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/user/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          revenue: Number(formData.revenue),
          teamSize: Number(formData.teamSize),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Application submitted successfully!");
        setFormData({
          email: "",
          password: "",
          name: "",
          industry: "",
          fundingStage: "Ideation",
          revenue: "",
          teamSize: "",
        });
      } else {
        toast.error(data.message || "Application failed");
      }
    } catch (error) {
      toast.error("An error occurred while submitting application");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-100">

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Apply for Incubation</h1>
        <p className="text-gray-500">Fill out the form below to submit your startup for consideration</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Account Information</h2>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <Mail size={18} />
            </div>
            <Input
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="pl-10 py-6 bg-gray-50"
              required
            />
          </div>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <Lock size={18} />
            </div>
            <Input
              name="password"
              type="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              className="pl-10 py-6 bg-gray-50"
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Startup Details</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Building2 size={18} />
              </div>
              <Input
                name="name"
                placeholder="Startup Name"
                value={formData.name}
                onChange={handleChange}
                className="pl-10 py-6 bg-gray-50"
                required
              />
            </div>
            
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Briefcase size={18} />
              </div>
              <Input
                name="industry"
                placeholder="Industry"
                value={formData.industry}
                onChange={handleChange}
                className="pl-10 py-6 bg-gray-50"
                required
              />
            </div>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Funding Stage</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <LineChart size={18} />
                </div>
                <select
                  name="fundingStage"
                  value={formData.fundingStage}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-10 py-3 bg-gray-50 text-gray-800 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="Ideation">Ideation</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Growth">Growth</option>
                </select>
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Revenue (USD)</label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <DollarSign size={18} />
                </div>
                <Input
                  name="revenue"
                  type="number"
                  placeholder="0"
                  value={formData.revenue}
                  onChange={handleChange}
                  className="pl-10 py-3 bg-gray-50"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-4 relative">
            <label className="block text-sm font-medium text-gray-600 mb-1">Team Size</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Users size={18} />
              </div>
              <Input
                name="teamSize"
                type="number"
                placeholder="Number of team members"
                value={formData.teamSize}
                onChange={handleChange}
                className="pl-10 py-3 bg-gray-50"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="pt-6">
          <Button 
            type="submit" 
            className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            disabled={loading}
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                Submit Application <ArrowRight size={18} />
              </>
            )}
          </Button>
          <p className="text-xs text-center text-gray-500 mt-4">
            By submitting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </form>
    </div>
    </div>
  );
};

export default Apply;