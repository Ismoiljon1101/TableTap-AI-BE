import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sections')
@UseGuards(JwtAuthGuard)
export class SectionsController {
    constructor(private readonly sectionsService: SectionsService) { }

    @Post()
    create(@Req() req: any, @Body() createSectionDto: CreateSectionDto) {
        return this.sectionsService.create(req.user.restaurantId, createSectionDto);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.sectionsService.findAll(req.user.restaurantId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sectionsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
        return this.sectionsService.update(id, updateSectionDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.sectionsService.remove(id);
    }
}
