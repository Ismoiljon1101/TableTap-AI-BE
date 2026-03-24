import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsEnum,
    IsBoolean,
    IsOptional,
    IsArray,
    ValidateNested,
    Min,
    IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';


class ModifierOptionDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsNumber()
    @Min(0)
    price!: number;
}

class ModifierDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ModifierOptionDto)
    options!: ModifierOptionDto[];
}

export class CreateMenuItemDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsNumber()
    @Min(0)
    price!: number;

    @IsMongoId()
    @IsNotEmpty()
    category!: string;

    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;

    @IsBoolean()
    @IsOptional()
    isPopular?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ModifierDto)
    @IsOptional()
    modifiers?: ModifierDto[];
}

export class UpdateMenuItemDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    category?: string;

    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;

    @IsBoolean()
    @IsOptional()
    isPopular?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ModifierDto)
    @IsOptional()
    modifiers?: ModifierDto[];
}
