import { z } from 'zod';

// Only the prose is LLM-generated. Position and competitor rankings are
// computed deterministically in seo.service.ts from raw SERP results — the
// LLM never gets a chance to invent a number here.
export const SeoSynthesisSchema = z.object({
  explanations: z.array(
    z.object({
      keyword: z.string(),
      explanation: z.string(),
    }),
  ),
  summary: z.string(),
});

export type SeoSynthesis = z.infer<typeof SeoSynthesisSchema>;
