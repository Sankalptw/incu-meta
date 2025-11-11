const express = require('express');
const router = express.Router();

// NOTE: This enhanced router is intentionally "info-dense" — it ships with a large
// in-memory knowledgeBase and several helper endpoints so you can add "everything".
// Replace in-memory stores with MongoDB / file storage for production.

// --- In-memory stores (replace with DB in production) ---
const chatHistory = {}; // { userId: [{role, content, timestamp}] }
const rateLimits = {}; // simple per-user rate limiter
let knowledgeBase = [
  {
    id: 'incorporation',
    title: 'Company Incorporation (LLC, Pvt Ltd, C-Corp, S-Corp)',
    tags: ['incorporation', 'company', 'entity', 'registration'],
    content: `Overview and checklist for incorporating a business:\n
1) Choose an entity type (sole proprietor, partnership, LLP, Pvt Ltd/LLC, C-Corp, S-Corp) — consider liability, tax and investor preferences.\n
2) Name reservation and availability checks (local registrar / MCA in India / Secretary of State in US).\n
3) Prepare and file formation documents: Articles of Incorporation (US) / Memorandum & Articles (India).\n
4) Appoint directors / members and prepare initial resolutions.\n
5) Draft bylaws / operating agreement and shareholder agreements.\n
6) Obtain Tax IDs (EIN in US) and register for GST/PAN/TAN where applicable.\n
7) Open corporate bank account and maintain statutory registers.\n
8) Compliance calendar (annual filings, board minutes, tax filings).\n
⚠️ Jurisdiction-specific steps differ; consult a lawyer.`,
  },
  {
    id: 'trademark',
    title: 'Trademarks & Brand Protection',
    tags: ['trademark', 'brand', 'logo', 'ip'],
    content: `What to know about trademarks:\n
• What to protect: brand names, logos, taglines, shapes and sounds.\n
• Clearance search: run a knock-out search in trademark registries and domain marketplaces.\n
• Filing options: national filing (e.g., USPTO/IPO) and international via Madrid Protocol.\n
• Maintenance: monitor, renew (period depends on jurisdiction).\n
• Enforcement: send cease-and-desist, use customs recordation for counterfeits.\n
Estimated costs vary by jurisdiction and class.`,
  },
  {
    id: 'patent',
    title: 'Patents & Invention Protection',
    tags: ['patent', 'invention', 'ip'],
    content: `Patent basics:\n
1) Patentability checks: novelty, inventive step (non-obviousness), industrial applicability.\n
2) Types: utility patents, design patents, provisional vs non-provisional (US).\n
3) Filing strategy: file provisional to secure priority, then PCT for international protection.\n
4) Costs: filing + prosecution + maintenance — can be significant.\n
5) Alternatives: trade secrets if you can't or don't want to disclose.`,
  },
  {
    id: 'copyright',
    title: 'Copyrights & Creative Works',
    tags: ['copyright', 'content', 'media'],
    content: `Copyright fundamentals:\n
• Protects creative expressions: code, text, art, music, video.\n
• Automatic on creation in many jurisdictions; registration often helps enforcement.\n
• Licenses: define scope (exclusive/non-exclusive), territory, duration, and royalties.\n
• DMCA takedown procedures and platform notice-and-takedown.`,
  },
  {
    id: 'contracts',
    title: 'Key Contracts for Startups',
    tags: ['contract', 'agreement', 'tds', 'sla'],
    content: `Common contracts to have ready:\n
1) Founders' Agreement / Shareholders' Agreement\n2) Employment Agreements (offer letters, probation terms)\n3) Independent Contractor Agreements\n4) NDAs (mutual/unilateral)\n5) Terms of Service & Privacy Policy (for products)\n6) Service Level Agreements (SLAs) with customers\n7) Vendor & supplier contracts\n
Each contract should include: parties, scope, deliverables, payment, IP ownership, confidentiality, termination, indemnities, and dispute resolution.`,
  },
  {
    id: 'privacy',
    title: 'Privacy, Data Protection & Security',
    tags: ['privacy', 'gdpr', 'ccpa', 'disha', 'data'],
    content: `Privacy essentials:\n
• Map data flows and categories of personal data you process.\n• Have a Privacy Policy and cookie policy visible to users.\n• Implement DPIAs for risky processing activities.\n• Offer data subject rights (access, deletion, portability).\n• Security: encryption, access controls, logging and breach response plan.\n• Consider cross-border transfer mechanisms (SCCs, adequacy decisions).\n
Note: GDPR and other regimes impose heavy fines for non-compliance.`,
  },
  {
    id: 'tax',
    title: 'Taxation & Accounting for Startups',
    tags: ['tax', 'gst', 'income tax', 'accounting'],
    content: `Tax & accounting pointers:\n
• Register for relevant taxes (GST in India, VAT elsewhere).\n• Keep books in line with accounting standards and statutory requirements.\n• Understand tax treatment of equity (ESOPs), investments and exits.\n• Deductible business expenses and proper invoicing.\n• Plan for payroll taxes and statutory contributions.\n• Engage a qualified CA/CPA for filings and optimization.`,
  },
  {
    id: 'funding',
    title: 'Fundraising: Term Sheets, SAFEs, Convertible Notes & Equity',
    tags: ['funding', 'term sheet', 'safe', 'convertible'],
    content: `Investor documents primer:\n
• Term Sheet key terms: valuation, liquidation preference, investor rights, board composition, anti-dilution.\n• SAFEs vs Convertible Notes: SAFEs are equity-linked instruments without a maturity date; notes are debt that convert.\n• Due Diligence checklist: cap table, IP assignments, contracts, financials, compliance.\n• Post-investment: investor rights, information rights, pro-rata, board seats.\n
Always have counsel review term sheets before signing.`,
  },
  {
    id: 'employment',
    title: 'Employment Law & HR Policies',
    tags: ['employment', 'hr', 'labour'],
    content: `Employment & HR best practices:\n
• Offer letters with clear roles, compensation, benefits and probation.\n• Employment agreements with IP assignment and confidentiality clauses.\n• ESOP documents and vesting schedules (typical: 4 years + 1 year cliff).\n• Policies: leave, anti-harassment, code of conduct, remote work.\n• Statutory compliance: PF/ESI (India), payroll taxes, minimum wages.\n• Performance management and lawful termination procedures.`,
  },
  {
    id: 'compliance',
    title: 'Regulatory Compliance & Licenses',
    tags: ['compliance', 'licenses', 'regulatory'],
    content: `Common compliance areas:\n
• Industry-specific licenses (healthcare, finance, food).\n• Environmental & safety regulations.\n• Record-keeping and audit readiness.\n• Anti-money laundering (AML) and KYC where applicable.\n• Export-control and customs.\n
Keep a compliance calendar and conduct periodic internal audits.`,
  },
  {
    id: 'securities',
    title: 'Securities Law & Offerings',
    tags: ['securities', 'regulation', 'investor'],
    content: `Securities basics for startups:\n
• Private placements often rely on exemptions — understand local securities laws.\n• Accredited/investor qualification rules.\n• Disclosure obligations and anti-fraud rules.\n• Crowdfunding and public offers have special regimes.\n
Non-compliance can trigger rescission rights and penalties.`,
  },
  {
    id: 'dd',
    title: 'Due Diligence for Investors & Acquirers',
    tags: ['due diligence', 'dd', 'investor'],
    content: `Due diligence checklist highlights:\n
• Corporate: formation docs, cap table, minutes, contracts.\n• IP: assignments, registrations, freedom-to-operate.\n• Financial: audited or management accounts, tax returns.\n• Legal: litigation, regulatory notices, material contracts.\n• HR: employee contracts, benefits, disputes.\n
Prepare an online data room with well-organized folders.`,
  },
  {
    id: 'litigation',
    title: 'Litigation, Arbitration & Dispute Resolution',
    tags: ['litigation', 'arbitration', 'dispute'],
    content: `Resolving disputes:\n
• Prefer arbitration / mediation in commercial contracts for speed and confidentiality.\n• Court litigation timelines and costs vary widely by jurisdiction.\n• Injunctions and emergency relief are available in urgent cases.\n• Consider insurance (D&O, professional indemnity).`,
  },
  {
    id: 'export-import',
    title: 'International Trade, Import/Export & Customs',
    tags: ['trade', 'import', 'export', 'customs'],
    content: `Cross-border trade basics:\n
• Licensing for regulated goods and restricted technologies.\n• Customs valuations, tariffs, HS codes and duties.\n• Sanctions & embargo compliance.\n• Transfer pricing and withholding taxes on cross-border payments.`,
  },
  {
    id: 'esop',
    title: 'Employee Stock Option Plans (ESOPs)',
    tags: ['esop', 'equity', 'options'],
    content: `Designing ESOPs:\n
• Types: options, restricted shares, phantom equity.\n• Typical vesting: 4 years with 1-year cliff.\n• Tax implications for grant/vesting/exercise differ by jurisdiction.\n• Documentation: plan rules, grant letters, share purchase agreement.`,
  },
  {
    id: 'ndas',
    title: 'Non-Disclosure & Confidentiality',
    tags: ['nda', 'confidentiality', 'secret'],
    content: `NDAs succinct guide:\n
• Use mutual NDAs for partnerships, unilateral for MFAs where only one side shares.\n• Define confidential information, exclusions, duration and permitted disclosures.\n• Carve-outs for independently developed or publicly known info.`,
  },
  {
    id: 'esg',
    title: 'ESG & Sustainability Reporting',
    tags: ['esg', 'sustainability', 'csr'],
    content: `ESG basics for startups and corporates:\n
• Identify material environmental and social KPIs.\n• Track emissions, waste, diversity and governance measures.\n• Prepare disclosures aligned to frameworks (e.g., GRI, SASB).\n• Consider sustainability clauses in supply chain contracts.`,
  },
  {
    id: 'crypto',
    title: 'Crypto, Web3 & Token Offerings',
    tags: ['crypto', 'token', 'web3', 'defi'],
    content: `Regulatory considerations for crypto projects:\n
• Token classification: utility vs security — major legal consequence if treated as security.\n• KYC/AML and sanctions screening for exchanges and token sales.\n• Smart contract audits and disclaimers.\n• Regulatory regimes are fast-moving — consult counsel in target markets.`,
  },
  {
    id: 'privacy-by-design',
    title: 'Privacy by Design & Secure Development Lifecycle',
    tags: ['security', 'sdlc', 'privacy-by-design'],
    content: `Embed privacy in product development:\n
• Minimise data collection and adopt pseudonymisation.\n• Threat modeling and periodic security testing.\n• Logging, retention policies and incident response playbook.\n• Contracts with processors (DPA) and subprocessors.`,
  },
  {
    id: 'migration',
    title: 'Mergers, Acquisitions & Exit Planning',
    tags: ['m&a', 'exit', 'acquisition'],
    content: `Exit planning checklist:\n
• Prepare clean cap table and tidy corporate housekeeping.\n• Clean IP with solid assignments.\n• Financial statements and tax position review.\n• Consider earn-outs, escrow and indemnity caps in purchase agreements.`,
  }
];

// --- Helpers ---
function now() {
  return new Date().toISOString();
}

function addToHistory(userId, role, content) {
  if (!chatHistory[userId]) chatHistory[userId] = [];
  chatHistory[userId].push({ role, content, timestamp: new Date() });
}

function simpleSearch(query, limit = 3) {
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);

  // Score entries by occurrences of tokens in title, tags, or content
  const scored = knowledgeBase.map(entry => {
    let score = 0;
    const hay = (entry.title + ' ' + entry.tags.join(' ') + ' ' + entry.content).toLowerCase();
    for (const t of tokens) {
      if (hay.includes(t)) score += 10; // strong match
      // fuzzy-ish: partial prefix match
      if (t.length > 3 && hay.includes(t.slice(0, 4))) score += 2;
    }
    return { entry, score };
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  if (scored.length === 0) return [];
  return scored.slice(0, limit).map(s => s.entry);
}

function matchTopicByKeyword(query) {
  // direct keyword match (if user mentions a direct id or tag)
  const lower = query.toLowerCase();
  for (const entry of knowledgeBase) {
    if (lower.includes(entry.id)) return entry;
    if (entry.tags.some(tag => lower.includes(tag))) return entry;
  }
  return null;
}

// Simple rate limiter: max 20 requests per minute per user (in-memory)
function checkRateLimit(userId) {
  const windowMs = 60 * 1000;
  const maxHits = 20;
  const nowTs = Date.now();
  if (!rateLimits[userId]) rateLimits[userId] = [];
  rateLimits[userId] = rateLimits[userId].filter(ts => nowTs - ts < windowMs);
  if (rateLimits[userId].length >= maxHits) return false;
  rateLimits[userId].push(nowTs);
  return true;
}

// --- API Endpoints ---

// POST /chat - user sends a message, bot replies with best match or fallback
router.post('/chat', (req, res) => {
  try {
    const { message, userId, limit } = req.body;
    if (!message || !userId) return res.status(400).json({ error: 'message and userId are required' });

    if (!checkRateLimit(userId)) return res.status(429).json({ error: 'Rate limit exceeded' });

    addToHistory(userId, 'user', message);

    // Try direct match
    let responseEntry = matchTopicByKeyword(message);

    // If no direct match, use search
    if (!responseEntry) {
      const results = simpleSearch(message, limit || 3);
      if (results.length === 1) responseEntry = results[0];
      else if (results.length > 1) {
        // when multiple relevant topics, return a short menu
        const menu = results.map(r => `• ${r.title} (id: ${r.id})`).join('\n');
        const menuResp = `I found several relevant topics:\n${menu}\n\nReply with the topic id (e.g. 'incorporation') or ask for more details on one.`;
        addToHistory(userId, 'bot', menuResp);
        return res.json({ success: true, botResponse: menuResp, suggestions: results.map(r => ({ id: r.id, title: r.title })) });
      }
    }

    let botResponse;
    if (responseEntry) {
      botResponse = `**${responseEntry.title}**:\n\n${responseEntry.content}`;
    } else {
      // Fallback generic helpful message
      botResponse = `I couldn't find an exact match, but I can help with many legal topics. Try one of these keywords:\n` +
        knowledgeBase.slice(0, 12).map(e => `• ${e.title} (id: ${e.id})`).join('\n') +
        `\n\nOr ask: 'list topics' to see all available topics.`;
    }

    addToHistory(userId, 'bot', botResponse);

    return res.json({ success: true, botResponse, timestamp: now() });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /topics - list all topics (supports ?search= query param)
router.get('/topics', (req, res) => {
  try {
    const q = (req.query.search || '').toString().trim().toLowerCase();
    if (!q) {
      return res.json({ success: true, topics: knowledgeBase.map(e => ({ id: e.id, title: e.title, tags: e.tags })) });
    }
    const filtered = knowledgeBase.filter(e => (e.title + ' ' + e.tags.join(' ') + ' ' + e.content).toLowerCase().includes(q));
    return res.json({ success: true, topics: filtered.map(e => ({ id: e.id, title: e.title, tags: e.tags })) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /topic/:id - get full topic by id
router.get('/topic/:id', (req, res) => {
  try {
    const id = req.params.id.toString();
    const entry = knowledgeBase.find(e => e.id === id);
    if (!entry) return res.status(404).json({ error: 'Topic not found' });
    return res.json({ success: true, topic: entry });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /admin/upload - add new knowledge entries in bulk
// body: { apiKey, entries: [{id, title, tags, content}] }
router.post('/admin/upload', (req, res) => {
  try {
    const { apiKey, entries } = req.body;
    // Simple auth - replace with proper auth in prod
    if (apiKey !== process.env.LEGAL_CHATBOT_ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' });
    if (!Array.isArray(entries) || entries.length === 0) return res.status(400).json({ error: 'entries array required' });

    const added = [];
    const skipped = [];
    for (const e of entries) {
      if (!e.id || !e.title || !e.content) { skipped.push({ e, reason: 'missing fields' }); continue; }
      if (knowledgeBase.find(k => k.id === e.id)) { skipped.push({ id: e.id, reason: 'duplicate' }); continue; }
      knowledgeBase.push({ id: e.id, title: e.title, tags: e.tags || [], content: e.content });
      added.push(e.id);
    }

    return res.json({ success: true, added, skipped });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /chat-history/:userId
router.get('/chat-history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const history = chatHistory[userId] || [];
    return res.json({ success: true, history });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /chat-history/:userId
router.delete('/chat-history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    delete chatHistory[userId];
    return res.json({ success: true, message: 'Chat history cleared' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Utility: endpoint to export knowledge base (admin only)
router.get('/admin/export', (req, res) => {
  try {
    const apiKey = req.query.apiKey;
    if (apiKey !== process.env.LEGAL_CHATBOT_ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' });
    return res.json({ success: true, knowledgeBase });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
