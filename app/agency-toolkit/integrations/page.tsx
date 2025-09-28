/**
 * Integration Management Page
 * 
 * Main page for managing third-party integrations and browsing
 * the integration marketplace.
 */

import { Metadata } from 'next';
import { IntegrationDashboard } from '@/components/integrations/integration-dashboard';

export const metadata: Metadata = {
  title: 'Integration Management | Agency Toolkit',
  description: 'Connect and manage third-party services, APIs, and integrations with comprehensive marketplace and analytics.',
};

export default function IntegrationManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <IntegrationDashboard />
    </div>
  );
}
