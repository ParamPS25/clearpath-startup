import { Module } from '@nestjs/common';
import { GeminiProvider } from './gemini.provider';
import { GroqProvider } from './groq.provider';
import { LlmService } from './llm.service';

@Module({
  providers: [GeminiProvider, GroqProvider, LlmService],
  exports: [LlmService],
})
export class LlmModule {}
