import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, GoogleAuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto) {
        try {
            return await this.authService.register(registerDto);
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        try {
            return await this.authService.login(loginDto);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    @Post('google')
    @HttpCode(HttpStatus.OK)
    async googleAuth(@Body() googleAuthDto: GoogleAuthDto) {
        try {
            return await this.authService.googleAuth(googleAuthDto);
        } catch (error) {
            console.error('Google auth error:', error);
            throw error;
        }
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Req() req: AuthenticatedRequest) {
        try {
            return await this.authService.refreshToken(req.user.userId);
        } catch (error) {
            console.error('Refresh token error:', error);
            throw error;
        }
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async logout() {
        return { message: 'Logged out successfully' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: AuthenticatedRequest) {
        try {
            return req.user;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }
}
