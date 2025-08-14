import { z } from 'zod';

export const progressMetricUpsert = z.object({
  client_id: z.string().uuid(),
  metric_date: z.string(), // YYYY-MM-DD
  weight_kg: z.number().min(20).max(500).optional(),
  body_fat_percentage: z.number().min(0).max(50).optional(),
  body_weight_lbs: z.number().min(44).max(1100).optional(),
  body_fat_lbs: z.number().min(0).max(550).optional(),
  lean_mass_lbs: z.number().min(44).max(1100).optional(),
  bmi: z.number().min(10).max(100).optional(),
  waist_circumference_cm: z.number().min(30).max(200).optional(),
  chest_circumference_cm: z.number().min(30).max(200).optional(),
  arm_circumference_cm: z.number().min(10).max(100).optional(),
  leg_circumference_cm: z.number().min(20).max(150).optional(),
  notes: z.string().optional()
});

export type ProgressMetricUpsert = z.infer<typeof progressMetricUpsert>;

export const progressMetricUpdate = progressMetricUpsert.partial();

export type ProgressMetricUpdate = z.infer<typeof progressMetricUpdate>;
