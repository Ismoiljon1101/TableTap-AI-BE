import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    ) { }

    async create(restaurantId: string | Types.ObjectId, createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
        const category = new this.categoryModel({
            ...createCategoryDto,
            restaurantId,
        });
        return category.save();
    }

    async findAll(restaurantId: string | Types.ObjectId): Promise<CategoryDocument[]> {
        return this.categoryModel.find({ restaurantId }).exec();
    }

    async findOne(id: string): Promise<CategoryDocument | null> {
        return this.categoryModel.findById(id).exec();
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument | null> {
        return this.categoryModel
            .findByIdAndUpdate(id, updateCategoryDto, { new: true })
            .exec();
    }

    async remove(id: string): Promise<boolean> {
        const result = await this.categoryModel.findByIdAndDelete(id).exec();
        return !!result;
    }
}
