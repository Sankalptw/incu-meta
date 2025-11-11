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
    'EdTech', 'ClimaTech', 'AgriTech', 'AI/ML', 'Blockchain', 'Other'
  ];

  function safeJson(text: string) {
    try { return JSON.parse(text); } catch { return null; }
  }

  async function tryRefresh(): Promise<boolean> {
    try {
      const r = await fetch('http://localhost:3000/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!r.ok) return false;

      const j = await r.json().catch(() => null);
      const newToken = j?.accessToken ?? j?.token ?? j?.authToken ?? null;

      if (newToken) {
        localStorage.setItem('token', newToken);
        return true;
      }

      return j && Object.keys(j).length === 0;
    } catch (err) {
      console.error('[auth] refresh error', err);
      return false;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startupDomain || !formData.problemStatement || !formData.solution) {
      toast.error('Please fill all fields.');
      return;
    }

    setLoading(true);

    try {
      const startupId = localStorage.getItem('startupId');
      if (!startupId) {
        toast.error('Please log in again to continue');
        console.error('[handleSubmit] No startupId found in localStorage');
        setLoading(false);
        return;
      }

      const bodyPayload = {
        startupId,
        startupName: localStorage.getItem('startupName') || 'Demo Startup',
        startupDomain: formData.startupDomain,
        problemStatement: formData.problemStatement,
        solution: formData.solution,
        founderName: localStorage.getItem('founderName') || localStorage.getItem('startupName') || 'Demo Founder',
        founderEmail: localStorage.getItem('founderEmail') || localStorage.getItem('startupEmail') || 'demo@example.com'
      };

      const buildOptions = (token?: string): RequestInit => ({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 
            'Authorization': `Bearer ${token}`,
            'token': token
          } : {})
        },
        body: JSON.stringify(bodyPayload),
        credentials: 'include'
      });

      let token = localStorage.getItem('startupToken');
      let response = await fetch('http://localhost:3000/api/matching/request', buildOptions(token ?? undefined));

      if (response.status === 401 || response.status === 403) {
        const refreshed = await tryRefresh();
        if (refreshed) {
          const newToken = localStorage.getItem('token');
          response = await fetch('http://localhost:3000/api/matching/request', buildOptions(newToken ?? undefined));
        }
      }

      const raw = await response.text();
      const data = safeJson(raw) ?? { success: false, error: raw };

      if (response.ok && data.success) {
        toast.success(`✅ Request sent to ${data.incubatorsCount || 0} incubators!`);
        setSubmitted(true);
        setFormData({ startupDomain: '', problemStatement: '', solution: '' });
        fetchRequests();
      } else {
        toast.error(data.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('[handleSubmit] Error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const buildOptions = (token?: string): RequestInit => ({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 
            'Authorization': `Bearer ${token}`,
            'token': token
          } : {})
        },
        credentials: 'include'
      });

      let token = localStorage.getItem('startupToken');
      let r = await fetch('http://localhost:3000/api/matching/my-requests', buildOptions(token ?? undefined));

      if (r.status === 401 || r.status === 403) {
        const ok = await tryRefresh();
        if (ok) {
          const newToken = localStorage.getItem('token');
          r = await fetch('http://localhost:3000/api/matching/my-requests', buildOptions(newToken ?? undefined));
        }
      }

      const txt = await r.text();
      const data = safeJson(txt) ?? { success: false };

      if (r.ok && data.success) {
        setMatchRequests(data.requests || []);
      }
    } catch (e) {
      console.error('[fetchRequests] error', e);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Solution</label>
                <textarea
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="How are you solving it?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[100px]"
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Request to Incubators
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600 h-12 w-12" />
              <div>
                <h3 className="text-xl font-bold text-green-800">Request Submitted!</h3>
                <p className="text-green-700">Your request has been sent to matching incubators. Check back soon!</p>
              </div>
            </div>
            <Button 
              onClick={() => setSubmitted(false)} 
              variant="outline" 
              className="mt-4"
            >
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      )}

      {matchRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Matching Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matchRequests.map((req) => (
                <div key={req.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{req.domain}</p>
                      <p className="text-sm text-gray-600">Status: {req.status}</p>
                      <p className="text-sm text-gray-600">
                        Interested: {req.interestedCount}/{req.totalIncubators}
                      </p>
                      {req.matchScore > 0 && (
                        <p className="text-sm text-gray-600">
                          Match Score: {req.matchScore}%
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      req.status === 'matched' ? 'bg-green-100 text-green-800' :
                      req.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}