import { Module } from '@nestjs/common';
import { SerpModule } from '../serp/serp.module';
import { LlmModule } from '../llm/llm.module';
import { SynthesisService } from './synthesis.service';

@Module({
  imports: [SerpModule, LlmModule],
  providers: [SynthesisService],
  exports: [SynthesisService],
})
export class SynthesisModule {}
