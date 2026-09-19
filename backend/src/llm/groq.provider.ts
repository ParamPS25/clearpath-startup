import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LlmProvider } from './llm-provider.interface';

@Injectable()
export class GroqProvider implements LlmProvider {
  readonly name = 'groq';
  private readonly logger = new Logger(GroqProvider.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    this.client = apiKey
      ? new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' })
      : null;
    this.model = this.config.get<string>('GROQ_MODEL') ?? 'openai/gpt-oss-120b';
  }

  async generateJson(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    if (!this.client) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const completion = await this.client.chat.completions.create({
      model: this.model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const text = completion.choices[0]?.message?.content;

    if (!text) {
      this.logger.warn('Groq returned an empty response');
      throw new Error('Groq returned an empty response');
    }

    return text;
  }
}
