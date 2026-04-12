import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../libs/enums';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  email!: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  nickname!: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  restaurantName?: string;

  @IsMongoId()
  @IsOptional()
  restaurantId?: string;

  @IsEnum(UserRole, {
    message: `role must be one of: ${Object.values(UserRole).join(', ')}`,
  })
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  role?: UserRole;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  googleId!: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  nickname!: string;

  @IsMongoId()
  @IsOptional()
  restaurantId?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  restaurantName?: string;
}
