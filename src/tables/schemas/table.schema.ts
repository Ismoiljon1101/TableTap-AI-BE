import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, SchemaTypes } from 'mongoose';

export type TableDocument = Table & Document;

export enum TableStatus {
    AVAILABLE = 'available',
    OCCUPIED = 'occupied',
    RESERVED = 'reserved',
}

class Position {
    @Prop({ required: true, default: 0 })
    x!: number;

    @Prop({ required: true, default: 0 })
    y!: number;
}

@Schema({ timestamps: true })
export class Table {
    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
    restaurantId!: Types.ObjectId;

    @Prop({ required: false })
    displayName?: string;

    /** Short unique code for quick reference (e.g. 'T1', 'VIP-2') */
    @Prop({ trim: true })
    code?: string;

    @Prop({ default: 4 })
    capacity!: number;

    @Prop({ required: true, enum: TableStatus, default: TableStatus.AVAILABLE })
    status!: TableStatus;

    @Prop({ type: Position, default: () => ({ x: 0, y: 0 }) })
    position!: Position;

    @Prop({ default: 0 })
    rotation!: number;

    @Prop({ type: SchemaTypes.Mixed, ref: 'Section' })
    section!: Types.ObjectId | string;

    /** Width in grid units. 1 unit = CELL_SIZE_PX pixels on the canvas. */
    @Prop({ default: 2 })
    width!: number;

    /** Height in grid units. 1 unit = CELL_SIZE_PX pixels on the canvas. */
    @Prop({ default: 1 })
    height!: number;

    @Prop({ default: 'rectangle' })
    shape!: string;

    @Prop({ type: Types.ObjectId, ref: 'Order', required: false })
    currentOrderId?: Types.ObjectId;

    @Prop()
    createdAt!: Date;

    @Prop()
    updatedAt!: Date;
}

export const TableSchema = SchemaFactory.createForClass(Table);

// Indexes
TableSchema.index({ restaurantId: 1, name: 1 }, { unique: true });
TableSchema.index({ status: 1 });
