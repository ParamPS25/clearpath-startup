import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmProvider } from './llm-provider.interface';
import { GeminiProvider } from './gemini.provider';
import { GroqProvider } from './groq.provider';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly primary: LlmProvider;
  private readonly fallback: LlmProvider;

  constructor(
    config: ConfigService,
    gemini: GeminiProvider,
    groq: GroqProvider,
  ) {
    const preferred = config.get<string>('LLM_PROVIDER') ?? 'gemini';
    const providers: Record<string, LlmProvider> = { gemini, groq };

    this.primary = providers[preferred] ?? gemini;
    this.fallback = this.primary === gemini ? groq : gemini;
  }

  async generateJson(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    try {
      return await this.primary.generateJson(systemPrompt, userPrompt);
    } catch (err) {
      this.logger.warn(
        `${this.primary.name} failed (${(err as Error).message}), falling back to ${this.fallback.name}`,
      );
      return this.fallback.generateJson(systemPrompt, userPrompt);
    }
  }
}
