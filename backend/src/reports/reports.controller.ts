import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    const doc = await this.reports.findById(id);
    if (!doc) {
      throw new NotFoundException('Report not found');
    }

    return {
      id: doc._id.toString(),
      createdAt: doc.createdAt,
      pitch: doc.pitch,
      ...doc.response,
    };
  }
}
