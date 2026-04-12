import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
}

export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  DELETED = 'deleted',
}

class ItemModifier {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  option!: string;

  @Prop({ required: true, default: 0 })
  price!: number;
}

class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'MenuItem', required: true })
  menuItemId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ required: true, min: 0 })
  unitPrice!: number;

  @Prop({ type: [ItemModifier], default: [] })
  modifiers!: ItemModifier[];

  @Prop({ required: false })
  notes?: string;

  @Prop({
    required: true,
    enum: OrderItemStatus,
    default: OrderItemStatus.PENDING,
  })
  status!: OrderItemStatus;

  @Prop({ default: false })
  isAdditional?: boolean;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  orderNumber!: number;

  @Prop({ required: true })
  orderDate!: string; // Format: YYYY-MM-DD

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Table', required: true })
  tableId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  waiterId!: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items!: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal!: number;

  @Prop({ required: true, min: 0, default: 0 })
  tax!: number;

  @Prop({ required: true, min: 0 })
  total!: number;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus!: PaymentStatus;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;

  @Prop({ required: false })
  servedAt?: Date;

  @Prop({ required: false })
  paidAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes for better query performance
OrderSchema.index(
  { restaurantId: 1, orderDate: 1, orderNumber: 1 },
  { unique: true },
);
OrderSchema.index({ tableId: 1 });
OrderSchema.index({ waiterId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
