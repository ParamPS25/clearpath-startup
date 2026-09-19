import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';
import { SerpResult, SerpSearchResults, TrendPoint } from './serp.types';

const SERP_ENDPOINT = 'https://serpapi.com/search.json';
const RESULTS_PER_QUERY = 8;
const KEYWORD_RESULTS_PER_QUERY = 20;
const CACHE_TTL_SECONDS = 60 * 60; // 1 hour — protects SERP quota during the demo
const TRENDS_CACHE_TTL_SECONDS = 60 * 60 * 6; // 6 hours — trends move slowly

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

  /** Raw organic results for one keyword — used by the SEO rank checker. */
  async searchKeyword(
    keyword: string,
    location?: string,
  ): Promise<SerpResult[]> {
    const cacheKey = this.buildKeywordCacheKey(keyword, location);
    const cached = await this.cache.get<SerpResult[]>(cacheKey);
    if (cached) {
      this.logger.log(`SERP cache hit for keyword "${keyword}"`);
      return cached;
    }

    this.logger.log(
      `SERP cache miss for keyword "${keyword}", calling SerpApi`,
    );
    // Unquoted, an unusual amount of loose word-matching creeps in for
    // generic phrases (e.g. "issue tracking software" surfacing results
    // about tracking sleep apps) — an exact phrase match keeps results on
    // topic, which matters here since the whole point is ranking for it.
    const results = await this.runQuery(
      `"${keyword}"`,
      location,
      KEYWORD_RESULTS_PER_QUERY,
    );
    await this.cache.set(cacheKey, results, CACHE_TTL_SECONDS);
    return results;
  }

  /**
   * Weekly interest-over-time for the last 12 months (0-100 relative scale).
   * Returns null on any failure or when Google Trends has no data for the
   * query at all — very common for brand-new/invented names, since Trends
   * only has data for terms people already search.
   */
  async getSearchTrend(query: string): Promise<TrendPoint[] | null> {
    const cacheKey = `trends:${query.trim().toLowerCase()}`;
    const cached = await this.cache.get<TrendPoint[]>(cacheKey);
    if (cached) {
      this.logger.log(`Trends cache hit for "${query}"`);
      return cached;
    }

    const apiKey = this.config.get<string>('SERP_API_KEY');
    if (!apiKey) {
      throw new Error('SERP_API_KEY is not configured');
    }

    const url = new URL(SERP_ENDPOINT);
    url.searchParams.set('engine', 'google_trends');
    url.searchParams.set('q', query);
    url.searchParams.set('data_type', 'TIMESERIES');
    url.searchParams.set('date', 'today 12-m');
    url.searchParams.set('api_key', apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      this.logger.warn(`Trends API error ${res.status} for "${query}"`);
      return null;
    }

    const data = await res.json();
    const timeline: any[] = data.interest_over_time?.timeline_data ?? [];

    // Drop the current, incomplete week — it would skew the "recent" average.
    const points: TrendPoint[] = timeline
      .filter((t) => !t.partial_data)
      .map((t) => ({
        date: t.date ?? '',
        value: Number(t.values?.[0]?.extracted_value ?? 0),
      }));

    if (points.length === 0) {
      this.logger.log(`No Trends data for "${query}"`);
      return null;
    }

    await this.cache.set(cacheKey, points, TRENDS_CACHE_TTL_SECONDS);
    return points;
  }

  private buildCacheKey(name: string, pitch?: string): string {
    const normalizedName = name.trim().toLowerCase();
    const normalizedPitch = (pitch ?? '').trim().toLowerCase();
    return `serp:${normalizedName}:${normalizedPitch}`;
  }

  private buildKeywordCacheKey(keyword: string, location?: string): string {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const normalizedLocation = (location ?? '').trim().toLowerCase();
    return `serp:kw:${normalizedKeyword}:${normalizedLocation}`;
  }

  private async runQuery(
    query: string,
    location?: string,
    numResults: number = RESULTS_PER_QUERY,
  ): Promise<SerpResult[]> {
    const apiKey = this.config.get<string>('SERP_API_KEY');
    if (!apiKey) {
      throw new Error('SERP_API_KEY is not configured');
    }

    const url = new URL(SERP_ENDPOINT);
    url.searchParams.set('engine', 'google');
    url.searchParams.set('q', query);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('num', String(numResults));
    // Without an explicit locale, generic keyword queries can come back
    // matching loosely on individual words instead of the intended phrase.
    url.searchParams.set('hl', 'en');
    url.searchParams.set('gl', 'us');
    if (location) {
      url.searchParams.set('location', location);
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      this.logger.error(`SERP API error ${res.status}: ${body}`);
      throw new Error(`SERP API request failed with status ${res.status}`);
    }

    const data = await res.json();
    const organic: any[] = data.organic_results ?? [];

    return organic.slice(0, numResults).map((r) => ({
      title: r.title ?? '',
      link: r.link ?? '',
      snippet: r.snippet ?? '',
    }));
  }
}
