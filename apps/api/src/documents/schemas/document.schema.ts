import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum DocumentCategory {
    DOCUMENT = 'document',
    PROCEDURE = 'procedure',
}

export enum DocumentType {
    OFFICIAL = 'official',
    DRAFT = 'draft',
}

export enum DocumentStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export type DocumentDocument = HydratedDocument<Document>;

@Schema({ timestamps: true })
export class Document {
    @Prop({ required: true })
    title: string;

    @Prop({ type: String, enum: DocumentCategory, required: true })
    category: DocumentCategory;

    @Prop({ type: String, enum: DocumentType, default: DocumentType.OFFICIAL })
    type: DocumentType;

    @Prop({ required: true })
    direction: string;

    @Prop({ type: Types.ObjectId, ref: 'Direction' })
    directionId: Types.ObjectId;

    @Prop({ required: true })
    matricule: string;

    @Prop({ required: true })
    fileName: string;

    @Prop({ required: true })
    fileUrl: string;

    @Prop({ required: true })
    fileSize: number;

    @Prop({ required: true })
    mimeType: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Demande' })
    demandeId: Types.ObjectId;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
