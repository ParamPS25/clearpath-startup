import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SynthesisService } from '../synthesis/synthesis.service';
import { ReportsService } from '../reports/reports.service';
import { EnrichedValidationReport } from '../synthesis/schema';
import { ValidateRequestDto } from './dto/validate-request.dto';
import { CompareRequestDto } from './dto/compare-request.dto';
import { buildRecommendation } from './recommendation';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AccessTokenPayload } from '../auth/auth.service';

type ReportWithId = EnrichedValidationReport & { id?: string };

@Controller('validate')
@UseGuards(JwtAuthGuard)
export class ValidateController {
  private readonly logger = new Logger(ValidateController.name);

  constructor(
    private readonly synthesis: SynthesisService,
    private readonly reports: ReportsService,
  ) {}

  @Post()
  async validate(
    @Body() dto: ValidateRequestDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    try {
      return await this.validateAndPersist(dto.name, dto.pitch, user.sub);
    } catch (err) {
      throw new HttpException(
        {
          message: 'Failed to generate validation report',
          detail: (err as Error).message,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Post('compare')
  async compare(
    @Body() dto: CompareRequestDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    const settled = await Promise.allSettled(
      dto.candidates.map((candidate) =>
        this.validateAndPersist(
          candidate.name,
          candidate.pitch || dto.sharedPitch,
          user.sub,
        ),
      ),
    );

    const results = settled.map((outcome, i) =>
      outcome.status === 'fulfilled'
        ? outcome.value
        : {
            name: dto.candidates[i].name,
            error: (outcome.reason as Error).message,
          },
    );

    const succeeded = results.filter((r): r is ReportWithId => !('error' in r));

    if (succeeded.length === 0) {
      throw new HttpException(
        { message: 'Failed to generate any comparison reports' },
        HttpStatus.BAD_GATEWAY,
      );
    }

    const { text, recommendedName } = buildRecommendation(succeeded);
    return { results, recommendation: text, recommendedName };
  }

  private async validateAndPersist(
    name: string,
    pitch: string | undefined,
    userId: string,
  ): Promise<ReportWithId> {
    const report = await this.synthesis.validate(name, pitch);

    let id: string | undefined;
    try {
      const doc = await this.reports.create({
        name,
        pitch,
        response: report,
        createdBy: userId,
      });
      id = doc._id.toString();
    } catch (err) {
      this.logger.warn(
        `Failed to persist report for "${name}": ${(err as Error).message}`,
      );
    }

    return { ...report, id };
  }
}
