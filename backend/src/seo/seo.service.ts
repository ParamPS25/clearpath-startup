import { Injectable, Logger } from '@nestjs/common';
import { SerpService } from '../serp/serp.service';
import { LlmService } from '../llm/llm.service';
import {
  SEO_SYSTEM_PROMPT,
  SEO_RETRY_REMINDER,
  buildSeoUserPrompt,
} from './prompt';
import { SeoSynthesis, SeoSynthesisSchema } from './schema';
import { KeywordRanking, SeoRankReport } from './seo.types';

const TOP_COMPETITORS_SHOWN = 3;

@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);

  constructor(
    private readonly serp: SerpService,
    private readonly llm: LlmService,
  ) {}

  async checkRankings(
    businessName: string,
    domain: string,
    keywords: string[],
    location?: string,
  ): Promise<SeoRankReport> {
    const normalizedDomain = normalizeDomain(domain);

    const rankings = await Promise.all(
      keywords.map((keyword) =>
        this.rankForKeyword(keyword, normalizedDomain, location),
      ),
    );

    const userPrompt = buildSeoUserPrompt(
      businessName,
      normalizedDomain,
      rankings,
    );
    const firstAttempt = await this.llm.generateJson(
      SEO_SYSTEM_PROMPT,
      userPrompt,
    );
    const parsed =
      this.tryParse(firstAttempt) ??
      this.tryParse(
        await this.llm.generateJson(
          SEO_SYSTEM_PROMPT,
          userPrompt + SEO_RETRY_REMINDER,
        ),
      );

    if (!parsed) {
      throw new Error('LLM did not return a valid SEO report after retrying');
    }

    const results = rankings.map((ranking) => ({
      ...ranking,
      explanation:
        parsed.explanations.find((e) => e.keyword === ranking.keyword)
          ?.explanation ?? 'No explanation available.',
    }));

    return {
      businessName,
      domain: normalizedDomain,
      results,
      summary: parsed.summary,
    };
  }

  private async rankForKeyword(
    keyword: string,
    domain: string,
    location?: string,
  ): Promise<KeywordRanking> {
    const results = await this.serp.searchKeyword(keyword, location);
    const matchIndex = results.findIndex((r) =>
      hostnameMatches(r.link, domain),
    );
    const position = matchIndex === -1 ? null : matchIndex + 1;

    const aboveSlice =
      position === null
        ? results.slice(0, TOP_COMPETITORS_SHOWN)
        : results.slice(0, matchIndex);

    return {
      keyword,
      position,
      topCompetitors: aboveSlice
        .slice(0, TOP_COMPETITORS_SHOWN)
        .map((r, i) => ({
          position: i + 1,
          title: r.title,
          url: r.link,
        })),
    };
  }

  private tryParse(raw: string): SeoSynthesis | null {
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '');

    let json: unknown;
    try {
      json = JSON.parse(cleaned);
    } catch (err) {
      this.logger.warn(
        `Failed to JSON.parse LLM output: ${(err as Error).message}`,
      );
      return null;
    }

    const result = SeoSynthesisSchema.safeParse(json);
    if (!result.success) {
      this.logger.warn(`LLM output failed schema: ${result.error.message}`);
      return null;
    }

    return result.data;
  }
}

function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
}

function hostnameMatches(url: string, domain: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    return hostname === domain || hostname.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}
