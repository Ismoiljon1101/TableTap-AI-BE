import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu.dto';
import { toObjectId } from '../libs/config';

interface MenuItemFilter {
    restaurantId: string | Types.ObjectId;
    category?: string;
    isAvailable?: boolean;
}

@Injectable()
export class MenuService {
    constructor(
        @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    ) { }

    async create(restaurantId: string | Types.ObjectId, menuData: CreateMenuItemDto): Promise<MenuItemDocument> {
        const rid = toObjectId(restaurantId);
        const menuItem = new this.menuItemModel({
            ...menuData,
            restaurantId: rid,
            category: toObjectId(menuData.category),
        });
        return menuItem.save();
    }

    async findAll(restaurantId: string | Types.ObjectId, category?: string, isAvailable?: boolean): Promise<MenuItemDocument[]> {
        const rid = toObjectId(restaurantId);
        const filter: any = { restaurantId: rid };

        if (category && category !== 'all') {
            filter.category = toObjectId(category);
        }

        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable;
        }

        return this.menuItemModel.find(filter).populate('category').sort({ category: 1, name: 1 }).exec();
    }

    async findById(id: string | Types.ObjectId): Promise<MenuItemDocument | null> {
        return this.menuItemModel.findById(toObjectId(id)).populate('category').exec();
    }

    async update(id: string | Types.ObjectId, updateData: UpdateMenuItemDto): Promise<MenuItemDocument | null> {
        const mid = toObjectId(id);
        const data = { ...updateData };
        if (data.category) {
            data.category = toObjectId(data.category) as any;
        }

        return this.menuItemModel
            .findByIdAndUpdate(mid, data, { new: true })
            .populate('category')
            .exec();
    }

    async delete(id: string | Types.ObjectId): Promise<boolean> {
        const result = await this.menuItemModel.findByIdAndDelete(toObjectId(id)).exec();
        return !!result;
    }

    async toggleAvailability(id: string | Types.ObjectId): Promise<MenuItemDocument | null> {
        const mid = toObjectId(id);
        const item = await this.menuItemModel.findById(mid);
        if (!item) return null;

        item.isAvailable = !item.isAvailable;
        return item.save();
    }
}
