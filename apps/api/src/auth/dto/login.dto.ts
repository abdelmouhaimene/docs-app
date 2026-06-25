import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '217977',
    description: 'Matricule (6 characters)',
    minLength: 6,
    maxLength: 6
  })
  @IsString()
  @IsNotEmpty({ message: 'Le matricule est requis' })
  @Length(6, 6, { message: 'Le matricule doit contenir exactement 6 caractères' })
  matricule: string;

  @ApiProperty({
    example: '21797799',
    description: 'Password'
  })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}
