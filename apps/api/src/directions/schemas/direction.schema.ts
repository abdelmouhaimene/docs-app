import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DirectionDocument = Direction & Document;

@Schema({ timestamps: true })
export class Direction {
  @ApiProperty({ description: 'Direction name', example: 'Direction des Ressources Humaines' })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({ description: 'Direction code', example: 'DRH' })
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @ApiProperty({ description: 'Direction description' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Direction head (user ID)' })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  head?: Types.ObjectId;

  @ApiProperty()
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created by user ID' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const DirectionSchema = SchemaFactory.createForClass(Direction);

// Indexes
DirectionSchema.index({ name: 1 }, { unique: true });
DirectionSchema.index({ code: 1 }, { unique: true });
DirectionSchema.index({ isActive: 1 });
DirectionSchema.index({ createdAt: -1 });
