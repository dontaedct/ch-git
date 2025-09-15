import { z } from "zod";

// Re-export phone validation utilities
export { normalizePhone } from "./phone";

// Utility schemas
export const zUUID = z.string().uuid();

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

// Intake schemas
export const intakeSchema = z.object({
  full_name: z.string().min(1),
  name: z.string().min(1), // Add name field for backward compatibility
  email: z.string().email(),
  phone: z.string().optional(),
  coach_id: z.string().uuid().optional(), // Add coach_id field
  consent: z.union([z.literal(true), z.string()]).transform(v => v === true || v === "on" || v === "true" || v === "1" || v === "1"),
});

export const intakeFormSchema = intakeSchema; // Alias for backward compatibility

// Session schema
export const sessionSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["group","private"]),
  location: z.enum(["field","gym","track","other"]),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime().optional(),
  capacity: z.number().int().min(1),
  price: z.number().nonnegative().optional().nullable(),
  stripe_link: z.string().url().optional().nullable(),
});

// Create session schema (for form submissions)
export const createSessionSchema = sessionSchema;

// Toggle task schema
export const toggleTaskSchema = z.object({
  taskId: z.string().uuid(),
  completed: z.boolean(),
});

// Weekly plan schema (minimal shape)
export const weeklyPlanSchema = z.object({
  client_id: z.string().uuid(),
  coach_id: z.string().uuid(),
  week_start_date: z.string().datetime(),
  week_end_date: z.string().datetime().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  goals: z.array(z.string()).default([]), // Provide safe default
  tasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    category: z.enum(['workout', 'nutrition', 'mindfulness', 'other']),
    frequency: z.enum(['daily', 'weekly', 'custom']),
    custom_schedule: z.string().nullable().optional(),
    completed: z.boolean(),
    notes: z.string().nullable().optional(),
  })).default([]), // Provide safe default
  status: z.enum(['draft', 'approved', 'sent', 'active', 'completed']).optional(),
});

// Check-in schema (minimal shape)
export const checkInSchema = z.object({
  client_id: z.string().uuid(),
  coach_id: z.string().uuid(),
  week_start_date: z.string().datetime(), // Add missing required field
  weekly_plan_id: z.string().uuid().nullable().optional(),
  check_in_date: z.string().datetime(),
  mood_rating: z.number().int().min(1).max(5),
  energy_level: z.number().int().min(1).max(5),
  sleep_hours: z.number().nullable().optional(),
  water_intake_liters: z.number().nullable().optional(),
  weight_kg: z.number().nullable().optional(),
  body_fat_percentage: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  photos: z.array(z.string()).optional(),
});

// Trainer profile schema
export const trainerProfileSchema = z.object({
  business_name: z.string().min(1),
  bio: z.string().min(1),
  specialties: z.array(z.string()),
  certifications: z.array(z.string()),
  years_experience: z.number().int().min(0).nullable().optional(),
  hourly_rate: z.number().int().min(0).nullable().optional(),
  website: z.string().url().nullable().optional(),
  social_links: z.record(z.string(), z.string()).nullable().optional(),
});

// Media schemas
export const signedUploadSchema = z.object({
  client_id: z.string().uuid(),
  original: z.string().min(1),
});

export const mediaPathSchema = z.string().min(1);

export const confirmUploadSchema = z.object({
  client_id: z.string().uuid(),
  path: z.string().min(1),
  filename: z.string().min(1),
  mime_type: z.string().min(3),
  size_bytes: z.number().int().positive(),
});

// Performance & Quality Validation
export { PerformanceQualityValidator } from './performance-quality-validator';
export type {
  ValidationResult,
  ValidationConfig,
  PerformanceTargets,
  QualityMetrics,
  ClientSatisfactionMetrics,
  SystemReliabilityMetrics,
  ValidationIssue
} from './performance-quality-validator';
