import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument } from './report.schema';
import { EnrichedValidationReport } from '../synthesis/schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private readonly model: Model<ReportDocument>,
  ) {}

  async create(data: {
    name: string;
    pitch?: string;
    response: EnrichedValidationReport;
  }) {
    return this.model.create(data);
  }

  async findById(id: string): Promise<ReportDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model.findById(id).exec();
  }
}
