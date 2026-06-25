import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private usersService: UsersService,
  ) {}

  async create(createCommentDto: CreateCommentDto, user: any): Promise<Comment> {
    const userId = user.userId || user.id || user._id;
    const fullUser = await this.usersService.findOne(userId);
    
    let directionName: string | undefined;
    if (fullUser.role === UserRole.DIR && fullUser.directionId) {
      // The directionId is already populated in findOne if it's there? 
      // Let's check users.service.ts findOne.
      // Line 49 in users.service.ts: async findOne(id: string): Promise<User> { const user = await this.userModel.findById(id).exec(); ... }
      // It's NOT populated in findOne, but we can populate it here or in findOne.
      
      const populatedUser = await (this.usersService as any).userModel.findById(userId).populate('directionId').exec();
      if (populatedUser && populatedUser.directionId) {
        directionName = (populatedUser.directionId as any).name;
      }
    }

    const newComment = new this.commentModel({
      ...createCommentDto,
      targetId: new Types.ObjectId(createCommentDto.targetId),
      matricule: fullUser.matricule,
      role: fullUser.role,
      directionName,
      userId: new Types.ObjectId(userId),
    });

    return newComment.save();
  }

  async findAllForTarget(targetType: string, targetId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ 
        targetType, 
        targetId: new Types.ObjectId(targetId) 
      })
      .sort({ createdAt: 1 }) // Show oldest first for chronological conversation
      .exec();
  }
}
