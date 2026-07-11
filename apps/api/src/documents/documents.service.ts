import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, DocumentDocument } from './schemas/document.schema';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectModel(Document.name) private documentModel: Model<DocumentDocument>
    ) {}

    async createFromIntegration(data: any): Promise<Document> {
        const newDoc = new this.documentModel(data);
        return newDoc.save();
    }

    async removeByDemandeId(demandeId: string): Promise<void> {
        await this.documentModel.deleteMany({ demandeId }).exec();
    }

    async findAll(user: any): Promise<Document[]> {
        return this.documentModel.find().sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string, user: any): Promise<Document> {
        const doc = await this.documentModel.findById(id).exec();
        if (!doc) {
            throw new NotFoundException(`Document with ID ${id} not found`);
        }
        return doc;
    }

    async updateFile(id: string, file: Express.Multer.File, user: any): Promise<Document> {
        if (user.role !== UserRole.SYS) {
            throw new ForbiddenException('Only system administrators can update files');
        }

        const doc = await this.documentModel.findById(id).exec();
        if (!doc) {
            throw new NotFoundException(`Document with ID ${id} not found`);
        }

        doc.fileName = file.filename;
        doc.fileUrl = `/uploads/documents/${file.filename}`;
        doc.fileSize = file.size;
        doc.mimeType = file.mimetype;

        return doc.save();
    }
}
