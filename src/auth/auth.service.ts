import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  Restaurant,
  RestaurantDocument,
} from '../restaurants/schemas/restaurant.schema';
import { RegisterDto, LoginDto, GoogleAuthDto } from './dto/auth.dto';
import { UserRole } from '../libs/enums';
import { toObjectId } from '../libs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<RestaurantDocument>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, nickname, restaurantName, restaurantId, role } =
      registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    let restaurant;
    let userRole = role || UserRole.WAITER;

    // Owner creates a new restaurant
    if (userRole === UserRole.OWNER || userRole === ('owner' as any)) {
      if (!restaurantName) {
        throw new UnauthorizedException(
          'Restaurant name is required for owners',
        );
      }

      // Create restaurant
      restaurant = await this.restaurantModel.create({
        name: restaurantName,
        ownerId: null, // Will be updated after user creation
      });

      userRole = UserRole.OWNER;
    }
    // Waiter joins existing restaurant
    else {
      if (!restaurantId) {
        throw new UnauthorizedException(
          'Restaurant ID is required for waiters',
        );
      }

      // Find existing restaurant
      restaurant = await this.restaurantModel.findById(
        toObjectId(restaurantId),
      );
      if (!restaurant) {
        throw new UnauthorizedException('Restaurant not found');
      }

      userRole = UserRole.WAITER;
    }

    // Create user
    const user = await this.usersService.create({
      email,
      passwordHash,
      nickname,
      role: userRole,
      restaurantId: restaurant._id,
      isActive: true,
    });

    // Update restaurant owner if this is the owner
    if (userRole === UserRole.OWNER) {
      restaurant.ownerId = user._id;
      await restaurant.save();
    }

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      restaurant,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    console.log(`[DEBUG] Login attempt for email: ${email}`);

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      console.warn(`[DEBUG] User not found for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      console.warn(`[DEBUG] User ${email} has no password hash set.`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.warn(`[DEBUG] Password mismatch for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const restaurant = await this.restaurantModel.findById(
      toObjectId(user.restaurantId),
    );
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      restaurant,
      ...tokens,
    };
  }

  async googleAuth(googleAuthDto: GoogleAuthDto) {
    const { googleId, email, nickname, restaurantId, restaurantName } =
      googleAuthDto;

    // Check if user exists
    let user = await this.usersService.findByGoogleId(googleId);

    if (!user) {
      // Check by email
      user = await this.usersService.findByEmail(email);
    }

    let restaurant: RestaurantDocument;

    if (!user) {
      // Create new user and restaurant
      if (restaurantId) {
        const foundRestaurant = await this.restaurantModel.findById(
          toObjectId(restaurantId),
        );
        if (!foundRestaurant) {
          throw new UnauthorizedException('Restaurant not found');
        }
        restaurant = foundRestaurant;
      } else if (restaurantName) {
        restaurant = await this.restaurantModel.create({
          name: restaurantName,
          ownerId: null,
        });
      } else {
        throw new UnauthorizedException(
          'Restaurant information required for new users',
        );
      }

      user = await this.usersService.create({
        email,
        googleId,
        nickname,
        role: UserRole.OWNER,
        restaurantId: restaurant._id,
        isActive: true,
      });

      if (!restaurantId) {
        restaurant.ownerId = user._id;
        await restaurant.save();
      }
    } else {
      // Update Google ID if not set
      if (!user.googleId) {
        await this.usersService.update(user._id, { googleId });
      }
      const foundRestaurant = await this.restaurantModel.findById(
        toObjectId(user.restaurantId),
      );
      if (!foundRestaurant) {
        throw new UnauthorizedException('Restaurant not found');
      }
      restaurant = foundRestaurant;
    }

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      restaurant,
      ...tokens,
    };
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(toObjectId(userId));
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId.toString(),
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }

  public sanitizeUser(user: UserDocument) {
    const { passwordHash, ...sanitized } = user.toObject();
    return sanitized;
  }

  async validateUser(userId: string): Promise<UserDocument> {
    const user = await this.usersService.findById(toObjectId(userId));
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}
