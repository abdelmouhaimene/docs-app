import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DemandesController } from './demandes.controller';
import { DemandesService } from './demandes.service';
import { Demande, DemandeSchema } from './schemas/demande.schema';
import { DocumentsModule } from '../documents/documents.module';
import { UsersModule } from '../users/users.module';
import { DirectionsModule } from '../directions/directions.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Demande.name, schema: DemandeSchema }]),
        DocumentsModule,
        UsersModule,
        DirectionsModule,
    ],
    controllers: [DemandesController],
    providers: [DemandesService],
    exports: [DemandesService],
})
export class DemandesModule { }
