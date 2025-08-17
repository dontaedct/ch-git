/**
 * FeatureGate Component
 * 
 * Wraps content with feature flag checking to enable/disable features
 * Uses the enhanced flags system with environment-aware logic
 */

import { useFeatureFlag } from '@lib/registry/FlagsProvider';

interface FeatureGateProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ flag, children, fallback }: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag);
  
  if (isEnabled) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
}
