import { Controller, Get, Patch, Param, UseInterceptors, UploadedFile, BadRequestException, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @Get()
    @ApiOperation({ summary: 'Get all documents' })
    findAll(@Request() req: any) {
        return this.documentsService.findAll(req.user);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific document' })
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.documentsService.findOne(id, req.user);
    }

    @Patch(':id/file')
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
        limits: { fileSize: 5 * 1024 * 1024 },
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    @Roles(UserRole.SYS)
    @ApiOperation({ summary: 'Update the file of an existing document (SYS only)' })
    updateFile(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        return this.documentsService.updateFile(id, file, req.user);
    }
}
