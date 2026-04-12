import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/auth.interface';

export class UpdateUserDto {
  nickname?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('debug')
  async debugUser(@Req() req: AuthenticatedRequest) {
    try {
      if (!req.query.email) {
        return { error: 'Email query parameter required' };
      }
      const email = req.query.email as string;
      const user = await this.usersService.findByEmail(email);

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
        },
      };
    } catch (error) {
      console.error('Debug user error:', error);
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
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
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    try {
      // Only allow users to delete their own account
      if (req.user.userId !== id) {
        return { error: 'Unauthorized' };
      }

      const deleted = await this.usersService.delete(id);

      return {
        success: deleted,
        message: deleted ? 'Account deleted' : 'User not found',
      };
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }
}
