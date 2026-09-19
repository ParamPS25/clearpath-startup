import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SynthesisService } from '../synthesis/synthesis.service';
import { ValidateRequestDto } from './dto/validate-request.dto';

@Controller('validate')
export class ValidateController {
  constructor(private readonly synthesis: SynthesisService) {}

  @Post()
  async validate(@Body() dto: ValidateRequestDto) {
    try {
      return await this.synthesis.validate(dto.name, dto.pitch);
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
}
