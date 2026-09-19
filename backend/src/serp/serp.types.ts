export interface SerpResult {
  title: string;
  link: string;
  snippet: string;
}

export interface SerpSearchResults {
  nameResults: SerpResult[];
  marketResults: SerpResult[];
}

export interface TrendPoint {
  date: string;
  value: number;
}
