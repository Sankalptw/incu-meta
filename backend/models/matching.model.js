const mongoose = require('mongoose');

const matchingRequestSchema = new mongoose.Schema({
  // Startup info
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup',
    required: true
  },
  startupName: String,
  startupDomain: {
    type: String,
    enum: ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'EdTech', 'ClimaTech', 'AgriTech', 'AI/ML', 'Blockchain', 'Other'],
    required: true
  },
  startupLogo: String,
  founderName: String,
  founderEmail: String,
  problemStatement: String,
  solution: String,
  
  // Which incubators received this request
  sentToIncubators: [{
    incubatorId: mongoose.Schema.Types.ObjectId,
    incubatorName: String,
    incubatorSpecialization: String,
    sentAt: { type: Date, default: Date.now }
  }],
  
  // Responses from each incubator
  responses: [{
    incubatorId: mongoose.Schema.Types.ObjectId,
    incubatorName: String,
    status: {
      type: String,
      enum: ['interested', 'rejected', 'pending'],
      default: 'pending'
    },
    feedback: String,
    respondedAt: Date,
    contactPerson: String,
    contactEmail: String
  }],
  
  // Which incubator was selected
  selectedIncubator: {
    incubatorId: mongoose.Schema.Types.ObjectId,
    incubatorName: String,
    selectedAt: Date
  },
  
  // Tracking
  matchScore: Number,
  status: {
    type: String,
    enum: ['pending', 'matched', 'rejected', 'in-progress'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MatchingRequest', matchingRequestSchema);