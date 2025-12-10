import { Controller, Get, Put, Delete, Param, Body, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../libs/enums';

@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
    constructor(private readonly restaurantsService: RestaurantsService) { }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getRestaurant(@Param('id') id: string, @Req() req: any) {
        // Ensure user can only access their own restaurant
        if (req.user.restaurantId !== id && req.user.role !== UserRole.ADMIN) {
            throw new Error('Unauthorized access to restaurant');
        }
        return this.restaurantsService.findById(id);
    }

    @Put(':id')
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateRestaurant(
        @Param('id') id: string,
        @Body() updateData: any,
        @Req() req: any,
    ) {
        if (req.user.restaurantId !== id && req.user.role !== UserRole.ADMIN) {
            throw new Error('Unauthorized access to restaurant');
        }
        return this.restaurantsService.update(id, updateData);
    }

    @Get(':id/analytics')
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getAnalytics(@Param('id') id: string, @Req() req: any) {
        if (req.user.restaurantId !== id && req.user.role !== UserRole.ADMIN) {
            throw new Error('Unauthorized access to analytics');
        }
        return this.restaurantsService.getAnalytics(id);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async deleteRestaurant(@Param('id') id: string) {
        const deleted = await this.restaurantsService.delete(id);
        return { deleted, message: 'Restaurant deleted successfully' };
    }
}
