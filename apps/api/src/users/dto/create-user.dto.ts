import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ example: 'ABC123', description: 'Matricule (6 characters, uppercase)' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Le matricule doit contenir exactement 6 caractères' })
  matricule: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.DIR })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', required: false })
  @IsString()
  @IsOptional()
  directionId?: string;

  @ApiProperty({ example: '+212612345678', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
