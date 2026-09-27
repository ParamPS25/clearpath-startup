import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SeoService } from './seo.service';
import { SeoRankRequestDto } from './dto/seo-rank-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('seo-rank')
@UseGuards(JwtAuthGuard)
export class SeoController {
  constructor(private readonly seo: SeoService) {}

  @Post()
  async check(@Body() dto: SeoRankRequestDto) {
    try {
      return await this.seo.checkRankings(
        dto.businessName,
        dto.domain,
        dto.keywords,
        dto.location,
      );
    } catch (err) {
      throw new HttpException(
        {
          message: 'Failed to generate SEO ranking report',
          detail: (err as Error).message,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
