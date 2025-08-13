import { User } from '@supabase/supabase-js';

export function hasRole(user: User, role: 'admin' | 'staff'): boolean {
  const roles = user.app_metadata.roles ?? [];
  return roles.includes(role);
}
