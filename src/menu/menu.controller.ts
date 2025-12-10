import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req, HttpStatus, HttpCode, Patch } from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../libs/enums';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu.dto';


@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
    constructor(private readonly menuService: MenuService) { }

    @Post()
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createMenuItemDto: CreateMenuItemDto, @Req() req: any) {
        return this.menuService.create(req.user.restaurantId, createMenuItemDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @Req() req: any,
        @Query('category') category?: string,
        @Query('available') available?: string,
    ) {
        const isAvailable = available === 'true' ? true : available === 'false' ? false : undefined;
        return this.menuService.findAll(req.user.restaurantId, category, isAvailable);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        return this.menuService.findById(id);
    }

    @Put(':id')
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateMenuItemDto: UpdateMenuItemDto) {
        return this.menuService.update(id, updateMenuItemDto);
    }

    @Patch(':id/toggle-availability')
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async toggleAvailability(@Param('id') id: string) {
        return this.menuService.toggleAvailability(id);
    }

    @Delete(':id')
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string) {
        const deleted = await this.menuService.delete(id);
        return { deleted, message: 'Menu item deleted successfully' };
    }
}
