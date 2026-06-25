import { PartialType } from '@nestjs/swagger';
import { CreateDirectionDto } from './create-direction.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDirectionDto extends PartialType(CreateDirectionDto) {
    @ApiProperty({ example: true, description: 'Direction active status', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
