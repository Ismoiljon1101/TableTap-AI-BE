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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/auth.interface';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    try {
      return await this.categoriesService.create(
        req.user.restaurantId,
        createCategoryDto,
      );
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    try {
      return await this.categoriesService.findAll(req.user.restaurantId);
    } catch (error) {
      console.error('Find all categories error:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.categoriesService.findOne(id);
    } catch (error) {
      console.error('Find one category error:', error);
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      return await this.categoriesService.update(id, updateCategoryDto);
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.categoriesService.remove(id);
    } catch (error) {
      console.error('Remove category error:', error);
      throw error;
    }
  }
}
