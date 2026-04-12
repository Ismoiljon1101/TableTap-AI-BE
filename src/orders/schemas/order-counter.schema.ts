import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderCounterDocument = OrderCounter & Document;

@Schema()
export class OrderCounter {
  // MongoDB will automatically create _id field
  // We use it in format: "restaurantId_order"

  @Prop({ type: String })
  _id!: string;

  @Prop({ required: true, default: 0 })
  sequence!: number;

  @Prop({ type: Date, default: Date.now })
  updatedAt!: Date;
}

export const OrderCounterSchema = SchemaFactory.createForClass(OrderCounter);
