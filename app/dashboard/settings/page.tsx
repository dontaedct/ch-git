import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SettingsForm } from '@/components/settings-form';

export default async function SettingsPage() {
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
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Booking & Email Settings
          </h2>
          <p className="text-gray-600">
            Configure your consultation booking URL and email templates.
          </p>
        </div>

        <SettingsForm />
      </div>
    </div>
  );
}