import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report, ReportDocument } from './report.schema';
import { EnrichedValidationReport } from '../synthesis/schema';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectModel(Report.name) private readonly model: Model<ReportDocument>,
  ) {}

  async create(data: {
    name: string;
    pitch?: string;
    response: EnrichedValidationReport;
    createdBy?: string;
  }) {
    const doc = await this.model.create(data);
    this.logger.log(
      `Persisted report "${data.name}" (${doc._id.toString()})${
        data.createdBy ? ` for user ${data.createdBy}` : ''
      }`,
    );
    return doc;
  }

  async findById(id: string): Promise<ReportDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model.findById(id).exec();
  }
}
