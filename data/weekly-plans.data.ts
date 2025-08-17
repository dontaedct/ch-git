// Pure data layer for weekly plans - no Supabase imports
// This can be safely imported by server components

import { isSafeModeEnabled } from '@/lib/env';

export interface WeeklyPlanData {
  plans: any[];
  clients: any[];
}

export async function getWeeklyPlansStub(): Promise<WeeklyPlanData> {
  if (isSafeModeEnabled()) {
    return {
      plans: [0,1,2,3,4].map(n => ({
        id: `stub-plan-${n}`,
        client_id: `stub-client-${n}`,
        week_start_date: new Date(Date.now() - n*86400000*7).toISOString().slice(0,10),
        status: 'active',
        goals: ['Goal 1', 'Goal 2'],
        notes: 'Stub plan',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
      clients: [0,1,2,3,4].map(n => ({
        id: `stub-client-${n}`,
        first_name: `Client ${n}`,
        last_name: 'Stub',
        email: `client${n}@stub.dev`,
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    };
  }
  
  // In production, this would be replaced with real data fetching
  return {
    plans: [],
    clients: [],
  };
}
