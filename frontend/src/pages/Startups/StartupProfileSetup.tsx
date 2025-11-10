import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Building2, Users, TrendingUp, FileText, DollarSign, 
  Settings, Upload, Plus, X, Save, Eye
} from 'lucide-react';

const StartupProfileSetup = () => {
  const [profileData, setProfileData] = useState({
    // Basic Info
    name: '',
    tagline: '',
    website: '',
    logo: null,
    industry: '',
    stage: '',
    foundedDate: '',
    
    // Problem & Solution
    problemStatement: '',
    solution: '',
    uniqueApproach: '',
    
    // Team
    founders: [{ name: '', role: '', linkedin: '', experience: '' }],
    teamSize: 1,
    advisors: [],
    skillTags: [],
    
    // Traction
    traction: {
      activeUsers: 0,
      customers: 0,
      monthlyRevenue: 0,
      growthPercentage: 0,
      partnerships: []
    },
    
    // Financials
    financials: {
      aov: 0,
      cac: 0,
      burnRate: 0,
      grossMargin: 0,
      tam: 0,
      sam: 0,
      som: 0
    },
    
    // Funding
    funding: {
      currentAsk: 0,
      equityOffered: 0,
      fundingStage: ''
    }
  });
  
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);

  // Calculate profile completeness
  useEffect(() => {
    let filled = 0;
    const checks = [
      profileData.name,
      profileData.tagline,
      profileData.website,
      profileData.industry,
      profileData.stage,
      profileData.problemStatement,
      profileData.solution,
      profileData.founders[0].name,
      profileData.traction.monthlyRevenue > 0,
      profileData.funding.currentAsk > 0
    ];
    
    filled = checks.filter(Boolean).length;
    setProfileCompleteness((filled / 10) * 100);
  }, [profileData]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addFounder = () => {
    setProfileData(prev => ({
      ...prev,
      founders: [...prev.founders, { name: '', role: '', linkedin: '', experience: '' }]
    }));
  };

  const removeFounder = (index) => {
    setProfileData(prev => ({
      ...prev,
      founders: prev.founders.filter((_, i) => i !== index)
    }));
  };

  const updateFounder = (index, field, value) => {
    const newFounders = [...profileData.founders];
    newFounders[index][field] = value;
    setProfileData(prev => ({ ...prev, founders: newFounders }));
  };

  const addSkillTag = (tag) => {
    if (tag && !profileData.skillTags.includes(tag)) {
      setProfileData(prev => ({
        ...prev,
        skillTags: [...prev.skillTags, tag]
      }));
    }
  };

  const removeSkillTag = (tag) => {
    setProfileData(prev => ({
      ...prev,
      skillTags: prev.skillTags.filter(t => t !== tag)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Your Startup Profile</h1>
        <p className="text-gray-600">Build an investor-ready profile to attract incubators and funding</p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Profile Completeness</span>
            <span className="font-medium">{Math.round(profileCompleteness)}%</span>
          </div>
          <Progress value={profileCompleteness} className="h-2" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="problem">Problem & Solution</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="traction">Traction</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about your startup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Startup Name *</Label>
                  <Input 
                    placeholder="Enter startup name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input 
                    placeholder="https://your-startup.com"
                    value={profileData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Tagline *</Label>
                <Input 
                  placeholder="One-line description (max 100 chars)"
                  maxLength={100}
                  value={profileData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Industry *</Label>
                  <Select 
                    value={profileData.industry} 
                    onValueChange={(value) => handleInputChange('industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI">AI/ML</SelectItem>
                      <SelectItem value="Fintech">Fintech</SelectItem>
                      <SelectItem value="Healthtech">Healthtech</SelectItem>
                      <SelectItem value="Edtech">Edtech</SelectItem>
                      <SelectItem value="SaaS">SaaS</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Sustainability">Sustainability</SelectItem>
                      <SelectItem value="D2C">D2C</SelectItem>
                      <SelectItem value="IoT">IoT</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stage *</Label>
                  <Select 
                    value={profileData.stage} 
                    onValueChange={(value) => handleInputChange('stage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Idea">Idea</SelectItem>
                      <SelectItem value="MVP">MVP</SelectItem>
                      <SelectItem value="Revenue">Revenue</SelectItem>
                      <SelectItem value="Growth">Growth</SelectItem>
                      <SelectItem value="Scale">Scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Founded Date</Label>
                  <Input 
                    type="date"
                    value={profileData.foundedDate}
                    onChange={(e) => handleInputChange('foundedDate', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Logo</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Problem & Solution Tab */}
        <TabsContent value="problem">
          <Card>
            <CardHeader>
              <CardTitle>Problem & Solution</CardTitle>
              <CardDescription>What problem are you solving and how?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Problem Statement *</Label>
                <Textarea 
                  placeholder="Describe the problem you're solving (max 500 chars)"
                  maxLength={500}
                  rows={4}
                  value={profileData.problemStatement}
                  onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {profileData.problemStatement.length}/500 characters
                </p>
              </div>
              
              <div>
                <Label>Your Solution *</Label>
                <Textarea 
                  placeholder="Describe your solution (max 500 chars)"
                  maxLength={500}
                  rows={4}
                  value={profileData.solution}
                  onChange={(e) => handleInputChange('solution', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {profileData.solution.length}/500 characters
                </p>
              </div>
              
              <div>
                <Label>Unique Approach</Label>
                <Textarea 
                  placeholder="What makes your approach unique? (max 500 chars)"
                  maxLength={500}
                  rows={4}
                  value={profileData.uniqueApproach}
                  onChange={(e) => handleInputChange('uniqueApproach', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {profileData.uniqueApproach.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>Tell us about your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Founders Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label>Founders</Label>
                  <Button size="sm" variant="outline" onClick={addFounder}>
                    <Plus className="h-4 w-4 mr-1" /> Add Founder
                  </Button>
                </div>
                {profileData.founders.map((founder, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="Name"
                        value={founder.name}
                        onChange={(e) => updateFounder(index, 'name', e.target.value)}
                      />
                      <Input 
                        placeholder="Role"
                        value={founder.role}
                        onChange={(e) => updateFounder(index, 'role', e.target.value)}
                      />
                      <Input 
                        placeholder="LinkedIn URL"
                        value={founder.linkedin}
                        onChange={(e) => updateFounder(index, 'linkedin', e.target.value)}
                      />
                      <Input 
                        placeholder="Years of Experience"
                        value={founder.experience}
                        onChange={(e) => updateFounder(index, 'experience', e.target.value)}
                      />
                    </div>
                    {index > 0 && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="mt-2"
                        onClick={() => removeFounder(index)}
                      >
                        <X className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Team Size */}
              <div>
                <Label>Total Team Size</Label>
                <Input 
                  type="number"
                  min="1"
                  value={profileData.teamSize}
                  onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value))}
                />
              </div>

              {/* Skills Tags */}
              <div>
                <Label>Team Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Marketing', 'Tech', 'Finance', 'Operations', 'Sales', 'Product', 'Design'].map(skill => (
                    <Badge 
                      key={skill}
                      variant={profileData.skillTags.includes(skill) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => 
                        profileData.skillTags.includes(skill) 
                          ? removeSkillTag(skill) 
                          : addSkillTag(skill)
                      }
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traction Tab */}
        <TabsContent value="traction">
          <Card>
            <CardHeader>
              <CardTitle>Traction Metrics</CardTitle>
              <CardDescription>Show your growth and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Active Users</Label>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={profileData.traction.activeUsers}
                    onChange={(e) => handleNestedChange('traction', 'activeUsers', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Total Customers</Label>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={profileData.traction.customers}
                    onChange={(e) => handleNestedChange('traction', 'customers', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Monthly Revenue (₹)</Label>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={profileData.traction.monthlyRevenue}
                    onChange={(e) => handleNestedChange('traction', 'monthlyRevenue', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Growth % (MoM)</Label>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={profileData.traction.growthPercentage}
                    onChange={(e) => handleNestedChange('traction', 'growthPercentage', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials">
          <Card>
            <CardHeader>
              <CardTitle>Financial Metrics</CardTitle>
              <CardDescription>Key financial indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Average Order Value (₹)</Label>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={profileData.financials.aov}
                    onChange={(e) => handleNestedChange('financials', 'aov', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Customer Acquisition Cost (₹)</Label>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={profileData.financials.cac}
                    onChange={(e) => handleNestedChange('financials', 'cac', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Monthly Burn Rate (₹)</Label>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={profileData.financials.burnRate}
                    onChange={(e) => handleNestedChange('financials', 'burnRate', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Gross Margin (%)</Label>
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={profileData.financials.grossMargin}
                    onChange={(e) => handleNestedChange('financials', 'grossMargin', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>TAM - Total Addressable Market (₹)</Label>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={profileData.financials.tam}
                    onChange={(e) => handleNestedChange('financials', 'tam', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>SAM - Serviceable Market (₹)</Label>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={profileData.financials.sam}
                    onChange={(e) => handleNestedChange('financials', 'sam', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funding Tab */}
        <TabsContent value="funding">
          <Card>
            <CardHeader>
              <CardTitle>Funding Requirements</CardTitle>
              <CardDescription>Your funding needs and stage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Funding Ask (₹)</Label>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="2500000"
                    value={profileData.funding.currentAsk}
                    onChange={(e) => handleNestedChange('funding', 'currentAsk', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Equity Offered (%)</Label>
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10"
                    value={profileData.funding.equityOffered}
                    onChange={(e) => handleNestedChange('funding', 'equityOffered', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Funding Stage</Label>
                  <Select 
                    value={profileData.funding.fundingStage} 
                    onValueChange={(value) => handleNestedChange('funding', 'fundingStage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                      <SelectItem value="Seed">Seed</SelectItem>
                      <SelectItem value="Series A">Series A</SelectItem>
                      <SelectItem value="Series B">Series B</SelectItem>
                      <SelectItem value="Series C">Series C</SelectItem>
                      <SelectItem value="Growth">Growth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Based on your ask of <strong>₹{profileData.funding.currentAsk.toLocaleString()}</strong> for{' '}
                  <strong>{profileData.funding.equityOffered}%</strong> equity, your implied valuation is{' '}
                  <strong>
                    ₹{profileData.funding.currentAsk 
                      ? ((profileData.funding.currentAsk / profileData.funding.equityOffered) * 100).toLocaleString() 
                      : 0}
                  </strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview Public Profile
        </Button>
        <div className="space-x-3">
          <Button variant="outline">Save as Draft</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
            <Save className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartupProfileSetup;