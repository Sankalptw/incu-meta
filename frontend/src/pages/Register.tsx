import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "admin", // ✅ NEW
    specialization: "", // ✅ NEW
    location: "", // ✅ NEW
    website: "" // ✅ NEW
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // ✅ All specialization options
  const specializations = [
    { value: "Technology", label: "🖥️ Technology" },
    { value: "Healthcare", label: "🏥 Healthcare" },
    { value: "Finance", label: "💰 Finance" },
    { value: "E-commerce", label: "🛍️ E-commerce" },
    { value: "EdTech", label: "📚 EdTech" },
    { value: "ClimaTech", label: "🌍 ClimaTech" },
    { value: "AgriTech", label: "🌾 AgriTech" },
    { value: "AI/ML", label: "🤖 AI/ML" },
    { value: "Blockchain", label: "⛓️ Blockchain" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // ✅ NEW: Require specialization for incubators
    if (formData.userType === "incubator" && !formData.specialization) {
      toast.error("Please select a specialization for incubators");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // ✅ NEW: Pass all data including specialization to register
      await register(
        formData.name, 
        formData.email, 
        formData.password,
        formData.userType, // ✅ NEW
        formData.specialization, // ✅ NEW
        formData.location, // ✅ NEW
        formData.website // ✅ NEW
      );
      
      toast.success(`${formData.userType === 'incubator' ? 'Incubator' : 'Admin'} account created!`);
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      // Error is handled in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const isIncubator = formData.userType === "incubator";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold logo-text">IncuMeta</h1>
          <p className="text-gray-600 mt-2">Incubator Management Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isIncubator ? "Incubator Registration" : "Admin Registration"}
            </CardTitle>
            <CardDescription>
              {isIncubator 
                ? "Create your incubator account and get matched with startups" 
                : "Create your administrator account"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* ✅ NEW: Account Type Selector */}
              <div className="space-y-2">
                <label htmlFor="userType" className="text-sm font-medium">
                  Account Type
                </label>
                <select
                  id="userType"
                  value={formData.userType}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-incumeta-600"
                >
                  <option value="admin">👤 Platform Admin</option>
                  <option value="incubator">🏢 Incubator Manager</option>
                </select>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  {isIncubator ? "Incubator Name" : "Full Name"}
                </label>
                <Input
                  id="name"
                  placeholder={isIncubator ? "Tech Valley Incubator" : "John Doe"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={isIncubator ? "incubator@example.com" : "admin@example.com"}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              {/* ✅ NEW: Specialization (only for incubators) */}
              {isIncubator && (
                <div className="space-y-2">
                  <label htmlFor="specialization" className="text-sm font-medium">
                    Your Specialization 🎯
                  </label>
                  <select
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-incumeta-600"
                    required
                  >
                    <option value="">Select your specialization...</option>
                    {specializations.map((spec) => (
                      <option key={spec.value} value={spec.value}>
                        {spec.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Startups in this domain will be matched with you
                  </p>
                </div>
              )}

              {/* ✅ NEW: Location (only for incubators) */}
              {isIncubator && (
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              )}

              {/* ✅ NEW: Website (only for incubators) */}
              {isIncubator && (
                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">
                    Website
                  </label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourincubator.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-incumeta-600 hover:bg-incumeta-700" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-incumeta-600 hover:text-incumeta-800 font-medium">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;