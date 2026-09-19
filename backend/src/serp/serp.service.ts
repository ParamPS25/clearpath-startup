import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';
import { SerpResult, SerpSearchResults } from './serp.types';

const SERP_ENDPOINT = 'https://serpapi.com/search.json';
const RESULTS_PER_QUERY = 8;
const CACHE_TTL_SECONDS = 60 * 60; // 1 hour — protects SERP quota during the demo

@Injectable()
export class SerpService {
  private readonly logger = new Logger(SerpService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly cache: CacheService,
  ) {}

  async search(name: string, pitch?: string): Promise<SerpSearchResults> {
    const cacheKey = this.buildCacheKey(name, pitch);
    const cached = await this.cache.get<SerpSearchResults>(cacheKey);
    if (cached) {
      this.logger.log(`SERP cache hit for "${name}"`);
      return cached;
    }

    this.logger.log(`SERP cache miss for "${name}", calling SerpApi`);
    const [nameResults, marketResults] = await Promise.all([
      this.runQuery(`"${name}" company OR startup OR app OR trademark`),
      this.runQuery(pitch ? `${pitch} competitors` : `${name} competitors`),
    ]);

    const results = { nameResults, marketResults };
    await this.cache.set(cacheKey, results, CACHE_TTL_SECONDS);
    return results;
  }

  private buildCacheKey(name: string, pitch?: string): string {
    const normalizedName = name.trim().toLowerCase();
    const normalizedPitch = (pitch ?? '').trim().toLowerCase();
    return `serp:${normalizedName}:${normalizedPitch}`;
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
