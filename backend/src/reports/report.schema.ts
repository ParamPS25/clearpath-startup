import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EnrichedValidationReport } from '../synthesis/schema';

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'reports',
})
export class Report {
  @Prop({ required: true })
  name: string;

  @Prop()
  pitch?: string;

  @Prop({ type: Object, required: true })
  response: EnrichedValidationReport;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  createdAt?: Date;
}

export type ReportDocument = Report & Document;
export const ReportSchema = SchemaFactory.createForClass(Report);
