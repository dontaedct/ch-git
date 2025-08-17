/**
 * @dct/mit-hero-core
 * MIT Hero Core Types
 * 
 * This module provides the foundational types and interfaces for the MIT Hero system,
 * extracted from the main application to enable reuse across packages.
 */

// ============================================================================
// DATABASE TYPES
// ============================================================================

// Core entity types
export interface Session {
  id: string;
  title: string;
  starts_at: string;
  ends_at?: string;
  location?: string;
  stripe_link?: string;
  coach_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface SessionInsert {
  title: string;
  starts_at: string;
  ends_at?: string;
  location?: string;
  stripe_link?: string;
  coach_id: string;
}

export interface SessionUpdate {
  title?: string;
  starts_at?: string;
  ends_at?: string;
  location?: string;
  stripe_link?: string;
}

export interface Client {
  id: string;
  coach_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  notes?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  date_of_birth?: string;
  height_cm?: number;
  starting_weight_kg?: number;
  current_weight_kg?: number;
  goals?: string;
  medical_notes?: string;
  emergency_contact?: string;
  auth_user_id?: string;
  last_login?: string;
}

export interface ClientInsert {
  coach_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  notes?: string;
  stripe_customer_id?: string;
  date_of_birth?: string;
  height_cm?: number;
  starting_weight_kg?: number;
  current_weight_kg?: number;
  goals?: string;
  medical_notes?: string;
  emergency_contact?: string;
  auth_user_id?: string;
}

export interface ClientUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  notes?: string;
  stripe_customer_id?: string;
  date_of_birth?: string;
  height_cm?: number;
  starting_weight_kg?: number;
  current_weight_kg?: number;
  goals?: string;
  medical_notes?: string;
  emergency_contact?: string;
  last_login?: string;
}

export interface Invite {
  id: string;
  email: string;
  coach_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at?: string;
}

export interface InviteInsert {
  email: string;
  coach_id: string;
  status?: 'pending' | 'accepted' | 'declined';
}

export interface InviteUpdate {
  status?: 'pending' | 'accepted' | 'declined';
}

export interface Attendance {
  id: string;
  session_id: string;
  client_id: string;
  status: 'confirmed' | 'declined' | 'pending';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface AttendanceInsert {
  session_id: string;
  client_id: string;
  status: 'confirmed' | 'declined' | 'pending';
  notes?: string;
}

export interface AttendanceUpdate {
  status?: 'confirmed' | 'declined' | 'pending';
  notes?: string;
}

export interface Media {
  id: string;
  client_id: string;
  original: string;
  created_at: string;
  updated_at?: string;
}

export interface MediaInsert {
  client_id: string;
  original: string;
}

export interface MediaUpdate {
  original?: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  created_at: string;
  updated_at?: string;
}

export interface EmailLogInsert {
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
}

export interface EmailLogUpdate {
  status?: 'sent' | 'failed' | 'pending';
}

export interface Trainer {
  id: string;
  business_name: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  years_experience?: number;
  hourly_rate?: number;
  website?: string;
  social_links?: Record<string, string>;
  created_at: string;
  updated_at?: string;
}

export interface TrainerInsert {
  business_name: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  years_experience?: number;
  hourly_rate?: number;
  website?: string;
  social_links?: Record<string, string>;
}

export interface TrainerUpdate {
  business_name?: string;
  bio?: string;
  specialties?: string[];
  certifications?: string[];
  years_experience?: number;
  hourly_rate?: number;
  website?: string;
  social_links?: Record<string, string>;
}

export interface WeeklyPlan {
  id: string;
  client_id: string;
  coach_id: string;
  week_start_date: string;
  week_end_date?: string;
  title: string;
  description?: string;
  goals: string[];
  tasks: WeeklyPlanTask[];
  status: 'draft' | 'approved' | 'sent' | 'active' | 'completed';
  created_at: string;
  updated_at?: string;
}

export interface WeeklyPlanInsert {
  client_id: string;
  coach_id: string;
  week_start_date: string;
  week_end_date?: string;
  title: string;
  description?: string;
  goals?: string[];
  tasks?: WeeklyPlanTask[];
  status?: 'draft' | 'approved' | 'sent' | 'active' | 'completed';
}

export interface WeeklyPlanUpdate {
  week_start_date?: string;
  week_end_date?: string;
  title?: string;
  description?: string;
  goals?: string[];
  tasks?: WeeklyPlanTask[];
  status?: 'draft' | 'approved' | 'sent' | 'active' | 'completed';
}

export interface WeeklyPlanTask {
  id: string;
  title: string;
  description?: string;
  category: 'workout' | 'nutrition' | 'mindfulness' | 'other';
  frequency: 'daily' | 'weekly' | 'custom';
  custom_schedule?: string;
  completed: boolean;
  notes?: string;
}

export interface CheckIn {
  id: string;
  client_id: string;
  coach_id: string;
  week_start_date: string;
  weekly_plan_id?: string;
  check_in_date: string;
  mood_rating: number;
  energy_level: number;
  sleep_hours?: number;
  water_intake_liters?: number;
  weight_kg?: number;
  body_fat_percentage?: number;
  notes?: string;
  photos?: string[];
  created_at: string;
  updated_at?: string;
}

export interface CheckInInsert {
  client_id: string;
  coach_id: string;
  week_start_date: string;
  weekly_plan_id?: string;
  check_in_date: string;
  mood_rating: number;
  energy_level: number;
  sleep_hours?: number;
  water_intake_liters?: number;
  weight_kg?: number;
  body_fat_percentage?: number;
  notes?: string;
  photos?: string[];
}

export interface CheckInUpdate {
  check_in_date?: string;
  mood_rating?: number;
  energy_level?: number;
  sleep_hours?: number;
  water_intake_liters?: number;
  weight_kg?: number;
  body_fat_percentage?: number;
  notes?: string;
  photos?: string[];
}

export interface ProgressMetric {
  id: string;
  client_id: string;
  coach_id: string;
  metric_type: 'weight' | 'body_fat' | 'strength' | 'endurance' | 'flexibility' | 'custom';
  value: number;
  unit: string;
  date: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface ProgressMetricInsert {
  client_id: string;
  coach_id: string;
  metric_type: 'weight' | 'body_fat' | 'strength' | 'endurance' | 'flexibility' | 'custom';
  value: number;
  unit: string;
  date: string;
  notes?: string;
}

export interface ProgressMetricUpdate {
  metric_type?: 'weight' | 'body_fat' | 'strength' | 'endurance' | 'flexibility' | 'custom';
  value?: number;
  unit?: string;
  date?: string;
  notes?: string;
}

// ============================================================================
// LEGACY TYPES (for backward compatibility)
// ============================================================================

export interface SessionLite {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  stripe_link: string | null;
  coach_id: string;
}

export interface RSVPRecord {
  status: 'confirmed' | 'declined' | 'pending';
  notes?: string;
  client_id: string;
}

export interface ClientWithFullName extends Client {
  fullName: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ActionResult<T> = Promise<{ ok: true; data: T } | { ok: false; error: string }>;

export type FormAction = (formData: FormData) => Promise<void> | void;

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// ============================================================================
// CONCURRENCY TYPES
// ============================================================================

export interface ConcurrencyConfig {
  maxConcurrent: number;
  maxQueueSize: number;
  priorityLevels: number;
  resourceLimits: {
    cpu: number;
    memory: number;
    disk: number;
  };
  timeoutMs: number;
  retryAttempts: number;
  enableMetrics: boolean;
}

export interface QueuedOperation {
  id: string;
  priority: number;
  operation: () => Promise<any>;
  metadata: Record<string, any>;
  timestamp: number;
  retryCount: number;
}

export interface ConcurrencyMetrics {
  activeOperations: number;
  queuedOperations: number;
  totalExecuted: number;
  totalFailed: number;
  averageExecutionTime: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
  };
  lastUpdated: Date;
}

// ============================================================================
// RETRY TYPES
// ============================================================================

export enum ErrorCategory {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export enum RetryStrategy {
  IMMEDIATE = 'IMMEDIATE',
  LINEAR = 'LINEAR',
  EXPONENTIAL = 'EXPONENTIAL',
  CUSTOM = 'CUSTOM'
}

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  jitterFactor: number;
  strategy: RetryStrategy;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  customBackoff?: (attempt: number, baseDelay: number) => number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
  lastError?: Error;
}

// ============================================================================
// LOGGING TYPES
// ============================================================================

export interface LogEntry {
  level: string;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
}

// ============================================================================
// HERO SYSTEM TYPES
// ============================================================================

export interface HeroCore {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'error';
}

export interface HeroSystem {
  heroes: HeroCore[];
  version: string;
  status: 'operational' | 'degraded' | 'error';
}
