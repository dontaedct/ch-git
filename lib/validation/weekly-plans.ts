import { z } from 'zod';

export const weeklyPlanUpsert = z.object({
  client_id: z.string().uuid(),
  week_start_date: z.string(), // YYYY-MM-DD (already normalized)
  week_end_date: z.string().optional(), // YYYY-MM-DD
  title: z.string().optional(),
  description: z.string().optional(),
  plan_json: z.any(), // JSONB structure for the plan details
  status: z.enum(['draft', 'approved', 'sent', 'active', 'completed']).default('draft'),
  goals: z.array(z.any()).default([]), // Array of goal objects
  tasks: z.array(z.any()).default([]), // Array of task objects
  notes: z.string().optional()
});

export type WeeklyPlanUpsert = z.infer<typeof weeklyPlanUpsert>;

export const weeklyPlanUpdate = weeklyPlanUpsert.partial();

export type WeeklyPlanUpdate = z.infer<typeof weeklyPlanUpdate>;
