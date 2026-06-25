import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Demande, DemandeDocument } from '../demandes/schemas/demande.schema';
import { Document as AppDocument, DocumentDocument, DocumentType } from '../documents/schemas/document.schema';
import { Direction, DirectionDocument } from '../directions/schemas/direction.schema';

@Injectable()
export class DashboardService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Demande.name) private demandeModel: Model<DemandeDocument>,
        @InjectModel(AppDocument.name) private documentModel: Model<DocumentDocument>,
        @InjectModel(Direction.name) private directionModel: Model<DirectionDocument>,
    ) { }

    async getStats() {
        const [
            totalDocuments,
            totalUsers,
            totalDirections,
            pendingRequests,
            approvedDocuments,
        ] = await Promise.all([
            this.documentModel.countDocuments({ type: DocumentType.OFFICIAL }),
            this.userModel.countDocuments(),
            this.directionModel.countDocuments({ isActive: true }),
            this.demandeModel.countDocuments({ accepte: false }),
            this.demandeModel.countDocuments({ accepte: true }),
        ]);

        return {
            totalDocuments,
            totalUsers,
            totalDirections,
            pendingRequests,
            approvedDocuments,
            rejectedRequests: 0,
        };
    }
}
