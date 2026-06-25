import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum UserRole {
  SYS = 'sys',      // Super Admin - Full system access
  DOC = 'doc',      // Document Manager - Can upload docs directly and manage requests
  DIR = 'dir',      // Direction User - Can create document requests
  PUBLIC = 'public' // Public User - Read-only access, no authentication needed
}

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ description: 'User matricule (6 characters)', example: 'ABC123' })
  @Prop({ required: true, unique: true, uppercase: true, length: 6 })
  matricule: string;

  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @ApiProperty({ enum: UserRole, description: 'User role type' })
  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: 'Direction ID - only for DIR role users', required: false })
  @Prop({ type: Types.ObjectId, ref: 'Direction' })
  directionId?: Types.ObjectId;

  @ApiProperty()
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Prop()
  lastLogin?: Date;

  @ApiProperty()
  @Prop()
  phoneNumber?: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Additional indexes (unique indexes already defined in @Prop decorators)
UserSchema.index({ role: 1 });
UserSchema.index({ directionId: 1 });
UserSchema.index({ createdAt: -1 });
