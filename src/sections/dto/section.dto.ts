import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSectionDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class UpdateSectionDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}
