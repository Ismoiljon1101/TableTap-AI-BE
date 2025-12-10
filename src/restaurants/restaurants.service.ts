import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';

@Injectable()
export class RestaurantsService {
    constructor(
        @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    ) { }

    async create(restaurantData: Partial<Restaurant>): Promise<RestaurantDocument> {
        const restaurant = new this.restaurantModel(restaurantData);
        return restaurant.save();
    }

    async findById(id: string | Types.ObjectId): Promise<RestaurantDocument | null> {
        return this.restaurantModel.findById(id).exec();
    }

    async findByOwner(ownerId: string | Types.ObjectId): Promise<RestaurantDocument[]> {
        return this.restaurantModel.find({ ownerId }).exec();
    }

    async update(id: string | Types.ObjectId, updateData: Partial<Restaurant>): Promise<RestaurantDocument | null> {
        return this.restaurantModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
    }

    async delete(id: string | Types.ObjectId): Promise<boolean> {
        const result = await this.restaurantModel.findByIdAndDelete(id).exec();
        return !!result;
    }

    async getAnalytics(restaurantId: string | Types.ObjectId, startDate?: Date, endDate?: Date) {
        // Placeholder for analytics - will implement with order aggregation
        return {
            restaurantId,
            period: { startDate, endDate },
            totalOrders: 0,
            totalRevenue: 0,
            popularItems: [],
        };
    }
}
