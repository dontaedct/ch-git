/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * Stub Supabase Index
 * 
 * This file provides stub implementations of all Supabase exports
 * to avoid client-side bundling issues during builds.
 * 
 * Used for the feature flag system which doesn't require actual Supabase functionality.
 */

// Stub types - these are just empty interfaces to satisfy TypeScript
export interface Database {
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
  };
}

export interface Session {
  id: string;
  coach_id: string;
  title: string;
  type: string;
  capacity: number;
  description: string;
  duration_minutes: number;
  max_participants: number;
  created_at: string;
  updated_at: string;
  starts_at: string;
  ends_at: string;
  location: string;
  stripe_link: string;
  notes: string;
}

export interface SessionInsert extends Omit<Session, 'id' | 'created_at' | 'updated_at'> {
  // Stub interface - extends Session without id, created_at, updated_at
}
export interface SessionUpdate extends Partial<Omit<Session, 'id' | 'created_at' | 'updated_at'>> {
  // Stub interface - partial Session without id, created_at, updated_at
}

export interface Client {
  id: string;
  coach_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  emergency_contact: string;
  medical_notes: string;
  fitness_goals: string;
  created_at: string;
  updated_at: string;
}

export interface ClientInsert extends Omit<Client, 'id' | 'created_at' | 'updated_at'> {
  // Stub interface - extends Client without id, created_at, updated_at
}
export interface ClientUpdate extends Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>> {
  // Stub interface - partial Client without id, created_at, updated_at
}

export interface Invite {
  id: string;
  coach_id: string;
  client_email: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InviteInsert extends Omit<Invite, 'id' | 'created_at' | 'updated_at'> {
  // Stub interface - extends Invite without id, created_at, updated_at
}
export interface InviteUpdate extends Partial<Omit<Invite, 'id' | 'created_at' | 'updated_at'>> {
  // Stub interface - partial Invite without id, created_at, updated_at
}

export interface Attendance {
  id: string;
  session_id: string;
  client_id: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AttendanceInsert extends Omit<Attendance, 'id' | 'created_at' | 'updated_at'> {
  // Stub interface - extends Attendance without id, created_at, updated_at
}
export interface AttendanceUpdate extends Partial<Omit<Attendance, 'id' | 'created_at' | 'updated_at'>> {
  // Stub interface - partial Attendance without id, created_at, updated_at
}

export interface Media {
  id: string;
  coach_id: string;
  client_id: string | null;
  session_id: string | null;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  media_type: string;
  tags: string[] | null;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface MediaInsert extends Omit<Media, 'id' | 'created_at' | 'updated_at'> {
  // Stub interface - extends Media without id, created_at, updated_at
}
export interface MediaUpdate extends Partial<Omit<Media, 'id' | 'created_at' | 'updated_at'>> {
  // Stub interface - partial Media without id, created_at, updated_at
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  content: string;
  status: string;
  sent_at: string;
  created_at: string;
}

export interface EmailLogInsert extends Omit<EmailLog, 'id' | 'created_at'> {
  // Stub interface - extends EmailLog without id, created_at
}
export interface EmailLogUpdate extends Partial<Omit<EmailLog, 'id' | 'created_at'>> {
  // Stub interface - partial EmailLog without id, created_at
}

export interface Trainer {
  id: string;
  user_id: string;
  business_name: string | null;
  bio: string | null;
  specialties: string[] | null;
  certifications: string[] | null;
  years_experience: number | null;
  hourly_rate: number | null;
  website: string | null;
  social_links: unknown | null;
  created_at: string;
  updated_at: string | null;
}

export interface TrainerInsert extends Omit<Trainer, 'id' | 'created_at'> {
  // Stub interface - extends Trainer without id, created_at
}
export interface TrainerUpdate extends Partial<Omit<Trainer, 'id' | 'created_at'>> {
  // Stub interface - partial Trainer without id, created_at
}

export interface WeeklyPlan {
  id: string;
  coach_id: string;
  client_id: string;
  week_start: string;
  week_end: string;
  goals: string[];
  activities: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyPlanInsert extends Omit<WeeklyPlan, 'id' | 'created_at' | 'updated_at'> {
  // Stub interface - extends WeeklyPlan without id, created_at, updated_at
}
export interface WeeklyPlanUpdate extends Partial<Omit<WeeklyPlan, 'id' | 'created_at' | 'updated_at'>> {
  // Stub interface - partial WeeklyPlan without id, created_at, updated_at
}

export interface CheckIn {
  id: string;
  client_id: string;
  coach_id: string;
  check_in_date: string;
  mood: number;
  energy: number;
  sleep_hours: number;
  water_intake: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckInInsert extends Omit<CheckIn, 'id' | 'created_at' | 'updated_at'> {
  // Stub interface - extends CheckIn without id, created_at, updated_at
}
export interface CheckInUpdate extends Partial<Omit<CheckIn, 'id' | 'created_at' | 'updated_at'>> {
  // Stub interface - partial CheckIn without id, created_at, updated_at
}

export interface ProgressMetric {
  id: string;
  client_id: string;
  coach_id: string;
  metric_date: string;
  weight: number | null;
  body_fat: number | null;
  muscle_mass: number | null;
  measurements: Record<string, number> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgressMetricInsert extends Omit<ProgressMetric, 'id' | 'created_at' | 'updated_at'> {
  // Stub interface - extends ProgressMetric without id, created_at, updated_at
}
export interface ProgressMetricUpdate extends Partial<Omit<ProgressMetric, 'id' | 'created_at' | 'updated_at'>> {
  // Stub interface - partial ProgressMetric without id, created_at, updated_at
}

// Stub client functions
export async function createClient() {
  throw new Error('Stub Supabase client - createClient not implemented');
}

export async function createBrowserSupabase() {
  throw new Error('Stub Supabase client - createBrowserSupabase not implemented');
}

export async function supabaseBrowser() {
  throw new Error('Stub Supabase client - supabaseBrowser not implemented');
}

// Stub server functions
export async function createRealSupabaseClient() {
  throw new Error('Stub Supabase client - createRealSupabaseClient not implemented');
}

export async function createIsolatedSupabaseClient() {
  throw new Error('Stub Supabase client - createIsolatedSupabaseClient not implemented');
}

export async function createServerClient() {
  throw new Error('Stub Supabase client - createServerClient not implemented');
}

export async function createServerSupabase() {
  throw new Error('Stub Supabase client - createServerSupabase not implemented');
}

export async function createServiceRoleClient() {
  throw new Error('Stub Supabase client - createServiceRoleClient not implemented');
}

export async function createServiceRoleSupabase() {
  throw new Error('Stub Supabase client - createServiceRoleSupabase not implemented');
}

// Stub secure client
export class SecureSupabaseClient {
  constructor() {
    throw new Error('Stub Supabase client - SecureSupabaseClient not implemented');
  }
}

// Stub RPC types
export interface CreateClientIntakeParams {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  emergency_contact: string;
  medical_notes: string;
  fitness_goals: string;
}

// Stub user role types
export enum UserRole {
  COACH = 'coach',
  CLIENT = 'client',
  ADMIN = 'admin'
}

export enum ResourceType {
  SESSION = 'session',
  CLIENT = 'client',
  PLAN = 'plan'
}

export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}
