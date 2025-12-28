import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Req, HttpException, BadRequestException, InternalServerErrorException, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { UpdateCommentDto } from '../dtos/update-comment.dto';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from 'src/common/contants';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import type { UUID } from 'crypto';

interface AuthenticatedRequest extends Request {
  user: { userId: UUID; email: string; };
}

@ApiTags('comment')
@ApiBearerAuth('JWT-auth')
@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      const dtoInstance = plainToInstance(CreateCommentDto, createCommentDto);
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        const errorMessages = errors
          .map(error => (error.constraints ? Object.values(error.constraints) : []))
          .flat();
        throw new BadRequestException(
          this.responseService.initResponse(false, 'Validation failed', errors),
        );
      }

      const comment = await this.commentService.createComment(createCommentDto, req.user.userId, transaction);

      await transaction.commit();
      return this.responseService.initResponse(true, 'Comment created successfully', comment);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof BadRequestException) {
        const validationErrors = (error.getResponse() as any).message;
        throw new BadRequestException(
          this.responseService.initResponse(false, 'Validation failed', (error.getResponse() as any).data),
        );
      } else if (error instanceof HttpException) {
        throw new HttpException(
          this.responseService.initResponse(false, error.message, null),
          error.getStatus(),
        );
      }
      throw new InternalServerErrorException(
        this.responseService.initResponse(false, 'Internal Server Error', null),
      );
    }
  }

  @Get('post/:postId')
  @ApiOperation({ summary: 'Get all comments for a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Comments fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  async getCommentsByPostId(@Param('postId') postId: string) {
    try {
      const comments = await this.commentService.getCommentsByPostId(postId);
      return this.responseService.initResponse(true, 'Comments fetched successfully', comments);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
      }
      throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @UseGuards(JwtAuthGuard)
  async getCommentById(@Param('id') id: string) {
    try {
      const comment = await this.commentService.getCommentById(id);
      return this.responseService.initResponse(true, 'Comment fetched successfully', comment);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
      }
      throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the comment owner' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const comment = await this.commentService.updateComment(id, updateCommentDto, req.user.userId);
      return this.responseService.initResponse(true, 'Comment updated successfully', comment);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
      }
      throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the comment owner' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    try {
      const result = await this.commentService.deleteComment(id, req.user.userId);
      return this.responseService.initResponse(true, 'Comment deleted successfully', result);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
      }
      throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
    }
  }
}
