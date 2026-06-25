import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../users/schemas/user.schema';

export interface JwtPayload {
  sub: string;
  matricule: string;
  role: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.matricule, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Matricule ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Votre compte est désactivé');
    }

    // Update last login
    await this.usersService.updateLastLogin(user._id.toString());

    const payload: JwtPayload = {
      sub: user._id.toString(),
      matricule: user.matricule,
      role: user.role,
      email: user.email,
    };

    const access_token = this.jwtService.sign(payload);

    // Remove password from user object
    const { password, ...sanitizedUser } = user.toObject();

    return {
      access_token,
      user: sanitizedUser as User,
      token_type: 'Bearer',
      expires_in: 604800, // 7 days in seconds
    };
  }

  async validateUser(matricule: string, password: string): Promise<any> {
    const user = await this.usersService.findByMatricule(matricule);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  async getUserFromToken(token: string): Promise<User> {
    const payload = await this.verifyToken(token);
    const user = await this.usersService.findOne(payload.sub);
    return user;
  }
}
