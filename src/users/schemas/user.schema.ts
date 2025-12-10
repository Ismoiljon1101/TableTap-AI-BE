import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../libs/enums';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v: string) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Invalid email format'
        }
    })
    email: string;

    @Prop({ required: false })
    passwordHash?: string;

    @Prop({ required: true, trim: true })
    nickname: string;

    @Prop({
        required: true,
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.WAITER,
        validate: {
            validator: function (v: string) {
                // Only allow lowercase enum values
                return Object.values(UserRole).includes(v as UserRole);
            },
            message: (props: any) => `${props.value} is not a valid role. Must be one of: ${Object.values(UserRole).join(', ')}`
        }
    })
    role: UserRole;

    @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
    restaurantId: Types.ObjectId;

    @Prop({ required: false })
    googleId?: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook to normalize role to lowercase
UserSchema.pre('save', function (next) {
    if (this.role) {
        // Force role to lowercase to match enum
        this.role = (this.role as string).toLowerCase() as UserRole;

        // Validate it matches one of the enum values
        if (!Object.values(UserRole).includes(this.role)) {
            throw new Error(`Invalid role: ${this.role}. Must be one of: ${Object.values(UserRole).join(', ')}`);
        }
    }
    next();
});

// Pre-update hook to normalize role
UserSchema.pre('findOneAndUpdate', function (next) {
    const update: any = this.getUpdate();
    if (update.role || update.$set?.role) {
        const role = update.role || update.$set.role;
        const normalizedRole = role.toLowerCase();

        if (!Object.values(UserRole).includes(normalizedRole as UserRole)) {
            throw new Error(`Invalid role: ${role}. Must be one of: ${Object.values(UserRole).join(', ')}`);
        }

        if (update.$set) {
            update.$set.role = normalizedRole;
        } else {
            update.role = normalizedRole;
        }
    }
    next();
});

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ restaurantId: 1 });
UserSchema.index({ googleId: 1 });
