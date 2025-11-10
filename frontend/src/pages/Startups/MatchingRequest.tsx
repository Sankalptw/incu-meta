import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MatchingRequest() {
  const [formData, setFormData] = useState({
    startupDomain: '',
    problemStatement: '',
    solution: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [matchRequests, setMatchRequests] = useState<any[]>([]);

  const domains = [
    'Technology', 'Healthcare', 'Finance', 'E-commerce',
    'EdTech', 'ClimaTech', 'AgriTech', 'AI/ML', 'Blockchain'
  ];

  // -----------------------------
  // Helper: Safe JSON parse
  // -----------------------------
  function safeJson(text: string) {
    try { return JSON.parse(text); } catch { return null; }
  }

  // -----------------------------
  // Token refresh helper
  // -----------------------------
  async function tryRefresh(): Promise<boolean> {
    try {
      console.log('[auth] trying refresh...');
      const r = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('[auth] refresh status', r.status);
      if (!r.ok) return false;

      const j = await r.json().catch(() => null);
      console.log('[auth] refresh body', j);

      const newToken = j?.accessToken ?? j?.token ?? j?.authToken ?? null;

      if (newToken) {
        localStorage.setItem('token', newToken);
        console.log('[auth] saved new token to localStorage');
        return true;
      }

      if (j && Object.keys(j).length === 0) {
        console.log('[auth] refresh returned empty JSON; assuming cookie-based auth');
        return true;
      }

      return false;
    } catch (err) {
      console.error('[auth] refresh error', err);
      return false;
    }
  }

  // -----------------------------
  // Handle submit
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!formData.startupDomain || !formData.problemStatement || !formData.solution) {
      toast.error('Please fill all fields.');
      return;
    }

    setLoading(true);

    try {
      // Ensure minimal identity info always exists
      let startupId = localStorage.getItem('startupId');
      if (!startupId) {
        startupId = `dev-${Date.now()}`;
        localStorage.setItem('startupId', startupId);
        console.warn('[handleSubmit] No startupId found — created temporary one:', startupId);
      }

      const bodyPayload = {
        startupId,
        startupName: localStorage.getItem('startupName') || 'Demo Startup',
        startupDomain: formData.startupDomain,
        problemStatement: formData.problemStatement,
        solution: formData.solution,
        founderName: localStorage.getItem('founderName') || 'Demo Founder',
        founderEmail: localStorage.getItem('founderEmail') || 'demo@example.com'
      };

      console.log('[handleSubmit] Final payload =>', bodyPayload);

      // Build fetch options dynamically
      const buildOptions = (token?: string): RequestInit => ({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(bodyPayload),
        credentials: 'include'
      });

      let token = localStorage.getItem('token');
      console.log('[handleSubmit] token present?', !!token, token);

      let response = await fetch('http://localhost:3000/api/matching/request', buildOptions(token ?? undefined));
      console.log('[handleSubmit] initial status', response.status);

      // Handle expired or invalid token
      if (response.status === 401 || response.status === 403) {
        console.warn('[handleSubmit] got', response.status, 'trying refresh...');
        const refreshed = await tryRefresh();
        if (refreshed) {
          const newToken = localStorage.getItem('token');
          console.log('[handleSubmit] retrying with new token?', !!newToken);
          response = await fetch('http://localhost:3000/api/matching/request', buildOptions(newToken ?? undefined));
        }
      }

      const raw = await response.text();
      console.log('[handleSubmit] response status', response.status, 'body raw:', raw);

      const data = safeJson(raw) ?? { success: false, error: raw };

      if (response.ok && data.success) {
        toast.success(`✅ Request sent to ${data.incubatorsCount ?? 'multiple'} incubators!`);
        setSubmitted(true);
        setFormData({ startupDomain: '', problemStatement: '', solution: '' });
        await fetchRequests();
      } else {
        const errMsg = data.error || data.message || `Request failed (${response.status})`;
        toast.error(errMsg);

        if (
          errMsg.toLowerCase().includes('token') ||
          response.status === 401 ||
          response.status === 403
        ) {
          console.warn('[handleSubmit] Clearing local token (auth error)');
          localStorage.removeItem('token');
        }
      }
    } catch (err) {
      console.error('[handleSubmit] unexpected error', err);
      toast.error('⚠️ Network or server issue.');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Fetch existing requests
  // -----------------------------
  const fetchRequests = async () => {
    try {
      let token = localStorage.getItem('token');
      console.log('[fetchRequests] token present?', !!token);

      const buildOptions = (token?: string): RequestInit => ({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      });

      let r = await fetch('http://localhost:3000/api/matching/my-requests', buildOptions(token ?? undefined));
      console.log('[fetchRequests] initial status', r.status);

      if (r.status === 401 || r.status === 403) {
        const ok = await tryRefresh();
        if (ok) {
          const newToken = localStorage.getItem('token');
          r = await fetch('http://localhost:3000/api/matching/my-requests', buildOptions(newToken ?? undefined));
          console.log('[fetchRequests] retry status', r.status);
        }
      }

      const txt = await r.text();
      console.log('[fetchRequests] body raw', txt);
      const data = safeJson(txt) ?? { success: false };

      if (r.ok && data.success) {
        setMatchRequests(data.requests || []);
      } else {
        if (data?.error) console.warn('[fetchRequests] server error:', data.error);
      }
    } catch (e) {
      console.error('[fetchRequests] error', e);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎯 Find Your Perfect Incubator</h1>
        <p className="text-gray-600">We'll match your startup with incubators that specialize in your domain!</p>
      </div>

      {!submitted ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-yellow-500" />
              Create Matching Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Domain/Industry</label>
                <select
                  value={formData.startupDomain}
                  onChange={(e) => setFormData({ ...formData, startupDomain: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select your domain...</option>
                  {domains.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Problem Statement</label>
                <textarea
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                  placeholder="What problem are you solving?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Solution</label>
                <textarea
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="How are you solving it?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Sending...' : 'Send Matching Request'}
                <Send className="ml-2" size={16} />
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-semibold text-green-800">Request Sent Successfully!</p>
                <p className="text-green-700">Incubators are reviewing your profile...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Requests */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Your Requests</h2>
        {matchRequests.map((req, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">{req.domain}</p>
                  <p className="text-gray-600">
                    {req.interestedCount} of {req.totalIncubators} incubators interested
                  </p>
                  <div className="mt-2 flex gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={16} /> {req.interestedCount} Interested
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock size={16} /> {req.totalIncubators - req.interestedCount} Pending
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {(req.matchScore ?? 0).toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-600">Match Score</p>
                  {req.selectedIncubator && (
                    <p className="text-sm text-green-600 font-semibold">
                      ✓ Matched with {req.selectedIncubator.incubatorName}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
