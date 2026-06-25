import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DirectionsService } from './directions.service';
import { Direction } from './schemas/direction.schema';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { UpdateDirectionDto } from './dto/update-direction.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('directions')
@Controller('directions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DirectionsController {
    constructor(private readonly directionsService: DirectionsService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all active directions' })
    @ApiResponse({ status: 200, description: 'Directions retrieved successfully', type: [Direction] })
    findAll() {
        return this.directionsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get direction by ID' })
    @ApiResponse({ status: 200, description: 'Direction retrieved successfully', type: Direction })
    @ApiResponse({ status: 404, description: 'Direction not found' })
    findOne(@Param('id') id: string) {
        return this.directionsService.findOne(id);
    }

    @Post()
    @Roles(UserRole.SYS)
    @ApiOperation({ summary: 'Create a new direction (SYS only)' })
    @ApiResponse({ status: 201, description: 'Direction created successfully', type: Direction })
    @ApiResponse({ status: 409, description: 'Direction with this name or code already exists' })
    create(@Body() createDirectionDto: CreateDirectionDto, @Request() req: any) {
        return this.directionsService.create(createDirectionDto, req.user.userId);
    }

    @Patch(':id')
    @Roles(UserRole.SYS)
    @ApiOperation({ summary: 'Update a direction (SYS only)' })
    @ApiResponse({ status: 200, description: 'Direction updated successfully', type: Direction })
    @ApiResponse({ status: 404, description: 'Direction not found' })
    @ApiResponse({ status: 409, description: 'Direction with this name or code already exists' })
    update(@Param('id') id: string, @Body() updateDirectionDto: UpdateDirectionDto) {
        return this.directionsService.update(id, updateDirectionDto);
    }

    @Delete(':id')
    @Roles(UserRole.SYS)
    @ApiOperation({ summary: 'Delete a direction (SYS only)' })
    @ApiResponse({ status: 200, description: 'Direction deleted successfully' })
    @ApiResponse({ status: 404, description: 'Direction not found' })
    remove(@Param('id') id: string) {
        return this.directionsService.remove(id);
    }
}
