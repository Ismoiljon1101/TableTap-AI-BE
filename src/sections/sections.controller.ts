import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/auth.interface';

@Controller('sections')
@UseGuards(JwtAuthGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createSectionDto: CreateSectionDto,
  ) {
    try {
      return await this.sectionsService.create(
        req.user.restaurantId,
        createSectionDto,
      );
    } catch (error) {
      console.error('Create section error:', error);
      throw error;
    }
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.sectionsService.findAll(req.user.restaurantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.sectionsService.findOne(id);
    } catch (error) {
      console.error('Find one section error:', error);
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    try {
      return await this.sectionsService.update(id, updateSectionDto);
    } catch (error) {
      console.error('Update section error:', error);
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.sectionsService.remove(id);
    } catch (error) {
      console.error('Remove section error:', error);
      throw error;
    }
  }
}
