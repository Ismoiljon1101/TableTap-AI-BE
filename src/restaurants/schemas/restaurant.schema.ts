import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

export enum SubscriptionPlan {
    FREE = 'free',
    PRO = 'pro',
    ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

class Subscription {
    @Prop({ required: true, enum: SubscriptionPlan, default: SubscriptionPlan.FREE })
    plan: SubscriptionPlan;

    @Prop({ required: true, enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
    status: SubscriptionStatus;

    @Prop({ required: false })
    currentPeriodEnd?: Date;
}

class Settings {
    @Prop({ default: 'USD' })
    currency: string;

    @Prop({ default: 0 })
    taxRate: number;

    @Prop({ default: 'UTC' })
    timezone: string;

    @Prop({ default: false })
    autoPrint: boolean;
}

@Schema({ timestamps: true })
export class Restaurant {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    ownerId: Types.ObjectId;

    @Prop({ type: Subscription, required: true, default: () => ({}) })
    subscription: Subscription;

    @Prop({ type: Settings, required: true, default: () => ({}) })
    settings: Settings;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

// Indexes
RestaurantSchema.index({ ownerId: 1 });
RestaurantSchema.index({ name: 1 });
