import { z } from 'zod';

export const clientUpsert = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  stripe_customer_id: z.string().optional(),
  date_of_birth: z.string().optional(), // ISO date (YYYY-MM-DD)
  height_cm: z.number().int().min(0).max(300).optional(),
  starting_weight_kg: z.number().min(20).max(500).optional(),
  current_weight_kg: z.number().min(20).max(500).optional(),
  goals: z.string().optional(),
  medical_notes: z.string().optional(),
  emergency_contact: z.string().optional(),
  auth_user_id: z.string().uuid().optional()
});

export type ClientUpsert = z.infer<typeof clientUpsert>;

export const clientUpdate = clientUpsert.partial();

export type ClientUpdate = z.infer<typeof clientUpdate>;
