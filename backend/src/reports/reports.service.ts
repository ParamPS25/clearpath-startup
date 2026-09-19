import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './report.schema';
import { ValidationReport } from '../synthesis/schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private readonly model: Model<ReportDocument>,
  ) {}

  async create(data: {
    name: string;
    pitch?: string;
    response: ValidationReport;
  }) {
    return this.model.create(data);
  }
}
