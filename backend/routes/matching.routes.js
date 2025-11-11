const express = require('express');
const matchingRouter = express.Router();
const MatchingRequest = require('../models/matching.model');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const Startup = require('../models/startup.model');

// ✅ JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.headers['token'];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    // Try admin token first
    try {
      const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || 'your-admin-secret';
      const decoded = jwt.verify(token, JWT_ADMIN_SECRET);
      req.userId = decoded.id;
      req.userRole = 'admin';
      return next();
    } catch (adminErr) {
      // If admin fails, try user token
      const JWT_USER_SECRET = process.env.JWT_USER_SECRET || 'your-user-secret';
      const decoded = jwt.verify(token, JWT_USER_SECRET);
      req.userId = decoded.id;
      req.userRole = 'startup';
      return next();
    }
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
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
    console.error('[matching.request] error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 2. INCUBATOR: Get all requests sent to them
matchingRouter.get('/pending-requests', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only incubators can view this' });
    }

    const requests = await MatchingRequest.find({
      'sentToIncubators.incubatorId': req.userId
    }).sort({ createdAt: -1 });

    const formattedRequests = requests.map(req => ({
      id: req._id,
      startupName: req.startupName,
      startupDomain: req.startupDomain,
      problemStatement: req.problemStatement,
      solution: req.solution,
      founderName: req.founderName,
      founderEmail: req.founderEmail,
      myResponse: req.responses.find(r => r.incubatorId.toString() === req.userId),
      createdAt: req.createdAt
    }));

    res.json({
      success: true,
      requests: formattedRequests
    });
  } catch (error) {
    console.error('[matching.incubator-requests] error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 3. INCUBATOR: Accept or Reject request
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
      ...matchingRequest.responses[responseIndex].toObject(),
      status,
      feedback,
      contactPerson,
      contactEmail,
      respondedAt: new Date()
    };

    // Calculate match score
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
    console.error('[matching.respond] error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 4. STARTUP: Get their requests
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
    console.error('[matching.my-requests] error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 5. STARTUP: See interested incubators
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
    console.error('[matching.interested] error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 6. STARTUP: Select an incubator to match with
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
    console.error('[matching.select] error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = { matchingRouter };