export interface Competitor {
  name: string;
  description: string;
}

export interface Source {
  title: string;
  url: string;
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
