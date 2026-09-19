import { Module } from '@nestjs/common';
import { SerpModule } from '../serp/serp.module';
import { LlmModule } from '../llm/llm.module';
import { SeoService } from './seo.service';
import { SeoController } from './seo.controller';

@Module({
  imports: [SerpModule, LlmModule],
  controllers: [SeoController],
  providers: [SeoService],
})
export class SeoModule {}
