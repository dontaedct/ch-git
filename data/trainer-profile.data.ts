// Pure data layer for trainer profile - no Supabase imports
export async function getTrainerProfileStub(): Promise<any> {
  return {
    id: 'stub-profile',
    user_id: 'stub-user',
    first_name: 'Stub',
    last_name: 'Trainer',
    email: 'stub@trainer.dev',
    phone: null,
    bio: 'Stub trainer bio',
    specialties: ['Stub specialty'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

