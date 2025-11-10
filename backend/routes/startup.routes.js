const express = require('express');
const router = express.Router();
const StartupModel = require('../models/startup.model');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    req.startupId = decoded.id;
    next();
  });
};

// Get startup profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const startup = await StartupModel.findById(req.startupId).select('-password');
    
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }
    
    res.json({ success: true, startup });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update basic information
router.put('/profile/basic', verifyToken, async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      tagline: req.body.tagline,
      website: req.body.website,
      industry: req.body.industry,
      stage: req.body.stage,
      foundedDate: req.body.foundedDate
    };
    
    const startup = await StartupModel.findByIdAndUpdate(
      req.startupId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, startup });
  } catch (error) {
    res.status(500).json({ message: 'Error updating basic info', error: error.message });
  }
});

// Update problem & solution
router.put('/profile/problem-solution', verifyToken, async (req, res) => {
  try {
    const updates = {
      problemStatement: req.body.problemStatement,
      solution: req.body.solution,
      uniqueApproach: req.body.uniqueApproach
    };
    
    const startup = await StartupModel.findByIdAndUpdate(
      req.startupId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, startup });
  } catch (error) {
    res.status(500).json({ message: 'Error updating problem & solution', error: error.message });
  }
});

// Update team information
router.put('/profile/team', verifyToken, async (req, res) => {
  try {
    const updates = {
      founders: req.body.founders,
      teamSize: req.body.teamSize,
      advisors: req.body.advisors,
      skillTags: req.body.skillTags
    };
    
    const startup = await StartupModel.findByIdAndUpdate(
      req.startupId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, startup });
  } catch (error) {
    res.status(500).json({ message: 'Error updating team info', error: error.message });
  }
});

// Update traction metrics
router.put('/profile/traction', verifyToken, async (req, res) => {
  try {
    const updates = {
      'traction.activeUsers': req.body.activeUsers,
      'traction.customers': req.body.customers,
      'traction.monthlyRevenue': req.body.monthlyRevenue,
      'traction.growthPercentage': req.body.growthPercentage,
      'traction.partnerships': req.body.partnerships,
      'traction.mediaMetions': req.body.mediaMetions
    };
    
    const startup = await StartupModel.findByIdAndUpdate(
      req.startupId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, startup });
  } catch (error) {
    res.status(500).json({ message: 'Error updating traction', error: error.message });
  }
});

// Update financial metrics
router.put('/profile/financials', verifyToken, async (req, res) => {
  try {
    const updates = {
      'financials.aov': req.body.aov,
      'financials.cac': req.body.cac,
      'financials.burnRate': req.body.burnRate,
      'financials.grossMargin': req.body.grossMargin,
      'financials.runwayMonths': req.body.runwayMonths,
      'financials.tam': req.body.tam,
      'financials.sam': req.body.sam,
      'financials.som': req.body.som
    };
    
    const startup = await StartupModel.findByIdAndUpdate(
      req.startupId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, startup });
  } catch (error) {
    res.status(500).json({ message: 'Error updating financials', error: error.message });
  }
});

// Update funding information
router.put('/profile/funding', verifyToken, async (req, res) => {
  try {
    const updates = {
      'funding.currentAsk': req.body.currentAsk,
      'funding.equityOffered': req.body.equityOffered,
      'funding.fundingStage': req.body.fundingStage,
      'funding.previousFunding': req.body.previousFunding,
      'funding.totalRaised': req.body.totalRaised
    };
    
    const startup = await StartupModel.findByIdAndUpdate(
      req.startupId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, startup });
  } catch (error) {
    res.status(500).json({ message: 'Error updating funding info', error: error.message });
  }
});

// Upload logo
router.post('/profile/upload-logo', verifyToken, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const logoUrl = `/uploads/${req.file.filename}`;
    
    const startup = await StartupModel.findByIdAndUpdate(
      req.startupId,
      { $set: { logo: logoUrl } },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, logoUrl, startup });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading logo', error: error.message });
  }
});

// Upload documents
router.post('/profile/upload-document', verifyToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const documentType = req.body.type; // pitchDeck, businessModelCanvas, etc.
    const documentUrl = `/uploads/${req.file.filename}`;
    
    const updateField = `documents.${documentType}`;
    
    const startup = await StartupModel.findByIdAndUpdate(
      req.startupId,
      { $set: { [updateField]: documentUrl } },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, documentUrl, startup });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

// Update profile visibility
router.put('/profile/visibility', verifyToken, async (req, res) => {
  try {
    const { visibility } = req.body;
    
    if (!['Public', 'Incubators Only', 'Private'].includes(visibility)) {
      return res.status(400).json({ message: 'Invalid visibility setting' });
    }
    
    const startup = await StartupModel.findByIdAndUpdate(
      req.startupId,
      { $set: { profileVisibility: visibility } },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, startup });
  } catch (error) {
    res.status(500).json({ message: 'Error updating visibility', error: error.message });
  }
});

// Get public profile (for incubators/investors)
router.get('/public/:startupId', async (req, res) => {
  try {
    const startup = await StartupModel.findById(req.params.startupId)
      .select('-password -financials.burnRate -shareholding');
    
    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }
    
    // Check visibility settings
    if (startup.profileVisibility === 'Private') {
      return res.status(403).json({ message: 'This profile is private' });
    }
    
    res.json({ success: true, startup });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public profile', error: error.message });
  }
});

// Save complete profile (all sections at once)
router.put('/profile/save-all', verifyToken, async (req, res) => {
  try {
    const startup = await StartupModel.findByIdAndUpdate(
      req.startupId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ 
      success: true, 
      startup,
      profileCompleteness: startup.profileCompleteness,
      isProfileComplete: startup.isProfileComplete
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving profile', error: error.message });
  }
});

// ✅ FIXED: Export with curly braces (named export)
module.exports = { startupRouter: router };