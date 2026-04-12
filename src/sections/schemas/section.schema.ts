import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SectionDocument = Section & Document;

@Schema({ timestamps: true })
export class Section {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId!: Types.ObjectId;

  /** Short unique code for identification (e.g. 'GARDEN', 'VIP') */
  @Prop({ trim: true })
  code?: string;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const SectionSchema = SchemaFactory.createForClass(Section);

// Indexes
SectionSchema.index({ restaurantId: 1, name: 1 }, { unique: true });
