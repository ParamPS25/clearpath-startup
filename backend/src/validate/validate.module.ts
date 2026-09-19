import { Module } from '@nestjs/common';
import { SynthesisModule } from '../synthesis/synthesis.module';
import { ValidateController } from './validate.controller';

@Module({
  imports: [SynthesisModule],
  controllers: [ValidateController],
})
export class ValidateModule {}
