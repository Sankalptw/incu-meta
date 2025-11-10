// Enhanced Startup Schema for MongoDB
const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  logo: { type: String }, // URL to logo image
  website: { type: String },
  tagline: { type: String, maxlength: 100 },
  
  // Startup Details
  industry: { 
    type: String, 
    enum: ['AI', 'Fintech', 'Healthtech', 'Edtech', 'SaaS', 'E-commerce', 'Sustainability', 'D2C', 'IoT', 'Other'],
    required: true 
  },
  stage: { 
    type: String, 
    enum: ['Idea', 'MVP', 'Revenue', 'Growth', 'Scale'],
    required: true 
  },
  foundedDate: { type: Date },
  
  // Problem & Solution
  problemStatement: { type: String, maxlength: 500 },
  solution: { type: String, maxlength: 500 },
  uniqueApproach: { type: String, maxlength: 500 },
  
  // Team Information
  founders: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    linkedin: { type: String },
    experience: { type: String }
  }],
  teamSize: { type: Number, default: 1 },
  advisors: [{
    name: { type: String },
    expertise: { type: String },
    linkedin: { type: String }
  }],
  skillTags: [{ type: String }], // e.g., ['Marketing', 'Tech', 'Finance']
  
  // Traction Metrics
  traction: {
    activeUsers: { type: Number, default: 0 },
    customers: { type: Number, default: 0 },
    monthlyRevenue: { type: Number, default: 0 },
    growthPercentage: { type: Number, default: 0 },
    partnerships: [{ type: String }],
    mediaMetions: [{ type: String }]
  },
  
  // Financial Metrics
  financials: {
    aov: { type: Number }, // Average Order Value
    cac: { type: Number }, // Customer Acquisition Cost
    burnRate: { type: Number }, // Monthly burn rate
    grossMargin: { type: Number }, // Percentage
    runwayMonths: { type: Number }, // Months of runway left
    tam: { type: Number }, // Total Addressable Market
    sam: { type: Number }, // Serviceable Addressable Market
    som: { type: Number }  // Serviceable Obtainable Market
  },
  
  // Funding Information
  funding: {
    currentAsk: { type: Number },
    equityOffered: { type: Number }, // Percentage
    fundingStage: { 
      type: String, 
      enum: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Growth'] 
    },
    previousFunding: [{
      round: { type: String },
      amount: { type: Number },
      date: { type: Date },
      investors: [{ type: String }]
    }],
    totalRaised: { type: Number, default: 0 }
  },
  
  // Valuation & Shareholding
  shareholding: [{
    holderName: { type: String },
    holderType: { type: String, enum: ['Founder', 'Investor', 'Employee', 'Advisor'] },
    percentage: { type: Number }
  }],
  currentValuation: { type: Number },
  
  // Documents
  documents: {
    pitchDeck: { type: String }, // URL to file
    businessModelCanvas: { type: String }, // URL to file
    financialSummary: { type: String }, // URL to file
    incorporationCertificate: { type: String }, // URL to file
    gstCertificate: { type: String }, // URL to file
    otherDocuments: [{ 
      name: { type: String },
      url: { type: String }
    }]
  },
  
  // Profile Settings
  profileVisibility: { 
    type: String, 
    enum: ['Public', 'Incubators Only', 'Private'],
    default: 'Incubators Only'
  },
  socialLinks: {
    linkedin: { type: String },
    twitter: { type: String },
    crunchbase: { type: String }
  },
  
  // Application Status
  isApproved: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  profileCompleteness: { type: Number, default: 0 }, // Percentage
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate profile completeness before saving
startupSchema.pre('save', function(next) {
  let completeness = 0;
  let totalFields = 20;
  let filledFields = 0;
  
  // Check basic info
  if (this.name) filledFields++;
  if (this.tagline) filledFields++;
  if (this.website) filledFields++;
  if (this.logo) filledFields++;
  if (this.problemStatement) filledFields++;
  if (this.solution) filledFields++;
  
  // Check team
  if (this.founders && this.founders.length > 0) filledFields++;
  if (this.teamSize > 1) filledFields++;
  
  // Check traction
  if (this.traction.activeUsers > 0) filledFields++;
  if (this.traction.monthlyRevenue > 0) filledFields++;
  
  // Check financials
  if (this.financials.burnRate) filledFields++;
  if (this.financials.tam) filledFields++;
  
  // Check funding
  if (this.funding.currentAsk) filledFields++;
  
  // Check documents
  if (this.documents.pitchDeck) filledFields++;
  if (this.documents.businessModelCanvas) filledFields++;
  
  // Check social links
  if (this.socialLinks.linkedin) filledFields++;
  
  this.profileCompleteness = Math.round((filledFields / totalFields) * 100);
  this.isProfileComplete = this.profileCompleteness >= 80;
  this.updatedAt = Date.now();
  
  next();
});

const StartupModel = mongoose.model('Startup', startupSchema);

module.exports = StartupModel;