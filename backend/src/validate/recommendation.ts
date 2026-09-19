import { ValidationReport } from '../synthesis/schema';

export interface Recommendation {
  text: string;
  recommendedName: string;
}

/**
 * Deterministic, not LLM-generated: picks the candidate with the highest
 * nameClashScore (least name-clash risk), tie-broken by fewer competitors
 * (less crowded market). Grounded in the same numbers shown in the UI.
 */
export function buildRecommendation(
  reports: ValidationReport[],
): Recommendation {
  const ranked = [...reports].sort((a, b) => {
    if (b.nameClashScore !== a.nameClashScore) {
      return b.nameClashScore - a.nameClashScore;
    }
    return a.competitors.length - b.competitors.length;
  });

  const best = ranked[0];
  const competitorPhrase =
    best.competitors.length === 0
      ? 'no direct competitors found'
      : `${best.competitors.length} competitor${best.competitors.length === 1 ? '' : 's'} found`;

  return {
    recommendedName: best.name,
    text: `"${best.name}" is the strongest candidate — lowest name clash risk (${best.nameClashScore}/100) and ${competitorPhrase}.`,
  };
}
