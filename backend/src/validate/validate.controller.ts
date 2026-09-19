import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { SynthesisService } from '../synthesis/synthesis.service';
import { ReportsService } from '../reports/reports.service';
import { ValidateRequestDto } from './dto/validate-request.dto';

@Controller('validate')
export class ValidateController {
  private readonly logger = new Logger(ValidateController.name);

  constructor(
    private readonly synthesis: SynthesisService,
    private readonly reports: ReportsService,
  ) {}

  @Post()
  async validate(@Body() dto: ValidateRequestDto) {
    let report;
    try {
      report = await this.synthesis.validate(dto.name, dto.pitch);
    } catch (err) {
      throw new HttpException(
        {
          message: 'Failed to generate validation report',
          detail: (err as Error).message,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    try {
      await this.reports.create({
        name: dto.name,
        pitch: dto.pitch,
        response: report,
      });
    } catch (err) {
      this.logger.warn(`Failed to persist report: ${(err as Error).message}`);
    }

    return report;
  }
}
