import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DemandeDocument = Demande & Document;

export enum DemandeCategory {
    DOCUMENT = 'document',
    PROCEDURE = 'procedure',
}

@Schema({ timestamps: true })
export class Demande {
    @ApiProperty({ description: 'Department Name / Title' })
    @Prop({ required: true })
    nom: string;

    @ApiProperty({ enum: DemandeCategory, default: DemandeCategory.DOCUMENT })
    @Prop({ required: true, enum: DemandeCategory, default: DemandeCategory.DOCUMENT })
    category: DemandeCategory;

    @ApiProperty({ description: 'User Matricule (Owner)' })
    @Prop({ required: true })
    matricule: string;

    @ApiProperty({ default: false })
    @Prop({ default: false })
    consulte: boolean;

    @ApiProperty({ default: false })
    @Prop({ default: false })
    accepte: boolean;

    @ApiProperty({ default: false })
    @Prop({ default: false })
    integre: boolean;

    @ApiProperty({ description: 'Path to stored file' })
    @Prop({ required: true })
    filePath: string;

    @ApiProperty({ description: 'MIME type of the file' })
    @Prop({ required: true })
    mimetype: string;

    @ApiProperty({ description: 'Size of the file in bytes' })
    @Prop({ required: true })
    size: number;
}

export const DemandeSchema = SchemaFactory.createForClass(Demande);
