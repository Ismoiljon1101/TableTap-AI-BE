import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { TablesService } from './tables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTableDto, CreateTablesDto, UpdateTableDto } from './dto/table.dto';

@Controller('tables')
@UseGuards(JwtAuthGuard)
export class TablesController {
    constructor(private readonly tablesService: TablesService) { }

    @Post('batch')
    @HttpCode(HttpStatus.CREATED)
    async createBatch(@Body() createTablesDto: CreateTablesDto, @Req() req: any) {
        return this.tablesService.createBatch(req.user.restaurantId, createTablesDto.tables);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createTableDto: CreateTableDto, @Req() req: any) {
        return this.tablesService.create(req.user.restaurantId, createTableDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(@Req() req: any) {
        return this.tablesService.findAll(req.user.restaurantId);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        return this.tablesService.findById(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
        return this.tablesService.update(id, updateTableDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string) {
        const deleted = await this.tablesService.delete(id);
        return { deleted, message: 'Table deleted successfully' };
    }
}
