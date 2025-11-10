const express = require('express');
const matchingRouter = express.Router();
const MatchingRequest = require('../models/matching.model');
const jwt = require('jsonwebtoken');

// Import your Admin and Startup models from db.js
// Adjust this based on how your db.js exports!
const Admin = require('../models/admin.model');
const Startup = require('../models/startup.model');


// Middleware
// const verifyToken = (req, res, next) => {
//   const token = req.headers['authorization']?.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'No token provided' });
  
//   jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
//     if (err) return res.status(403).json({ error: 'Invalid token' });
//     req.userId = decoded.id;
//     req.userRole = decoded.role;
//     next();
//   });
// };
// Temporary middleware for testing (bypasses auth)
const verifyToken = (req, res, next) => {
  req.userId = "dummyUserId";
  req.userRole = "startup"; // or "admin" if testing incubator routes
  next();
};


// ✅ 1. STARTUP: Create matching request
matchingRouter.post('/request', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'startup') {
      return res.status(403).json({ error: 'Only startups can create requests' });
    }

    const { startupId, startupName, startupDomain, founderName, founderEmail, problemStatement, solution, startupLogo } = req.body;

    if (!startupId || !startupDomain) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find all incubators with matching specialization
    const matchingIncubators = await Admin.find({
      userType: 'incubator',
      specialization: startupDomain
    });

    if (matchingIncubators.length === 0) {
      return res.status(404).json({ 
        error: `No incubators found for ${startupDomain} domain. Try another domain!` 
      });
    }

    // Prepare sent to list
    const sentToIncubators = matchingIncubators.map(inc => ({
      incubatorId: inc._id,
      incubatorName: inc.name,
      incubatorSpecialization: inc.specialization
    }));

    // Create matching request
    const matchingRequest = new MatchingRequest({
      startupId,
      startupName,
      startupDomain,
      startupLogo,
      founderName,
      founderEmail,
      problemStatement,
      solution,
      sentToIncubators,
      responses: matchingIncubators.map(inc => ({
        incubatorId: inc._id,
        incubatorName: inc.name,
        status: 'pending'
      }))
    });

    await matchingRequest.save();

    res.json({
      success: true,
      message: `Request sent to ${matchingIncubators.length} incubators!`,
      requestId: matchingRequest._id,
      incubatorsCount: matchingIncubators.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 2. INCUBATOR: Get all pending requests
matchingRouter.get('/pending-requests', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only incubators can view requests' });
    }

    // Find incubator
    const incubator = await Admin.findById(req.userId);
    if (!incubator || incubator.userType !== 'incubator') {
      return res.status(403).json({ error: 'Not an incubator account' });
    }

    // Find requests sent to this incubator with pending status
    const pendingRequests = await MatchingRequest.find({
      'responses.incubatorId': req.userId,
      'responses.status': 'pending'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingRequests.length,
      requests: pendingRequests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 3. INCUBATOR: View full request details
matchingRouter.get('/request/:requestId', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only incubators can view requests' });
    }

    const { requestId } = req.params;
    const matchingRequest = await MatchingRequest.findById(requestId);

    if (!matchingRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if authorized
    const incubatorResponse = matchingRequest.responses.find(
      r => r.incubatorId.toString() === req.userId
    );

    if (!incubatorResponse) {
      return res.status(403).json({ error: 'Not authorized to view this request' });
    }

    res.json({
      success: true,
      request: matchingRequest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 4. INCUBATOR: Accept or Reject request
matchingRouter.put('/request/:requestId/respond', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only incubators can respond' });
    }

    const { requestId } = req.params;
    const { status, feedback, contactPerson, contactEmail } = req.body;

    if (!['interested', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status (use interested or rejected)' });
    }

    const matchingRequest = await MatchingRequest.findById(requestId);
    if (!matchingRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Find and update this incubator's response
    const responseIndex = matchingRequest.responses.findIndex(
      r => r.incubatorId.toString() === req.userId
    );

    if (responseIndex === -1) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    matchingRequest.responses[responseIndex] = {
      ...matchingRequest.responses[responseIndex],
      status,
      feedback,
      contactPerson,
      contactEmail,
      respondedAt: new Date()
    };

    // Calculate match score (% of interested incubators)
    const interestedCount = matchingRequest.responses.filter(r => r.status === 'interested').length;
    const totalResponses = matchingRequest.responses.filter(r => r.respondedAt).length;
    const matchScore = totalResponses > 0 ? (interestedCount / totalResponses) * 100 : 0;
    matchingRequest.matchScore = matchScore;

    // Update status if first interest
    if (status === 'interested' && matchingRequest.status === 'pending') {
      matchingRequest.status = 'in-progress';
    }

    await matchingRequest.save();

    res.json({
      success: true,
      message: `Request marked as ${status}`,
      matchScore: matchingRequest.matchScore.toFixed(1)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 5. STARTUP: Get their requests
matchingRouter.get('/my-requests', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'startup') {
      return res.status(403).json({ error: 'Only startups can view their requests' });
    }

    const myRequests = await MatchingRequest.find({ startupId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests: myRequests.map(req => ({
        id: req._id,
        domain: req.startupDomain,
        status: req.status,
        matchScore: req.matchScore,
        interestedCount: req.responses.filter(r => r.status === 'interested').length,
        totalIncubators: req.responses.length,
        selectedIncubator: req.selectedIncubator,
        createdAt: req.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 6. STARTUP: See interested incubators
matchingRouter.get('/request/:requestId/interested', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'startup') {
      return res.status(403).json({ error: 'Only startups can view this' });
    }

    const { requestId } = req.params;
    const matchingRequest = await MatchingRequest.findById(requestId);

    if (!matchingRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Get interested responses with incubator details
    const interestedIncubators = await Promise.all(
      matchingRequest.responses
        .filter(r => r.status === 'interested')
        .map(async (response) => {
          const incubator = await Admin.findById(response.incubatorId)
            .select('name specialization email location website');
          return {
            incubatorId: response.incubatorId,
            name: incubator?.name,
            specialization: incubator?.specialization,
            email: response.contactEmail || incubator?.email,
            location: incubator?.location,
            website: incubator?.website,
            contactPerson: response.contactPerson,
            feedback: response.feedback,
            respondedAt: response.respondedAt
          };
        })
    );

    res.json({
      success: true,
      count: interestedIncubators.length,
      interestedIncubators
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 7. STARTUP: Select an incubator to match with
matchingRouter.put('/request/:requestId/select/:incubatorId', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'startup') {
      return res.status(403).json({ error: 'Only startups can select incubators' });
    }

    const { requestId, incubatorId } = req.params;
    const matchingRequest = await MatchingRequest.findById(requestId);

    if (!matchingRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Verify incubator is interested
    const interestedResponse = matchingRequest.responses.find(
      r => r.incubatorId.toString() === incubatorId && r.status === 'interested'
    );

    if (!interestedResponse) {
      return res.status(400).json({ error: 'This incubator is not interested' });
    }

    const incubator = await Admin.findById(incubatorId);

    matchingRequest.selectedIncubator = {
      incubatorId,
      incubatorName: incubator.name,
      selectedAt: new Date()
    };

    matchingRequest.status = 'matched';
    await matchingRequest.save();

    res.json({
      success: true,
      message: 'Successfully matched with incubator! 🎉',
      selectedIncubator: matchingRequest.selectedIncubator
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { matchingRouter };