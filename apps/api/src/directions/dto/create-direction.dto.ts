import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDirectionDto {
    @ApiProperty({ example: 'Direction des Ressources Humaines' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'DRH' })
    @IsString()
    @IsNotEmpty()
    code: string;
}
