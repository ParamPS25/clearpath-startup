import { z } from 'zod';

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
