import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/schemas/user.schema';

export class AuthResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  user: User;

  @ApiProperty({ example: 'Bearer' })
  token_type: string;

  @ApiProperty({ example: 604800, description: 'Token expiration in seconds' })
  expires_in: number;
}
