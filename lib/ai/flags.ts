/**
 * 🧠 MIT HERO SYSTEM - AI Feature Flags
 * 
 * Centralized AI feature flag management
 * Deny-by-default until explicitly enabled
 */

export const isAIEnabled = (): boolean => process.env.AI_ENABLED === 'true';

export const getAIFeatureStatus = (): { enabled: boolean; reason: string } => {
  const enabled = isAIEnabled();
  return {
    enabled,
    reason: enabled ? 'AI_ENABLED=true' : 'AI_ENABLED not set to true (default: disabled)'
  };
};
