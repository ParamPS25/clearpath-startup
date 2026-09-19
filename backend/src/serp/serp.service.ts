import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SerpResult, SerpSearchResults } from './serp.types';

const SERP_ENDPOINT = 'https://serpapi.com/search.json';
const RESULTS_PER_QUERY = 8;

@Injectable()
export class SerpService {
  private readonly logger = new Logger(SerpService.name);

  constructor(private readonly config: ConfigService) {}

  async search(name: string, pitch?: string): Promise<SerpSearchResults> {
    const [nameResults, marketResults] = await Promise.all([
      this.runQuery(`"${name}" company OR startup OR app OR trademark`),
      this.runQuery(pitch ? `${pitch} competitors` : `${name} competitors`),
    ]);

    return { nameResults, marketResults };
  }

  private async runQuery(query: string): Promise<SerpResult[]> {
    const apiKey = this.config.get<string>('SERP_API_KEY');
    if (!apiKey) {
      throw new Error('SERP_API_KEY is not configured');
    }

    const url = new URL(SERP_ENDPOINT);
    url.searchParams.set('engine', 'google');
    url.searchParams.set('q', query);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('num', String(RESULTS_PER_QUERY));

    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      this.logger.error(`SERP API error ${res.status}: ${body}`);
      throw new Error(`SERP API request failed with status ${res.status}`);
    }

    const data = await res.json();
    const organic: any[] = data.organic_results ?? [];

    return organic.slice(0, RESULTS_PER_QUERY).map((r) => ({
      title: r.title ?? '',
      link: r.link ?? '',
      snippet: r.snippet ?? '',
    }));
  }
}
