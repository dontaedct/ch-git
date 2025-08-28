import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { getDashboardStats, getActiveOverrides, hasActiveOverrides } from '@/lib/config/service';
import { Settings, FileText, Package, BarChart3, AlertCircle, CheckCircle, ArrowUpRight, Activity, Calendar, Database, Webhook, ExternalLink } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Welcome{client?.email ? ` back` : ' to your dashboard'}
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Manage your consultations and account settings from here.
          </p>
          {isSafeMode && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 mt-3">
              <AlertCircle className="w-3 h-3 mr-1" />
              Safe Mode Active
            </Badge>
          )}
        </div>

        {/* Key Metrics */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
            <Badge variant="outline" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/80 hover:bg-white/80 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Consultations Today</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-gray-900 mb-1">{dashboardStats.consultationsToday}</div>
                <p className="text-sm text-gray-600">requests processed</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/80 hover:bg-white/80 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Configuration Status</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Settings className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-gray-900 mb-1">{hasOverrides ? activeOverrides.length : '0'}</div>
                <p className="text-sm text-gray-600">active overrides</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/80 hover:bg-white/80 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Active Modules</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-gray-900 mb-1">5</div>
                <p className="text-sm text-gray-600">modules running</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/80 hover:bg-white/80 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Plan Catalog</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg font-semibold text-gray-900 mb-1">{dashboardStats.catalogInUse}</div>
                <p className="text-sm text-gray-600">catalog active</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    Ready
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link 
                    href="/questionnaire"
                    className="group p-5 border border-gray-200/80 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">New consultation</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Start a new consultation request</p>
                  </Link>
                  
                  <div className="group p-5 border border-gray-200/80 rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">View consultations</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">See your consultation history</p>
                  </div>
                  
                  <Link 
                    href="/dashboard/modules"
                    className="group p-5 border border-gray-200/80 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Modules Editor</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Configure consultation modules</p>
                  </Link>
                  
                  <Link 
                    href="/dashboard/catalog"
                    className="group p-5 border border-gray-200/80 rounded-xl hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <Settings className="w-5 h-5 text-orange-600" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Catalog Overrides</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Customize plan titles and content</p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Configuration Status */}
            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Configuration</CardTitle>
                  {hasOverrides && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {activeOverrides.length} active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {hasOverrides ? (
                  <div className="space-y-4">
                    {activeOverrides.map((override) => (
                      <div key={override.id} className="p-4 bg-amber-50/80 rounded-xl border border-amber-200/80">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">{override.label}</h4>
                            <p className="text-xs text-gray-600 leading-relaxed mb-2">{override.description}</p>
                            <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{override.path}</code>
                          </div>
                          <Badge variant="outline" className="ml-3">
                            Active
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t border-gray-200/80">
                      <ConfigRevertButton className="w-full" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Using base configuration</p>
                    <p className="text-xs text-gray-600">No active overrides</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">API Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-semibold">Operational</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Database className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Database</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-semibold">Connected</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Settings className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Auth Service</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-semibold">Active</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Webhook className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Webhooks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        process.env.N8N_WEBHOOK_URL ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className={`text-sm font-semibold ${
                        process.env.N8N_WEBHOOK_URL ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {process.env.N8N_WEBHOOK_URL ? 'Configured' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Link */}
            {dashboardStats.activeBookingLink && (
              <Card className="bg-white/60 backdrop-blur-sm border-gray-200/80">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">Booking Link</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-600">Active</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-green-50/80 rounded-xl border border-green-200/80">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">Public booking URL</p>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                    <code className="text-xs text-green-700 break-all leading-relaxed block">
                      {dashboardStats.activeBookingLink}
                    </code>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings Quick Link */}
            <Link href="/dashboard/settings">
              <Card className="bg-white/60 backdrop-blur-sm border-gray-200/80 hover:bg-white/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                        <Settings className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Settings</h3>
                        <p className="text-sm text-gray-600">Configure booking and email</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}