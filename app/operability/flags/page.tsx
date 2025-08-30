/**
 * Feature Flags Admin UI
 * 
 * Provides admin interface for managing feature flags per tenant
 * Protected by admin authentication
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@lib/supabase/server';
import { isAdmin } from '@lib/flags/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { FlagToggleForm } from './flag-toggle-form';

export default async function FeatureFlagsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const userIsAdmin = await isAdmin(user.id);
  if (!userIsAdmin) {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Feature Flags Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage feature flags for all tenants. Changes take effect immediately.
        </p>
      </div>

      <Suspense fallback={<div>Loading flags...</div>}>
        <FlagManagementInterface />
      </Suspense>
    </div>
  );
}

async function FlagManagementInterface() {
  const supabase = await createServerClient();
  
  // Get all users (tenants) with their flags
  const { data: users, error: usersError } = await supabase
    .from('auth.users')
    .select('id, email, raw_user_meta_data')
    .order('email');

  if (usersError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading users: {usersError.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {users?.map((user) => (
        <TenantFlagCard key={user.id} user={user} />
      ))}
    </div>
  );
}

async function TenantFlagCard({ user }: { user: { id: string; email: string; raw_user_meta_data?: Record<string, unknown> } }) {
  const supabase = await createServerClient();
  
  // Get flags for this tenant
  const { data: flags, error: flagsError } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('tenant_id', user.id)
    .order('key');

  if (flagsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{user.email}</CardTitle>
          <CardDescription>Error loading flags: {flagsError.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const enabledCount = flags?.filter(f => f.enabled).length ?? 0;
  const totalCount = flags?.length ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{user.email}</CardTitle>
            <CardDescription>
              {user.raw_user_meta_data?.role === 'admin' && (
                <Badge variant="secondary" className="mr-2">Admin</Badge>
              )}
              {enabledCount} of {totalCount} flags enabled
            </CardDescription>
          </div>
          <Badge variant={enabledCount > 0 ? "default" : "secondary"}>
            {enabledCount}/{totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flags?.map((flag) => (
            <FlagToggleForm key={flag.id} flag={flag} />
          ))}
          {(!flags || flags.length === 0) && (
            <p className="text-muted-foreground text-sm">No flags configured for this tenant.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
