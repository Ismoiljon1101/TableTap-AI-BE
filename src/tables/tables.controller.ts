import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { TablesService } from './tables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTableDto, CreateTablesDto, UpdateTableDto } from './dto/table.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/auth.interface';

@Controller('tables')
@UseGuards(JwtAuthGuard)
export class TablesController {
    constructor(private readonly tablesService: TablesService) { }

    @Post('batch')
    @HttpCode(HttpStatus.CREATED)
    async createBatch(@Body() createTablesDto: CreateTablesDto, @Req() req: AuthenticatedRequest) {
        try {
            return await this.tablesService.createBatch(req.user.restaurantId, createTablesDto.tables);
        } catch (error) {
            console.error('Batch create tables error:', error);
            throw error;
        }
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createTableDto: CreateTableDto, @Req() req: AuthenticatedRequest) {
        try {
            return await this.tablesService.create(req.user.restaurantId, createTableDto);
        } catch (error) {
            console.error('Create table error:', error);
            throw error;
        }
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Req() req: AuthenticatedRequest) {
        try {
            return await this.tablesService.findAll(req.user.restaurantId);
        } catch (error) {
            console.error('Find all tables error:', error);
            throw error;
        }
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        try {
            return await this.tablesService.findById(id);
        } catch (error) {
            console.error('Find one table error:', error);
            throw error;
        }
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
        try {
            return await this.tablesService.update(id, updateTableDto);
        } catch (error) {
            console.error('Update table error:', error);
            throw error;
        }
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string) {
        try {
            const deleted = await this.tablesService.delete(id);
            return { deleted, message: 'Table deleted successfully' };
        } catch (error) {
            console.error('Delete table error:', error);
            throw error;
        }
    }
}
