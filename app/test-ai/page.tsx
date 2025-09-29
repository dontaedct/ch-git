'use client';

import { useState } from 'react';

export default function TestAIPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testIncidentTriage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-mock-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskName: 'incident_triage',
          input: {
            incident_description: "Database timeout causing 500 errors for 30% of users",
            reporter_name: "John Smith",
            reporter_email: "john@test.com",
            incident_type: "performance",
            severity_indicators: ["high_user_impact", "revenue_affecting"],
            affected_systems: ["user_api", "payment_processor"],
            business_impact: "Customer checkout failures, estimated $50K revenue impact",
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults({ task: 'incident_triage', data: data.data, provider: data.provider });
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const testSpecWriter = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-mock-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskName: 'spec_writer',
          input: {
            project_name: "User Authentication Service",
            requirements: "Implement OAuth2.0 with JWT tokens, support Google and Microsoft SSO, rate limiting, audit logging",
            target_audience: "Internal developers and security team",
            technical_constraints: ["Must integrate with existing LDAP", "Comply with SOC2 requirements"],
            existing_systems: ["Active Directory", "PostgreSQL", "Redis"],
            timeline: "8 weeks",
            stakeholders: ["Engineering", "Security", "Product"]
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults({ task: 'spec_writer', data: data.data, provider: data.provider });
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🤖 Mock AI System Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Available AI Tasks</h2>
          <div className="space-y-4">
            <button
              onClick={testIncidentTriage}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Incident Triage'}
            </button>
            
            <button
              onClick={testSpecWriter}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
            >
              {loading ? 'Testing...' : 'Test Spec Writer'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold">Error:</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">
              🎉 Mock AI Response ({results.provider} provider)
            </h3>
            <div className="bg-gray-50 rounded p-4">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(results.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-blue-800 font-semibold">ℹ️ About Mock AI</h3>
          <ul className="text-blue-600 text-sm mt-2 space-y-1">
            <li>• Mock AI returns deterministic responses for development</li>
            <li>• No API costs - completely free</li>
            <li>• Perfect for testing and client demos</li>
            <li>• Same API structure as real AI</li>
            <li>• Easy to upgrade to real AI later</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
