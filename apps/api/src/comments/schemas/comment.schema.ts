import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/schemas/user.schema';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @ApiProperty({ description: 'The ID of the request or document being commented on' })
  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId;

  @ApiProperty({ enum: ['demande', 'document'] })
  @Prop({ required: true, enum: ['demande', 'document'] })
  targetType: string;

  @ApiProperty({ description: 'The comment text content' })
  @Prop({ required: true })
  content: string;

  @ApiProperty({ description: 'Matricule of the author' })
  @Prop({ required: true })
  matricule: string;

  @ApiProperty({ enum: UserRole })
  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'Direction name of the author (if role is dir)' })
  @Prop()
  directionName?: string;

  @ApiProperty({ description: 'User ID of the author' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Indexes for fast lookup
CommentSchema.index({ targetId: 1, targetType: 1 });
CommentSchema.index({ createdAt: -1 });
