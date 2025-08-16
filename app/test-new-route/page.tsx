import { FeatureGate } from '@ui/FeatureGate';

export default function TestNewRoutePage() {
  return (
    <FeatureGate flag="test-new-route">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test New Route</h1>
        <p className="text-gray-600">
          This is a new route that should trigger Sentinel Gate to suggest feature flag wrapping.
        </p>
        <div className="mt-4 p-4 bg-green-50 rounded">
          <h2 className="font-semibold text-green-800">New Route Features:</h2>
          <ul className="mt-2 text-green-700">
            <li>• This route should be detected by Sentinel Gate</li>
            <li>• Sentinel Gate should suggest wrapping with FeatureGate</li>
            <li>• Auto-fix should apply the feature flag wrapper</li>
          </ul>
        </div>
      </div>
    </FeatureGate>
  );
}
