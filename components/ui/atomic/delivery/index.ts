/**
 * @fileoverview HT-022.4.2: Simple Delivery Pipeline Components Export
 * @module components/ui/atomic/delivery
 * @author Agency Component System
 * @version 1.0.0
 *
 * SIMPLE DELIVERY PIPELINE: Central export for delivery optimization components
 * Optimizes delivery pipeline for micro-app deployment and client handover
 */

// Main delivery components
export { DeliveryDashboard } from './delivery-dashboard';
export { ClientHandoverAutomation } from './client-handover-automation';

// Re-export types for convenience
export type {
  DeliveryConfig,
  DeliveryPipelineResult,
  QualityGate,
  QualityGateResult,
  DeliveryArtifact
} from '@/lib/delivery/simple-delivery-pipeline';