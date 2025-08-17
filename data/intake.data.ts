// Pure data layer for intake - no Supabase imports
export async function createClientIntakeStub(): Promise<any> {
  return {
    id: 'stub-intake',
    status: 'created',
    created_at: new Date().toISOString(),
  };
}

