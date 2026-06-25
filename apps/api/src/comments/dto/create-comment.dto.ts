import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsMongoId } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ enum: ['demande', 'document'] })
  @IsEnum(['demande', 'document'])
  @IsNotEmpty()
  targetType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;
}
