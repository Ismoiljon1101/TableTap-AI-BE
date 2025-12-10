import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { CreateMenuItemDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
    constructor(
        @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    ) { }

    async create(restaurantId: string | Types.ObjectId, menuData: CreateMenuItemDto): Promise<MenuItemDocument> {
        const menuItem = new this.menuItemModel({
            ...menuData,
            restaurantId,
        });
        return menuItem.save();
    }

    async findAll(restaurantId: string | Types.ObjectId, category?: string, isAvailable?: boolean): Promise<MenuItemDocument[]> {
        const filter: any = { restaurantId };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable;
        }

        return this.menuItemModel.find(filter).populate('category').sort({ category: 1, name: 1 }).exec();
    }

    async findById(id: string | Types.ObjectId): Promise<MenuItemDocument | null> {
        return this.menuItemModel.findById(id).populate('category').exec();
    }

    async update(id: string | Types.ObjectId, updateData: any): Promise<MenuItemDocument | null> {
        return this.menuItemModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('category')
            .exec();
    }

    async delete(id: string | Types.ObjectId): Promise<boolean> {
        const result = await this.menuItemModel.findByIdAndDelete(id).exec();
        return !!result;
    }

    async toggleAvailability(id: string | Types.ObjectId): Promise<MenuItemDocument | null> {
        const item = await this.menuItemModel.findById(id);
        if (!item) return null;

        item.isAvailable = !item.isAvailable;
        return item.save();
    }
}
