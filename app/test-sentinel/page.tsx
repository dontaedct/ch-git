import { FeatureGate } from '@ui/FeatureGate';

export default function TestSentinelPage() {
  return (
    <FeatureGate flag="test-sentinel">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Sentinel Gate - MODIFIED</h1>
        <p className="text-gray-600">
          This is a modified test page to demonstrate Sentinel Gate CLI functionality.
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h2 className="font-semibold text-blue-800">Sentinel Gate Features:</h2>
          <ul className="mt-2 text-blue-700">
            <li>• Automatic feature flag wrapping</li>
            <li>• Risk assessment and analysis</li>
            <li>• Safe auto-fixes</li>
            <li>• Clear decision output</li>
            <li>• Route modification detection</li>
          </ul>
        </div>
      </div>
    </FeatureGate>
  );
}