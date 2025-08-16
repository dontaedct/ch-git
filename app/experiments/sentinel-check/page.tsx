import { FeatureGate } from '@ui/FeatureGate';

export default function SentinelCheckPage() {
  return (
    <FeatureGate flag="sentinel-demo">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Sentinel Check Demo</h1>
        <p className="text-gray-600 mb-4">
          This route is gated behind the <code className="bg-gray-100 px-2 py-1 rounded">sentinel-demo</code> feature flag.
        </p>
        
        <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">Feature Flag Status</h2>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• <strong>Flag:</strong> sentinel-demo</p>
                         <p>• <strong>Environment:</strong> {process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development'}</p>
            <p>• <strong>Status:</strong> {process.env.NODE_ENV === 'production' ? 'Disabled (production safety)' : 'Enabled (preview/development)'}</p>
          </div>
        </div>

        <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-lg font-semibold text-green-800 mb-3">Preview Deployment Test</h2>
          <p className="text-green-700">
            This route should be accessible in preview deployments when the flag is enabled,
            but blocked in production when the flag is disabled.
          </p>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h2 className="text-lg font-semibold text-yellow-800 mb-3">Synthetic Check Target</h2>
          <p className="text-yellow-700">
            This page is the target for Vercel preview synthetic checks to verify
            that feature flag gating works correctly across environments.
          </p>
        </div>
      </div>
    </FeatureGate>
  );
}
