import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Req, HttpException, BadRequestException, InternalServerErrorException, Inject } from '@nestjs/common';
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

@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
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
