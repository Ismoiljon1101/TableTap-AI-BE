import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, SchemaTypes } from 'mongoose';

export type MenuItemDocument = MenuItem & Document;



class ModifierOption {
    @Prop({ required: true })
    name!: string;

    @Prop({ required: true, default: 0 })
    price!: number;
}

class Modifier {
    @Prop({ required: true })
    name!: string;

    @Prop({ type: [ModifierOption], default: [] })
    options!: ModifierOption[];
}

@Schema({ timestamps: true })
export class MenuItem {
    @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
    restaurantId!: Types.ObjectId;

    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ required: true, min: 0 })
    price!: number;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    category!: Types.ObjectId;

    @Prop({ default: true })
    isAvailable!: boolean;

    @Prop({ default: false })
    isPopular!: boolean;

    @Prop({ type: [Modifier], default: [] })
    modifiers!: Modifier[];

    @Prop()
    createdAt!: Date;

    @Prop()
    updatedAt!: Date;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

// Indexes
MenuItemSchema.index({ restaurantId: 1 });
MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ isAvailable: 1 });
MenuItemSchema.index({ isPopular: -1 });
