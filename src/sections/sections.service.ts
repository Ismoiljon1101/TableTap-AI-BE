import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Section, SectionDocument } from './schemas/section.schema';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';

import { toObjectId } from '../libs/config';

@Injectable()
export class SectionsService {
    constructor(
        @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    ) { }

    async create(restaurantId: string | Types.ObjectId, createSectionDto: CreateSectionDto): Promise<SectionDocument> {
        const rid = toObjectId(restaurantId);
        try {
            const section = new this.sectionModel({
                ...createSectionDto,
                restaurantId: rid,
            });
            return await section.save();
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ConflictException(`A section with the name "${createSectionDto.name}" already exists for this restaurant.`);
            }
            throw error;
        }
    }

    async findAll(restaurantId: string | Types.ObjectId): Promise<SectionDocument[]> {
        const rid = toObjectId(restaurantId);
        return this.sectionModel.find({ restaurantId: rid }).exec();
    }

    async findOne(id: string): Promise<SectionDocument | null> {
        return this.sectionModel.findById(toObjectId(id)).exec();
    }

    async update(id: string, updateSectionDto: UpdateSectionDto): Promise<SectionDocument | null> {
        return this.sectionModel
            .findByIdAndUpdate(toObjectId(id), updateSectionDto, { new: true })
            .exec();
    }

    async remove(id: string): Promise<boolean> {
        const result = await this.sectionModel.findByIdAndDelete(toObjectId(id)).exec();
        return !!result;
    }
}
