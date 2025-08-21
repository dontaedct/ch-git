import { createServerSupabase } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createServerSupabase();
  
  // Dev-only tracing
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
    console.log('🔐 Auth Guard: Checking user authentication...');
  }
  
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
      console.warn('❌ Auth Guard: Authentication failed', { error: error?.message });
    }
    throw new Error("Unauthorized");
  }
  
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
    console.log('✅ Auth Guard: User authenticated', { userId: data.user.id });
  }
  
  return { user: data.user, supabase };
}

export async function getUserOrFail(supabase: any) {
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    throw new Error("Unauthorized");
  }
  
  return data.user;
}
