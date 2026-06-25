import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User, UserRole } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Roles(UserRole.SYS)
  @ApiOperation({ summary: 'Create a new user (SYS only)' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: User })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden - SYS role required' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.SYS, UserRole.DOC)
  @ApiOperation({ summary: 'Get all users (SYS/DOC only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: [User] })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SYS, UserRole.DOC)
  @ApiOperation({ summary: 'Get user by ID (SYS/DOC only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch('profile/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  async updateProfilePassword(
    @Request() req: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.updatePassword(req.user._id, updatePasswordDto.password);
    return { message: 'Mot de passe modifié avec succès' };
  }

  @Patch(':id')
  @Roles(UserRole.SYS)
  @ApiOperation({ summary: 'Update user information (SYS only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - SYS role required' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }


  @Patch(':id/password')
  @Roles(UserRole.SYS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user password (SYS only)' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - SYS role required' })
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    await this.usersService.updatePassword(id, updatePasswordDto.password);
    return { message: 'Mot de passe modifié avec succès' };
  }

  @Delete(':id')
  @Roles(UserRole.SYS)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user (SYS only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - SYS role required' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: 'Utilisateur supprimé avec succès' };
  }
}
