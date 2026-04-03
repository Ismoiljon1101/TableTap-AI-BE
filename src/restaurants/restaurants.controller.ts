import { Controller, Get, Put, Delete, Param, Body, UseGuards, Req, HttpStatus, HttpCode, ForbiddenException } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../libs/enums';
import type { AuthenticatedRequest } from '../auth/interfaces/auth.interface';

@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
    constructor(private readonly restaurantsService: RestaurantsService) { }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getRestaurant(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        try {
            // Ensure user can only access their own restaurant
            if (req.user.restaurantId.toString() !== id && req.user.role !== UserRole.ADMIN) {
                throw new ForbiddenException('Unauthorized access to restaurant');
            }
            return await this.restaurantsService.findById(id);
        } catch (error) {
            console.error('Get restaurant error:', error);
            throw error;
        }
    }

    @Put(':id')
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateRestaurant(
        @Param('id') id: string,
        @Body() updateData: any,
        @Req() req: AuthenticatedRequest,
    ) {
        try {
            if (req.user.restaurantId.toString() !== id && req.user.role !== UserRole.ADMIN) {
                throw new ForbiddenException('Unauthorized access to restaurant');
            }
            return await this.restaurantsService.update(id, updateData);
        } catch (error) {
            console.error('Update restaurant error:', error);
            throw error;
        }
    }

    @Get(':id/analytics')
    @Roles(UserRole.OWNER, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async getAnalytics(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        try {
            if (req.user.restaurantId.toString() !== id && req.user.role !== UserRole.ADMIN) {
                throw new ForbiddenException('Unauthorized access to analytics');
            }
            return await this.restaurantsService.getAnalytics(id);
        } catch (error) {
            console.error('Get analytics error:', error);
            throw error;
        }
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async deleteRestaurant(@Param('id') id: string) {
        try {
            const deleted = await this.restaurantsService.delete(id);
            return { deleted, message: 'Restaurant deleted successfully' };
        } catch (error) {
            console.error('Delete restaurant error:', error);
            throw error;
        }
    }
}
