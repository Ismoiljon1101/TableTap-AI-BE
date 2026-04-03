import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsArray,
    ValidateNested,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class PositionDto {
    /** X coordinate — negative = left of origin, positive = right */
    @IsNumber()
    x!: number;

    /** Y coordinate — negative = below origin, positive = above */
    @IsNumber()
    y!: number;
}

export class CreateTableDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    displayName?: string | null;

    @IsString()
    @IsOptional()
    code?: string | null;

    @IsNumber()
    @Max(20)
    @IsOptional()
    capacity?: number;

    @ValidateNested()
    @Type(() => PositionDto)
    @IsOptional()
    position?: PositionDto;

    @IsNumber()
    @IsOptional()
    rotation?: number;

    @IsString()
    @IsOptional()
    section?: string | null;

    /** Flat x coordinate (alternative to position.x) */
    @IsNumber()
    @IsOptional()
    x?: number;

    /** Flat y coordinate (alternative to position.y) */
    @IsNumber()
    @IsOptional()
    y?: number;

    /** Width in grid units (1=small, 2=standard, 3=large) */
    @IsNumber()
    @IsOptional()
    width?: number;

    /** Height in grid units */
    @IsNumber()
    @IsOptional()
    height?: number;

    @IsString()
    @IsOptional()
    shape?: string;
}

export class CreateTablesDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateTableDto)
    tables!: CreateTableDto[];
}

export class UpdateTableDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    displayName?: string | null;

    @IsString()
    @IsOptional()
    code?: string | null;

    @IsNumber()
    @Max(20)
    @IsOptional()
    capacity?: number;

    @ValidateNested()
    @Type(() => PositionDto)
    @IsOptional()
    position?: PositionDto;

    @IsNumber()
    @IsOptional()
    rotation?: number;

    @IsString()
    @IsOptional()
    section?: string | null;

    @IsNumber()
    @IsOptional()
    x?: number;

    @IsNumber()
    @IsOptional()
    y?: number;

    /** Width in grid units (1=small, 2=standard, 3=large) */
    @IsNumber()
    @IsOptional()
    width?: number;

    /** Height in grid units */
    @IsNumber()
    @IsOptional()
    height?: number;

    @IsString()
    @IsOptional()
    shape?: string;
}
