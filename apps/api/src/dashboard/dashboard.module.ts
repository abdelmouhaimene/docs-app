import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Demande, DemandeSchema } from '../demandes/schemas/demande.schema';
import { Document, DocumentSchema } from '../documents/schemas/document.schema';
import { Direction, DirectionSchema } from '../directions/schemas/direction.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Demande.name, schema: DemandeSchema },
            { name: Document.name, schema: DocumentSchema },
            { name: Direction.name, schema: DirectionSchema },
        ]),
    ],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
