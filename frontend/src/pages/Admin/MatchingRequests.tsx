import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function MatchingRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState({
    status: '',
    feedback: '',
    contactPerson: '',
    contactEmail: ''
  });

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/matching/pending-requests', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      toast.error('Error fetching requests');
    }
  };

  const viewDetails = async (request) => {
    try {
      const res = await fetch(`http://localhost:3000/api/matching/request/${request._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedRequest(data.request);
      }
    } catch (error) {
      toast.error('Error loading details');
    }
  };

  const submitResponse = async () => {
    if (!response.status) {
      toast.error('Please select interested or rejected');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/matching/request/${selectedRequest._id}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(response)
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Response recorded! ✓');
        setSelectedRequest(null);
        setResponse({ status: '', feedback: '', contactPerson: '', contactEmail: '' });
        fetchRequests();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Error submitting response');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (selectedRequest) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => setSelectedRequest(null)}
          className="mb-4"
        >
          ← Back to List
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{selectedRequest.startupName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-gray-700">Domain</p>
              <p className="text-gray-600">{selectedRequest.startupDomain}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-700">Problem Statement</p>
              <p className="text-gray-600">{selectedRequest.problemStatement}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-700">Solution</p>
              <p className="text-gray-600">{selectedRequest.solution}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-700">Founder</p>
              <p className="text-gray-600">{selectedRequest.founderName} ({selectedRequest.founderEmail})</p>
            </div>

            <hr className="my-4" />

            <div>
              <label className="block font-semibold mb-2">Your Response</label>
              <div className="space-y-2 mb-4">
                {/* Interested Button */}
                <button
                  onClick={() => setResponse({ ...response, status: 'interested' })}
                  className={`w-full p-3 border-2 rounded-lg text-left transition ${
                    response.status === 'interested' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className={response.status === 'interested' ? 'text-green-600' : 'text-gray-400'} />
                    <span className="font-semibold">Interested</span>
                  </div>
                </button>

                {/* Not Interested Button */}
                <button
                  onClick={() => setResponse({ ...response, status: 'rejected' })}
                  className={`w-full p-3 border-2 rounded-lg text-left transition ${
                    response.status === 'rejected' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <XCircle className={response.status === 'rejected' ? 'text-red-600' : 'text-gray-400'} />
                    <span className="font-semibold">Not Interested</span>
                  </div>
                </button>
              </div>

              {/* Contact Fields (Show only if interested) */}
              {response.status === 'interested' && (
                <>
                  <Input
                    placeholder="Contact Person Name"
                    value={response.contactPerson}
                    onChange={(e) => setResponse({ ...response, contactPerson: e.target.value })}
                    className="mb-2"
                  />
                  <Input
                    type="email"
                    placeholder="Contact Email"
                    value={response.contactEmail}
                    onChange={(e) => setResponse({ ...response, contactEmail: e.target.value })}
                    className="mb-2"
                  />
                </>
              )}

              {/* Feedback Textarea */}
              <textarea
                placeholder="Feedback (optional)"
                value={response.feedback}
                onChange={(e) => setResponse({ ...response, feedback: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 mb-4"
              />

              {/* Submit Button */}
              <Button 
                onClick={submitResponse}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Submitting...' : 'Submit Response'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main List View
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 Pending Startup Requests</h1>
        <p className="text-gray-600">Review and respond to startup requests in your specialization</p>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-600">
              No pending requests at this time
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request._id} className="hover:shadow-lg transition">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{request.startupName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{request.startupDomain}</p>
                    <p className="text-gray-700 line-clamp-2">{request.problemStatement}</p>
                    <p className="text-sm text-gray-500 mt-2">By {request.founderName}</p>
                  </div>
                  <Button
                    onClick={() => viewDetails(request)}
                    className="ml-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye size={16} className="mr-2" /> Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}