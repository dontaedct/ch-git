import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';

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
                
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                    <div className="w-4 h-4 bg-purple-600 rounded"></div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Modules Editor</h4>
                  <p className="text-sm text-gray-600">Configure consultation modules</p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                    <div className="w-4 h-4 bg-orange-600 rounded"></div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Account settings</h4>
                  <p className="text-sm text-gray-600">Manage your account preferences</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent activity</h3>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  </div>
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              </div>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}