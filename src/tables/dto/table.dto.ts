import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsArray,
    ValidateNested,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class PositionDto {
    @IsNumber()
    @Min(0)
    x: number;

    @IsNumber()
    @Min(0)
    y: number;
}

export class CreateTableDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    displayName?: string;

    @IsNumber()
    @Min(1)
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
    section?: string;

    @IsNumber()
    @IsOptional()
    x?: number;

    @IsNumber()
    @IsOptional()
    y?: number;

    @IsNumber()
    @IsOptional()
    width?: number;

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
    tables: CreateTableDto[];
}

export class UpdateTableDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    displayName?: string;

    @IsNumber()
    @Min(1)
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
    section?: string;

    @IsNumber()
    @IsOptional()
    x?: number;

    @IsNumber()
    @IsOptional()
    y?: number;

    @IsNumber()
    @IsOptional()
    width?: number;

    @IsNumber()
    @IsOptional()
    height?: number;

    @IsString()
    @IsOptional()
    shape?: string;
}
