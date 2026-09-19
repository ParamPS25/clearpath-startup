import { Injectable, Logger } from '@nestjs/common';
import { SerpService } from '../serp/serp.service';
import { LlmService } from '../llm/llm.service';
import { SYSTEM_PROMPT, buildUserPrompt, RETRY_REMINDER } from './prompt';
import {
  EnrichedValidationReport,
  ValidationReport,
  ValidationReportSchema,
} from './schema';
import { classifyTrend } from './trend';

@Injectable()
export class SynthesisService {
  private readonly logger = new Logger(SynthesisService.name);

  constructor(
    private readonly serp: SerpService,
    private readonly llm: LlmService,
  ) {}

  async validate(
    name: string,
    pitch?: string,
  ): Promise<EnrichedValidationReport> {
    const [results, trendPoints] = await Promise.all([
      this.serp.search(name, pitch),
      this.serp.getSearchTrend(name).catch((err) => {
        this.logger.warn(
          `Trend fetch failed for "${name}": ${(err as Error).message}`,
        );
        return null;
      }),
    ]);
    const searchTrend = classifyTrend(trendPoints);

    const userPrompt = buildUserPrompt(name, pitch, results);

    const firstAttempt = await this.llm.generateJson(SYSTEM_PROMPT, userPrompt);
    const parsed = this.tryParse(firstAttempt);
    if (parsed) return { ...parsed, searchTrend };

    this.logger.warn('LLM output failed schema validation, retrying once');
    const secondAttempt = await this.llm.generateJson(
      SYSTEM_PROMPT,
      userPrompt + RETRY_REMINDER,
    );
    const retried = this.tryParse(secondAttempt);
    if (retried) return { ...retried, searchTrend };

    throw new Error('LLM did not return a valid report after retrying');
  }

  private tryParse(raw: string): ValidationReport | null {
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

    const result = ValidationReportSchema.safeParse(json);
    if (!result.success) {
      this.logger.warn(`LLM output failed schema: ${result.error.message}`);
      return null;
    }

    return result.data;
  }
}
