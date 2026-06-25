import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { DemandesService } from './demandes.service';
import { CreateDemandeDto, UpdateDemandeDto } from './dto/create-demande.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('demandes')
@Controller('demandes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DemandesController {
    constructor(private readonly demandesService: DemandesService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = join(process.env.UPLOAD_PATH || join(process.cwd(), 'uploads'), 'documents');
                mkdirSync(uploadPath, { recursive: true });
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const name = file.originalname.split('.').slice(0, -1).join('.');
                const fileExtName = extname(file.originalname);
                cb(null, `${name}-${Date.now()}${fileExtName}`);
            },
        }),
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB limit
        },
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                nom: { type: 'string' },
                matricule: { type: 'string' },
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({ summary: 'Create a new request with file upload' })
    create(
        @Body() createDemandeDto: CreateDemandeDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        return this.demandesService.create(createDemandeDto, file);
    }

    @Get()
    @ApiOperation({ summary: 'Get all requests' })
    findAll(@Request() req: any) {
        return this.demandesService.findAll(req.user);
    }

    @Get('user/:matricule')
    @ApiOperation({ summary: 'Get requests by matricule' })
    findByMatricule(@Param('matricule') matricule: string) {
        return this.demandesService.findByMatricule(matricule);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific request' })
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.demandesService.findOne(id, req.user);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update request status (consulte, accepte, integre)' })
    update(
        @Param('id') id: string,
        @Body() updateDemandeDto: UpdateDemandeDto,
        @Request() req: any
    ) {
        return this.demandesService.update(id, updateDemandeDto, req.user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a request' })
    remove(@Param('id') id: string, @Request() req: any) {
        return this.demandesService.remove(id, req.user);
    }
}
