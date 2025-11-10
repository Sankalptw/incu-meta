import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Scale, Loader } from 'lucide-react';

export default function LegalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "🏛️ Hello! I'm your Legal Advisor. I help startups with legal guidance on incorporation, IP, contracts, compliance, and funding. What's your concern today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const commonTopics = [
    { label: '📋 Business Incorporation', value: 'incorporation' },
    { label: '🔐 Intellectual Property', value: 'ip' },
    { label: '📝 Contracts & Agreements', value: 'contracts' },
    { label: '⚖️ Compliance & Regulations', value: 'compliance' },
    { label: '👥 Employment Law', value: 'employment' },
    { label: '💰 Funding & Investor Docs', value: 'funding' },
  ];

  const legalKnowledge = {
    incorporation: "For business incorporation:\n1️⃣ Choose entity type (LLC, C-Corp, S-Corp, Solo proprietorship)\n2️⃣ File articles of incorporation with your state\n3️⃣ Get an EIN from the IRS\n4️⃣ Draft bylaws and operating agreements\n5️⃣ Register with your state revenue department\n\n⚠️ Recommendation: Consult a lawyer for jurisdiction-specific requirements.",
    
    ip: "Protect your intellectual property:\n1️⃣ Trademarks - for brand names & logos (₹4,500-15,000)\n2️⃣ Patents - for inventions (₹10,000-50,000+)\n3️⃣ Copyrights - for creative works\n4️⃣ Trade Secrets - for proprietary information\n\n✅ Register with relevant authorities (USPTO in US, IPO in India)\n⏰ Early registration establishes priority dates",
    
    contracts: "Essential startup contracts:\n1️⃣ Terms of Service (TOS)\n2️⃣ Privacy Policy (GDPR/CCPA compliant)\n3️⃣ Non-Disclosure Agreements (NDA)\n4️⃣ Founder's Agreement\n5️⃣ Employment Agreements\n6️⃣ Service Level Agreements (SLA)\n\n⚠️ Always have contracts reviewed by legal counsel before signing.",
    
    compliance: "Maintain regulatory compliance:\n1️⃣ Understand industry-specific regulations\n2️⃣ Maintain proper business records\n3️⃣ Follow data protection laws (GDPR, CCPA, DISHA in India)\n4️⃣ File taxes on time\n5️⃣ Adhere to employment laws\n6️⃣ Get necessary licenses and permits\n\n✅ Document everything and conduct regular audits",
    
    employment: "Employment best practices:\n1️⃣ Clear employment contracts with roles & responsibilities\n2️⃣ Non-compete & NDA clauses\n3️⃣ Equity vesting schedules (4-year typical, 1-year cliff)\n4️⃣ Workers' compensation insurance\n5️⃣ Equal opportunity policies\n6️⃣ Leave & benefits policies\n\n⚠️ Comply with local labor laws (varies by state/country)",
    
    funding: "Fundraising legal requirements:\n1️⃣ Prepare SAFE agreements or convertible notes\n2️⃣ Understand equity dilution impact\n3️⃣ Comply with securities regulations\n4️⃣ Maintain clear capitalization table (cap table)\n5️⃣ Prepare investment agreements\n6️⃣ Due diligence documentation\n\n✅ Have all investor documents reviewed before pitching"
  };

  const getResponse = (query) => {
    const lower = query.toLowerCase();
    
    // Check for direct topic matches
    for (const [key, response] of Object.entries(legalKnowledge)) {
      if (lower.includes(key)) {
        return response;
      }
    }
    
    // Check for common keywords
    if (lower.includes('help') || lower.includes('advice')) {
      return "I can help with:\n📋 Business Incorporation\n🔐 Intellectual Property\n📝 Contracts & Agreements\n⚖️ Compliance & Regulations\n👥 Employment Law\n💰 Funding & Investor Docs\n\nClick any topic above or describe your legal concern!";
    }
    
    if (lower.includes('cost') || lower.includes('price') || lower.includes('fee')) {
      return "Costs vary by jurisdiction and complexity:\n• Incorporation: $100-500 (US), ₹5,000-15,000 (India)\n• Trademark: $300-400 (US), ₹4,500-15,000 (India)\n• Legal consultation: $150-400/hour typically\n\n💡 Many accelerators provide legal support. Check with your incubator!";
    }
    
    if (lower.includes('founder') || lower.includes('co-founder')) {
      return "Founder agreements should cover:\n✅ Equity distribution & vesting\n✅ Roles & responsibilities\n✅ Decision-making authority\n✅ Dispute resolution\n✅ Exit clauses\n✅ IP ownership\n✅ Non-compete clauses\n\n⚠️ Get this in writing BEFORE starting!";
    }
    
    return "I understand you're asking about: \"" + query + "\"\n\nPlease choose a category above or ask about:\n• Incorporation\n• IP/Patents/Trademarks\n• Contracts\n• Compliance\n• Employment\n• Funding\n\nOr describe your specific legal issue in detail!";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const botResponse = getResponse(input);
      const botMsg = {
        id: messages.length + 2,
        type: 'bot',
        text: botResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 800);
  };

  const handleTopicClick = (topic) => {
    setInput(topic);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all z-40"
          title="Open Legal Advisor"
        >
          <Scale size={24} />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Scale size={20} />
              <span className="font-semibold">Legal Advisor</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  } whitespace-pre-wrap text-sm leading-relaxed`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                  <Loader size={16} className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Topics */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">Quick Topics:</p>
              <div className="grid grid-cols-2 gap-2">
                {commonTopics.map(topic => (
                  <button
                    key={topic.value}
                    onClick={() => handleTopicClick(topic.value)}
                    className="text-xs bg-white border border-blue-300 text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask your legal question..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}