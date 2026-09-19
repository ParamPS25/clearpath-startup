export interface RankedResult {
  position: number;
  title: string;
  url: string;
}

export interface KeywordRanking {
  keyword: string;
  position: number | null;
  topCompetitors: RankedResult[];
}

export interface SeoRankResult extends KeywordRanking {
  explanation: string;
}

export interface SeoRankReport {
  businessName: string;
  domain: string;
  results: SeoRankResult[];
  summary: string;
}
