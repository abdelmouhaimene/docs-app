import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('comments')
@ApiBearerAuth()
@Controller('comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Roles(UserRole.SYS, UserRole.DOC, UserRole.DIR)
  @ApiOperation({ summary: 'Add a comment to a request or document' })
  create(@Body() createCommentDto: CreateCommentDto, @Request() req: any) {
    return this.commentsService.create(createCommentDto, req.user);
  }

  @Get(':targetType/:targetId')
  @Roles(UserRole.SYS, UserRole.DOC, UserRole.DIR)
  @ApiOperation({ summary: 'Get all comments for a specific target' })
  findAllForTarget(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.commentsService.findAllForTarget(targetType, targetId);
  }
}
