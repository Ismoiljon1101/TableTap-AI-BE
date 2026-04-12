import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../libs/enums';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/auth.interface';

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createMenuItemDto: CreateMenuItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.menuService.create(
        req.user.restaurantId,
        createMenuItemDto,
      );
    } catch (error) {
      console.error('Create menu item error:', error);
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('category') category?: string,
    @Query('available') available?: string,
  ) {
    try {
      const isAvailable =
        available === 'true' ? true : available === 'false' ? false : undefined;
      return await this.menuService.findAll(
        req.user.restaurantId,
        category,
        isAvailable,
      );
    } catch (error) {
      console.error('Find all menu items error:', error);
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    try {
      return await this.menuService.findById(id);
    } catch (error) {
      console.error('Find one menu item error:', error);
      throw error;
    }
  }

  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    try {
      return await this.menuService.update(id, updateMenuItemDto);
    } catch (error) {
      console.error('Update menu item error:', error);
      throw error;
    }
  }

  @Patch(':id/toggle-availability')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async toggleAvailability(@Param('id') id: string) {
    try {
      return await this.menuService.toggleAvailability(id);
    } catch (error) {
      console.error('Toggle availability error:', error);
      throw error;
    }
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    try {
      const deleted = await this.menuService.delete(id);
      return { deleted, message: 'Menu item deleted successfully' };
    } catch (error) {
      console.error('Delete menu item error:', error);
      throw error;
    }
  }
}
