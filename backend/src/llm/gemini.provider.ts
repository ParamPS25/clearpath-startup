import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LlmProvider } from './llm-provider.interface';

@Injectable()
export class GeminiProvider implements LlmProvider {
  readonly name = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly client: GoogleGenerativeAI | null;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    this.client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.model = this.config.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  }

  async generateJson(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    if (!this.client) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

    if (!text) {
      this.logger.warn('Gemini returned an empty response');
      throw new Error('Gemini returned an empty response');
    }

    return text;
  }
}
