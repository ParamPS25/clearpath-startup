import { z } from 'zod';
import { SearchTrend } from './trend';

export const ValidationReportSchema = z.object({
  name: z.string(),
  nameClashScore: z.number().min(0).max(100),
  nameClashReason: z.string(),
  marketSummary: z.string(),
  competitors: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),
  overallVerdict: z.string(),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
    }),
  ),
});

export type ValidationReport = z.infer<typeof ValidationReportSchema>;

// searchTrend is computed deterministically after LLM synthesis (see
// synthesis.service.ts) — it's never part of the LLM-validated schema above.
export type EnrichedValidationReport = ValidationReport & {
  searchTrend: SearchTrend;
};
