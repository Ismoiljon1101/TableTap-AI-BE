import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

import { toObjectId } from '../libs/config';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    ) { }

    async create(restaurantId: string | Types.ObjectId, createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
        const rid = toObjectId(restaurantId);
        const category = new this.categoryModel({
            ...createCategoryDto,
            restaurantId: rid,
        });
        return category.save();
    }

    async findAll(restaurantId: string | Types.ObjectId): Promise<CategoryDocument[]> {
        const rid = toObjectId(restaurantId);
        return this.categoryModel.find({ restaurantId: rid }).exec();
    }

    async findOne(id: string): Promise<CategoryDocument | null> {
        return this.categoryModel.findById(toObjectId(id)).exec();
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument | null> {
        return this.categoryModel
            .findByIdAndUpdate(toObjectId(id), updateCategoryDto, { new: true })
            .exec();
    }

    async remove(id: string): Promise<boolean> {
        const result = await this.categoryModel.findByIdAndDelete(toObjectId(id)).exec();
        return !!result;
    }
}
