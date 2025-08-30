/**
 * 🧠 AI SYSTEM - AI Feature Flags
 * 
 * Centralized AI feature flag management
 * Deny-by-default until explicitly enabled
 */

export const isAIEnabled = (): boolean => {
  // Check both server and client flags
  if (typeof window !== 'undefined') {
    // Client-side: check NEXT_PUBLIC_AI_ENABLED
    return process.env.NEXT_PUBLIC_AI_ENABLED === 'true';
  } else {
    // Server-side: check AI_ENABLED
    return process.env.AI_ENABLED === 'true';
  }
};

export const getAIFeatureStatus = (): { enabled: boolean; reason: string } => {
  const enabled = isAIEnabled();
  if (typeof window !== 'undefined') {
    return {
      enabled,
      reason: enabled ? 'NEXT_PUBLIC_AI_ENABLED=true' : 'NEXT_PUBLIC_AI_ENABLED not set to true (default: disabled)'
    };
  } else {
    return {
      enabled,
      reason: enabled ? 'AI_ENABLED=true' : 'AI_ENABLED not set to true (default: disabled)'
    };
  }
};
