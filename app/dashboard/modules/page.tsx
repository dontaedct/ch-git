import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import { ModulesEditor } from '@/components/modules-editor';

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Modules Editor</h1>
            <div className="flex items-center gap-4">
              {isSafeMode && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  SAFE MODE
                </span>
              )}
              <span className="text-sm text-gray-600">
                {client?.email ?? 'demo@example.com'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Configure Consultation Modules
          </h2>
          <p className="text-gray-600">
            Toggle modules on or off to customize what appears in your consultation plans.
            Changes will be reflected in all new consultations generated.
          </p>
        </div>

        <ModulesEditor clientId={client?.id} />
      </div>
    </div>
  );
}