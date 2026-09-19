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
