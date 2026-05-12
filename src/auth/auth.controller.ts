import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto, GoogleAuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    try {
      const result = await this.authService.register(registerDto);
      this.setAuthCookies(req, res, result.accessToken, result.refreshToken);
      const { accessToken, refreshToken, ...user } = result;
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    try {
      const result = await this.authService.login(loginDto);
      this.setAuthCookies(req, res, result.accessToken, result.refreshToken);
      const { accessToken, refreshToken, ...user } = result;
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(
    @Body() googleAuthDto: GoogleAuthDto,
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    try {
      const result = await this.authService.googleAuth(googleAuthDto);
      this.setAuthCookies(req, res, result.accessToken, result.refreshToken);
      const { accessToken, refreshToken, ...user } = result;
      return user;
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) throw new UnauthorizedException('No refresh token');

      const payload = this.jwtService.verify(refreshToken);
      const tokens = await this.authService.refreshToken(payload.sub);
      this.setAuthCookies(req, res, tokens.accessToken, tokens.refreshToken);
      
      return { message: 'Token refreshed' };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response
  ) {
    const isSecure = req.secure || req.header('x-forwarded-proto') === 'https';
    const sameSite = isSecure ? 'none' : 'lax';
    
    res.clearCookie('accessToken', { sameSite, secure: isSecure });
    res.clearCookie('refreshToken', { sameSite, secure: isSecure });
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    try {
      // Rolling session: Extend cookies on every profile check
      const user = await this.authService.validateUser(req.user.userId);
      const tokens = await this.authService.refreshToken(user._id.toString());
      this.setAuthCookies(req, res, tokens.accessToken, tokens.refreshToken);
      
      return this.authService.sanitizeUser(user);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  private setAuthCookies(req: express.Request, res: express.Response, access: string, refresh: string) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30); // 30 days rolling

    const isProduction = process.env.NODE_ENV === 'production';
    // CRITICAL: Only use secure: true if we are actually on HTTPS.
    // Phones on local network (http://192.168.x.x) will REJECT secure cookies.
    const isSecure = req.secure || req.header('x-forwarded-proto') === 'https';
    
    const cookieOptions = {
      httpOnly: true,
      secure: isSecure, 
      sameSite: (isSecure ? 'none' : 'lax') as 'none' | 'lax' | 'strict', 
      expires: expires,
    };

    console.log(`📡 [Cookie] Setting auth cookies: secure=${cookieOptions.secure}, sameSite=${cookieOptions.sameSite}, isProd=${isProduction}`);
    res.cookie('accessToken', access, cookieOptions);
    res.cookie('refreshToken', refresh, cookieOptions);
  }
}
