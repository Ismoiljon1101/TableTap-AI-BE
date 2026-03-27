import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
    restaurantId!: Types.ObjectId;

    @Prop({ trim: true })
    code?: string;

    @Prop()
    createdAt!: Date;

    @Prop()
    updatedAt!: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes
CategorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });
