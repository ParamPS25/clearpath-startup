import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { SerpService } from './serp.service';

@Module({
  imports: [CacheModule],
  providers: [SerpService],
  exports: [SerpService],
})
export class SerpModule {}
