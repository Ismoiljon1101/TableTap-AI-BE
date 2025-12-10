import { Controller, Get, Patch, Delete, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export class UpdateUserDto {
    nickname?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('debug')
    async debugUser(@Req() req: any) {
        if (!req.query.email) {
            return { error: 'Email query parameter required' };
        }
        const user = await this.usersService.findByEmail(req.query.email);

        if (!user) {
            return { error: 'User not found' };
        }

        const { passwordHash, ...userWithoutPassword } = user.toObject();

        return {
            success: true,
            user: userWithoutPassword,
            debug: {
                roleType: typeof user.role,
                roleValue: user.role,
                roleAsString: String(user.role),
            }
        };
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
        // Only allow users to update their own profile
        if (req.user.userId !== id) {
            return { error: 'Unauthorized' };
        }

        const updatedUser = await this.usersService.update(id, updateUserDto);

        if (!updatedUser) {
            return { error: 'User not found' };
        }

        const { passwordHash, ...userWithoutPassword } = updatedUser.toObject();
        return userWithoutPassword;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string, @Req() req: any) {
        // Only allow users to delete their own account
        if (req.user.userId !== id) {
            return { error: 'Unauthorized' };
        }

        const deleted = await this.usersService.delete(id);

        return { success: deleted, message: deleted ? 'Account deleted' : 'User not found' };
    }
}
