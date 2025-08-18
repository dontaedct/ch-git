/**
 * Schema Tools - Universal Header Compliant
 * 
 * Export zod helpers for AI input/output validation.
 */

import { z } from 'zod';

// Incident triage schema
export const IncidentReport = z.object({
  summary: z.string(),
  severity: z.enum(['low', 'med', 'high', 'critical']),
  suspected_causes: z.array(z.string()),
  next_actions: z.array(z.string())
});

// Specification document schema
export const SpecDoc = z.object({
  entities: z.array(z.string()),
  endpoints: z.array(z.object({ 
    path: z.string(), 
    method: z.string(), 
    desc: z.string().optional() 
  })),
  acceptance_tests: z.array(z.string()),
  risks: z.array(z.string())
});

// Export types
export type IncidentReportType = z.infer<typeof IncidentReport>;
export type SpecDocType = z.infer<typeof SpecDoc>;

// Schema validator interface
export interface SchemaValidator<T> {
  validate(data: unknown): T;
  safeParse(data: unknown): { success: boolean; data?: T; error?: any };
}

export function createSchema<T>(): SchemaValidator<T> {
  return {
    validate: (data: unknown) => {
      throw new Error("Schema validation not implemented - skeleton only");
    },
    safeParse: (data: unknown) => ({
      success: false,
      error: "Schema validation not implemented - skeleton only"
    })
  };
}

// Export common schema types
export type AITaskSchema = SchemaValidator<any>;
export type AIInputSchema = SchemaValidator<any>;
export type AIOutputSchema = SchemaValidator<any>;
