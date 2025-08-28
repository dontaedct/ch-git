import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { getDashboardStats, getActiveOverrides, hasActiveOverrides } from '@/lib/config/service';
import { Settings, FileText, Package, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfigRevertButton } from '@/components/config-revert-button';

export default async function DashboardPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';
  
  let client = null;
  
  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const dashboardStats = getDashboardStats();
  const activeOverrides = getActiveOverrides();
  const hasOverrides = hasActiveOverrides();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              {isSafeMode && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  SAFE MODE
                </span>
              )}
              <span className="text-sm text-gray-600">
                {client?.email ?? 'demo@example.com'}
              </span>
              {client?.role && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {client.role.toUpperCase()}
                </span>
              )}
              <Link 
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome{client?.email ? ` back` : ' to your dashboard'}
          </h2>
          <p className="text-gray-600">
            Manage your consultations and account settings from here.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overview</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.consultationsToday}</div>
              <p className="text-xs text-muted-foreground">consultations today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hasOverrides ? activeOverrides.length : '0'}</div>
              <p className="text-xs text-muted-foreground">active overrides</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Features/Modules</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">modules active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catalog</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{dashboardStats.catalogInUse}</div>
              <p className="text-xs text-muted-foreground">in use</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/questionnaire"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">New consultation</h4>
                  <p className="text-sm text-gray-600">Start a new consultation request</p>
                </Link>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">View consultations</h4>
                  <p className="text-sm text-gray-600">See your consultation history</p>
                </div>
                
                <Link 
                  href="/dashboard/modules"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                    <div className="w-4 h-4 bg-purple-600 rounded"></div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Modules Editor</h4>
                  <p className="text-sm text-gray-600">Configure consultation modules</p>
                </Link>
                
                <Link 
                  href="/dashboard/catalog"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                    <div className="w-4 h-4 bg-orange-600 rounded"></div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Catalog Overrides</h4>
                  <p className="text-sm text-gray-600">Customize plan titles and content</p>
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Configuration Status */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
                {hasOverrides && (
                  <Badge variant="secondary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {activeOverrides.length} overrides
                  </Badge>
                )}
              </div>
              
              {hasOverrides ? (
                <div className="space-y-3">
                  {activeOverrides.map((override) => (
                    <div key={override.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{override.label}</h4>
                        <p className="text-xs text-gray-600">{override.description}</p>
                        <code className="text-xs text-gray-500 mt-1 block">{override.path}</code>
                      </div>
                      <Badge variant="outline">
                        Active
                      </Badge>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-gray-200">
                    <ConfigRevertButton className="w-full" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Using base configuration</p>
                  <p className="text-xs text-gray-500">No active overrides</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auth Service</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Webhooks</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      process.env.N8N_WEBHOOK_URL ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      process.env.N8N_WEBHOOK_URL ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {process.env.N8N_WEBHOOK_URL ? 'Configured' : 'Not configured'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {dashboardStats.activeBookingLink && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Link</h3>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-2">Active booking URL:</p>
                  <code className="text-xs text-green-700 break-all">
                    {dashboardStats.activeBookingLink}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}