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
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Configure Consultation Modules
          </h1>
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