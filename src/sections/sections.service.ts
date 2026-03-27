import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Section, SectionDocument } from './schemas/section.schema';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';

@Injectable()
export class SectionsService {
    constructor(
        @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    ) { }

    async create(restaurantId: string | Types.ObjectId, createSectionDto: CreateSectionDto): Promise<SectionDocument> {
        const section = new this.sectionModel({
            ...createSectionDto,
            restaurantId,
        });
        return section.save();
    }

    async findAll(restaurantId: string | Types.ObjectId): Promise<SectionDocument[]> {
        const rid = typeof restaurantId === 'string' ? new Types.ObjectId(restaurantId) : restaurantId;
        const sections = await this.sectionModel.find({ restaurantId: rid }).exec();
        console.log(`[SectionsService] Found ${sections.length} sections for restaurant: ${rid}`);
        return sections;
    }

    async findOne(id: string): Promise<SectionDocument | null> {
        return this.sectionModel.findById(id).exec();
    }

    async update(id: string, updateSectionDto: UpdateSectionDto): Promise<SectionDocument | null> {
        return this.sectionModel
            .findByIdAndUpdate(id, updateSectionDto, { new: true })
            .exec();
    }

    async remove(id: string): Promise<boolean> {
        const result = await this.sectionModel.findByIdAndDelete(id).exec();
        return !!result;
    }
}
