import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Demande, DemandeDocument, DemandeCategory } from './schemas/demande.schema';
import { CreateDemandeDto, UpdateDemandeDto } from './dto/create-demande.dto';
import { UserRole } from '../users/schemas/user.schema';
import { DocumentsService } from '../documents/documents.service';
import { UsersService } from '../users/users.service';
import { DocumentCategory } from '../documents/schemas/document.schema';

@Injectable()
export class DemandesService {
    constructor(
        @InjectModel(Demande.name) private demandeModel: Model<DemandeDocument>,
        private documentsService: DocumentsService,
        private usersService: UsersService,
    ) { }

    async create(createDemandeDto: CreateDemandeDto, file: Express.Multer.File): Promise<Demande> {
        const newDemande = new this.demandeModel({
            ...createDemandeDto,
            filePath: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            // Default values are handled by schema (false)
        });
        return newDemande.save();
    }

    async findAll(user: any): Promise<Demande[]> {
        return this.demandeModel.find().sort({ createdAt: -1 }).exec();
    }

    async findByMatricule(matricule: string): Promise<Demande[]> {
        return this.demandeModel.find({ matricule }).sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string, user: any): Promise<Demande> {
        const demande = await this.demandeModel.findById(id).exec();
        if (!demande) {
            throw new NotFoundException(`Demande with ID ${id} not found`);
        }

        // If doc user opens it, mark as consulte
        if (user.role === UserRole.DOC && !demande.consulte) {
            demande.consulte = true;
            await demande.save();
        }

        return demande;
    }

    async update(id: string, updateDemandeDto: UpdateDemandeDto, user: any): Promise<Demande> {
        const demande = await this.demandeModel.findById(id).exec();
        if (!demande) {
            throw new NotFoundException(`Demande with ID ${id} not found`);
        }

        // Ownership check for DIR users
        if (user.role === UserRole.DIR && demande.matricule !== user.matricule) {
            throw new ForbiddenException('You can only update your own requests');
        }

        // Role-based restrictions for accepte and integre
        if (user.role !== UserRole.DOC) {
            if (updateDemandeDto.accepte !== undefined || updateDemandeDto.integre !== undefined) {
                throw new ForbiddenException('Only doc users can change acceptance or integration status');
            }
        }

        const updateData: any = { ...updateDemandeDto };

        // Ensure only setting to true if it was false (as per requirements)
        if (user.role === UserRole.DOC) {
            if (updateDemandeDto.accepte === true && demande.accepte) {
                // already true, skip or allow? Prompt says "change to true if it was false"
                // we'll just let it be true.
            }
            // If they try to set it to false, we might want to prevent it based on "only him can accepte (change to true if it was false)"
            if (updateDemandeDto.accepte === false && demande.accepte === true) {
                delete updateData.accepte; // Prevent setting back to false if the rule is strict
            }
            if (updateDemandeDto.integre === false && user.role !== UserRole.DOC) {
                delete updateData.integre; // Basic safety, but outer check handles it
            }
        }

        const updatedDemande = await this.demandeModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();

        // If newly integrated, create the Document
        if (updateDemandeDto.integre === true && !demande.integre) {
            // 1. Get requester info and their direction
            const requester = await this.usersService.findByMatricule(demande.matricule);
            let directionName = 'N/A';

            let directionId = '';
            if (requester) {
                const populatedRequester = await (requester as any).populate('directionId');
                if (populatedRequester.directionId) {
                    directionName = populatedRequester.directionId.name;
                    directionId = populatedRequester.directionId._id.toString();
                }
            }

            // 2. Create the document
            await this.documentsService.createFromIntegration({
                title: demande.nom,
                category: demande.category as string as DocumentCategory,
                direction: directionName,
                directionId: directionId || undefined,
                matricule: user.matricule, // The DOC user who integrated it
                fileName: demande.filePath.split(/[\\/]/).pop() || 'file',
                fileUrl: `/uploads/documents/${demande.filePath.split(/[\\/]/).pop()}`,
                fileSize: demande.size,
                mimeType: demande.mimetype,
                createdBy: requester?._id.toString() || (user as any).userId,
                demandeId: demande._id.toString(),
            });
        }

        // If disintegrated, delete the Document
        if (updateDemandeDto.integre === false && demande.integre) {
            await this.documentsService.removeByDemandeId(id);
        }

        return updatedDemande;
    }

    async remove(id: string, user: any): Promise<void> {
        const demande = await this.demandeModel.findById(id).exec();
        if (!demande) {
            throw new NotFoundException(`Demande with ID ${id} not found`);
        }

        // only the dir can delete his own requests if (accepte = false and integre = false). the others can't delete.
        if (user.role !== UserRole.DIR) {
            throw new ForbiddenException('Only direction users can delete their own requests');
        }

        if (demande.matricule !== user.matricule) {
            throw new ForbiddenException('You can only delete your own requests');
        }

        if (demande.accepte || demande.integre) {
            throw new ForbiddenException('Cannot delete a request that has been accepted or integrated');
        }

        await this.demandeModel.findByIdAndDelete(id).exec();
    }
}
