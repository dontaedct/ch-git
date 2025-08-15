// Pure data layer for client portal - no Supabase imports
// This can be safely imported by server components

import { isSafeModeEnabled } from '@/lib/env';

export interface ClientPortalData {
  client: any;
  weeklyPlan: any;
  checkIns: any[];
  progressMetrics: any[];
}

export async function getClientPortalDataStub(clientId: string): Promise<ClientPortalData> {
  if (isSafeModeEnabled()) {
    return {
      client: {
        id: clientId,
        first_name: 'Stub',
        last_name: 'Client',
        email: 'stub@client.dev',
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      weeklyPlan: {
        id: 'stub-plan',
        client_id: clientId,
        week_start_date: new Date().toISOString().slice(0, 10),
        status: 'active',
        goals: ['Stay active', 'Hydrate'],
        notes: 'Stub weekly plan',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      checkIns: [0,1,2,3,4].map(n => ({
        id: `stub-checkin-${n}`,
        client_id: clientId,
        check_in_date: new Date(Date.now() - n*86400000).toISOString().slice(0,10),
        mood_rating: 3,
        energy_level: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
      progressMetrics: [0,1,2,3,4].map(n => ({
        id: `stub-metric-${n}`,
        client_id: clientId,
        metric_date: new Date(Date.now() - n*86400000).toISOString().slice(0,10),
        weight: 70 + n,
        body_fat: 15 + n*0.5,
        muscle_mass: 50 + n*0.3,
        notes: 'Stub metric',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    };
  }
  
  // In production, this would be replaced with real data fetching
  // For now, return stub data to prevent build errors
  return {
    client: null,
    weeklyPlan: null,
    checkIns: [],
    progressMetrics: [],
  };
}

