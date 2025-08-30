import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import { SettingsForm } from '@/components/settings-form';

export default async function SettingsPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';
  
  if (!isSafeMode) {
    try {
      await requireClient();
    } catch {
      redirect('/login');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Booking & Email Settings
          </h1>
          <p className="text-gray-600">
            Configure your consultation booking URL and email templates.
          </p>
        </div>

        <SettingsForm />
      </div>
    </div>
  );
}