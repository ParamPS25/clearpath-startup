export interface Competitor {
  name: string;
  description: string;
}

export interface Source {
  title: string;
  url: string;
}

export type TrendDirection = "rising" | "declining" | "flat" | "insufficient_data";

export interface TrendPoint {
  date: string;
  value: number;
}

export interface SearchTrend {
  direction: TrendDirection;
  points: TrendPoint[];
}

export interface ValidationReport {
  id?: string;
  createdAt?: string;
  name: string;
  nameClashScore: number;
  nameClashReason: string;
  marketSummary: string;
  competitors: Competitor[];
  overallVerdict: string;
  sources: Source[];
  searchTrend?: SearchTrend;
}

export interface CandidateInput {
  name: string;
  pitch?: string;
}

export type CompareResult = ValidationReport | { name: string; error: string };

export interface CompareResponse {
  results: CompareResult[];
  recommendation: string;
  recommendedName: string;
}

export function isReportResult(result: CompareResult): result is ValidationReport {
  return !("error" in result);
}

export interface RankedResult {
  position: number;
  title: string;
  url: string;
}

export interface KeywordRankResult {
  keyword: string;
  position: number | null;
  topCompetitors: RankedResult[];
  explanation: string;
}

export interface SeoRankReport {
  businessName: string;
  domain: string;
  results: KeywordRankResult[];
  summary: string;
}
