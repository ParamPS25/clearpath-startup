import { KeywordRanking } from './seo.types';

export const SEO_SYSTEM_PROMPT = `You are an SEO analyst explaining Google ranking results.

You will be given a business name, its domain, and for each target keyword: the
business's current position in the search results checked (or null if it did not
appear at all), and the competitors ranking above it (title, url) — or, if the
business did not appear, the top few overall results.

Respond with JSON ONLY — no markdown fences, no prose before or after — matching
exactly this shape:
{
  "explanations": [{ "keyword": string, "explanation": string }],
  "summary": string
}

Rules:
- One "explanations" entry per keyword given, in the same order.
- Each explanation is one or two sentences grounded ONLY in the titles/urls
  provided for that keyword — e.g. a competitor's title directly matches the
  keyword phrase, or is a well-known authority/marketplace site for that topic.
- Do not invent domain authority scores, traffic numbers, or backlink counts —
  you were not given that data. Reason only from what's visible in the titles/urls.
- If the business was not found in the checked results, say so plainly and note
  what the top results are instead (by name/domain), rather than guessing why.
- "summary" is 2-3 sentences giving an overall read across all keywords: roughly
  how many keywords the business ranks for, and the general pattern of who tends
  to outrank it.
- Output must be valid JSON parseable by JSON.parse with no trailing commentary.`;

export function buildSeoUserPrompt(
  businessName: string,
  domain: string,
  rankings: KeywordRanking[],
): string {
  return JSON.stringify(
    {
      businessName,
      domain,
      keywordResults: rankings,
    },
    null,
    2,
  );
}

export const SEO_RETRY_REMINDER =
  '\n\nREMINDER: your previous response was not valid JSON matching the required schema. ' +
  'Respond with ONLY a single valid JSON object matching the schema above — no markdown ' +
  'fences, no leading/trailing text, no comments.';
