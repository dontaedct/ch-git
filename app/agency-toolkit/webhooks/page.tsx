/**
 * Webhook Management Page
 * 
 * Main page for webhook management, testing, and analytics.
 * Integrates the webhook dashboard component.
 */

import { Metadata } from 'next';
import { WebhookDashboard } from '@/components/webhooks/webhook-dashboard';

export const metadata: Metadata = {
  title: 'Webhook Management | Agency Toolkit',
  description: 'Manage, test, and monitor your webhook integrations with comprehensive analytics and testing tools.',
};

export default function WebhookManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <WebhookDashboard />
    </div>
  );
}
