import { Module } from '@nestjs/common';
import { SynthesisModule } from '../synthesis/synthesis.module';
import { ReportsModule } from '../reports/reports.module';
import { AuthModule } from '../auth/auth.module';
import { ValidateController } from './validate.controller';

@Module({
  imports: [SynthesisModule, ReportsModule, AuthModule],
  controllers: [ValidateController],
})
export class ValidateModule {}
