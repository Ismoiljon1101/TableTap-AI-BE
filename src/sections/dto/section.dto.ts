import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  code?: string | null;
}

export class UpdateSectionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string | null;
}
