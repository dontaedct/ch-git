import { z } from 'zod';

export const checkInUpsert = z.object({
  client_id: z.string().uuid(),
  week_start_date: z.string(), // YYYY-MM-DD (already normalized)
  mood_rating: z.number().int().min(1).max(5).optional(),
  energy_level: z.number().int().min(1).max(5).optional(),
  sleep_hours: z.number().min(0).max(24).optional(),
  water_intake_liters: z.number().min(0).max(10).optional(),
  weight_kg: z.number().min(20).max(500).optional(),
  body_fat_percentage: z.number().min(0).max(50).optional(),
  notes: z.string().optional()
});

export type CheckInUpsert = z.infer<typeof checkInUpsert>;

export const checkInUpdate = checkInUpsert.partial();

export type CheckInUpdate = z.infer<typeof checkInUpdate>;
