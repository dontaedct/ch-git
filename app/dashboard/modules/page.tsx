/**
 * @fileoverview Module Management Dashboard - Step 4 of Client App Creation Guide
 * Hot-pluggable module system for micro-app customization
 * PRD-compliant: Component taxonomy, module contracts, essential components
 */
import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Modules2, Zap, Package, Settings } from 'lucide-react';
import { MicroAppModulesManager } from '@/components/microapp-modules-manager';

export default async function ModulesPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => window.location.href = '/agency-toolkit'}>
            <ArrowLeft className="w-4 h-4" />
            Back to Agency Toolkit
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Modules2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Module Management</h1>
              <p className="text-muted-foreground">
                Configure hot-pluggable modules for your micro-app
              </p>
            </div>
          </div>

          {/* PRD Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">Hot-Pluggable</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Modules activate without downtime and support rollback
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Tier-Based</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Core, Professional, and Business component tiers
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-green-600" />
                <span className="font-medium">Configurable</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Per-tenant settings and feature flags
              </p>
            </div>
          </div>
        </div>

        <MicroAppModulesManager clientId={client?.id} />
      </div>
    </div>
  );
}