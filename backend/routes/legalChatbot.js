// ===== FILE: routes/legalChatbot.js =====
const express = require('express');
const router = express.Router();

// In-memory storage for chat history (replace with MongoDB later if needed)
const chatHistory = {};

// Legal Response Generator
function generateLegalResponse(query) {
  const lower = query.toLowerCase();

  const responses = {
    incorporation: `For business incorporation:
1️⃣ Choose entity type (LLC, C-Corp, S-Corp)
2️⃣ File articles of incorporation with your state
3️⃣ Get an EIN from the IRS
4️⃣ Draft bylaws and operating agreements
5️⃣ Register with state revenue department

⚠️ Consult a lawyer for jurisdiction-specific requirements.`,

    ip: `Protect your intellectual property:
1️⃣ Trademarks - for brand names & logos (₹4,500-15,000)
2️⃣ Patents - for inventions (₹10,000-50,000+)
3️⃣ Copyrights - for creative works
4️⃣ Trade Secrets - for proprietary information

✅ Register with relevant authorities (USPTO/IPO)
⏰ Early registration establishes priority dates`,

    contracts: `Essential startup contracts:
1️⃣ Terms of Service (TOS)
2️⃣ Privacy Policy (GDPR/CCPA compliant)
3️⃣ Non-Disclosure Agreements (NDA)
4️⃣ Founder's Agreement
5️⃣ Employment Agreements
6️⃣ Service Level Agreements (SLA)

⚠️ Always have contracts reviewed by legal counsel.`,

    compliance: `Maintain regulatory compliance:
1️⃣ Understand industry-specific regulations
2️⃣ Maintain proper business records
3️⃣ Follow data protection laws (GDPR, CCPA, DISHA)
4️⃣ File taxes on time
5️⃣ Adhere to employment laws
6️⃣ Get necessary licenses and permits

✅ Document everything and conduct regular audits`,

    employment: `Employment best practices:
1️⃣ Clear employment contracts
2️⃣ Non-compete & NDA clauses
3️⃣ Equity vesting schedules (4-year typical)
4️⃣ Workers' compensation insurance
5️⃣ Equal opportunity policies
6️⃣ Leave & benefits policies

⚠️ Comply with local labor laws.`,

    funding: `Fundraising legal requirements:
1️⃣ Prepare SAFE agreements or convertible notes
2️⃣ Understand equity dilution
3️⃣ Comply with securities regulations
4️⃣ Maintain clear cap table
5️⃣ Prepare investment agreements
6️⃣ Due diligence documentation

✅ Have all documents reviewed before pitching`,

    founder: `Founder agreements should cover:
✅ Equity distribution & vesting schedules
✅ Roles & responsibilities of each founder
✅ Decision-making authority & voting rights
✅ Dispute resolution process
✅ Exit clauses & buyout terms
✅ IP ownership assignment
✅ Non-compete & confidentiality clauses

⚠️ Get this in writing BEFORE starting your company!`,

    tax: `Tax considerations for startups:
1️⃣ Register for GST (if applicable in India)
2️⃣ File income tax returns annually
3️⃣ Maintain proper accounting records
4️⃣ Understand deductible business expenses
5️⃣ Consider tax implications of equity
6️⃣ Plan for quarterly tax payments

💡 Consult a CA for tax optimization strategies`,

    privacy: `Privacy & Data Protection:
1️⃣ Comply with GDPR (EU users)
2️⃣ Comply with CCPA (California users)
3️⃣ Follow DISHA Act (India)
4️⃣ Create a Privacy Policy
5️⃣ Implement data security measures
6️⃣ Get user consent for data collection

✅ Document all data handling practices`,
  };

  // Match query to topic
  for (const [key, response] of Object.entries(responses)) {
    if (lower.includes(key)) return response;
  }

  if (lower.includes('help') || lower.includes('advice') || lower.includes('hello'))
    return `I can help with:\n📋 Incorporation\n🔐 IP/Patents/Trademarks\n📝 Contracts\n⚖️ Compliance\n👥 Employment\n💰 Funding\n📊 Tax\n🔒 Privacy\n\nWhat's your legal concern?`;

  if (lower.includes('cost') || lower.includes('price'))
    return `Costs vary by jurisdiction:\n• Incorporation: $100-500 (US), ₹5,000-15,000 (India)\n• Trademark: $300-400 (US), ₹4,500-15,000 (India)\n• Legal consultation: $150-400/hour\n\n💡 Check if your incubator offers legal support!`;

  return `I understand your question. Please ask about:\n📋 Incorporation\n🔐 IP/Intellectual Property\n📝 Contracts & Agreements\n⚖️ Compliance & Regulations\n👥 Employment Law\n💰 Funding & Investor Docs\n📊 Tax Planning\n🔒 Privacy & Data Protection\n\nOr describe your specific legal issue!`;
}

// POST - Send message and get response
router.post('/chat', (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Message and userId are required' });
    }

    // Generate response
    const botResponse = generateLegalResponse(message);

    // Initialize user chat history if doesn't exist
    if (!chatHistory[userId]) {
      chatHistory[userId] = [];
    }

    // Store messages
    chatHistory[userId].push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    chatHistory[userId].push({
      role: 'bot',
      content: botResponse,
      timestamp: new Date()
    });

    res.json({
      success: true,
      userMessage: message,
      botResponse: botResponse,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Retrieve chat history
router.get('/chat-history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const history = chatHistory[userId] || [];
    
    res.json({
      success: true,
      history: history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Clear chat history
router.delete('/chat-history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    delete chatHistory[userId];
    
    res.json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;