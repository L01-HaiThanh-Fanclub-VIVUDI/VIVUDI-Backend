import { Controller, Post, Body, UseInterceptors, UploadedFiles, Inject, HttpException, BadRequestException, InternalServerErrorException, UseGuards, Req, Get, Param } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { PostService } from '../services/post.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { CreatePostRequestDto } from '../dtos/create-post-request.dto';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from 'src/common/contants';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import type { UUID } from 'crypto';
import { CustomParseFilePipe } from 'src/common/pipes/custom-parse-file.pipe';

interface AuthenticatedRequest extends Request {
    user: { userId: UUID; email: string; };
}

@ApiTags('post')
@ApiBearerAuth('JWT-auth')
@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'string',
          description: 'JSON string containing post data (content, location_id, visibility)',
          example: '{"content":"My post content","location_id":"123e4567-e89b-12d3-a456-426614174000","visibility":"PUBLIC"}',
        },
        media: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Media files (images/videos) - max 20MB each',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Post created successfully',
    schema: {
      example: {
        success: true,
        message: 'Post created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          content: 'My post content',
          author_id: '123e4567-e89b-12d3-a456-426614174001',
          visibility: 'PUBLIC',
          location_id: '123e4567-e89b-12d3-a456-426614174002',
          rating: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          medias: [
            {
              id: '123e4567-e89b-12d3-a456-426614174003',
              url: 'https://drive.google.com/file/d/example123/view',
              type: 'IMAGE',
              order: 1
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        data: ['content should not be empty', 'location_id must be a UUID']
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        data: null
      }
    }
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('media'))
  async createPost(
    @Body() body: CreatePostRequestDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFiles(
      new CustomParseFilePipe({
        maxSize: 20 * 1024 * 1024, // 20MB
        fileTypes: [
          // images
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          // videos
          'video/mp4',
          'video/quicktime',
          'video/x-msvideo',
          'video/x-matroska',
        ],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
  ) {
    const transaction = await this.sequelize.transaction();
    try {
      const createPostDto = plainToInstance(CreatePostDto, JSON.parse(body.data));
      const errors = await validate(createPostDto);

      if (errors.length > 0) {
        const errorMessages = errors
          .map(error => (error.constraints ? Object.values(error.constraints) : []))
          .flat();
        throw new BadRequestException(
          this.responseService.initResponse(false, 'Validation failed', errorMessages),
        );
      }

      createPostDto.author_id = req.user.userId;

      const post = await this.postService.createPost(createPostDto, files, transaction);

      await transaction.commit();
      return this.responseService.initResponse(true, 'Post created successfully', post);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof BadRequestException) {
        const validationErrors = (error.getResponse() as any).message;
        throw new BadRequestException(
          this.responseService.initResponse(false, 'Validation failed', validationErrors),
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

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Post fetched successfully',
    schema: {
      example: {
        success: true,
        message: 'Post fetched successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          content: 'My post content',
          author_id: '123e4567-e89b-12d3-a456-426614174001',
          author: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            display_name: 'John Doe',
            avt_url: 'https://example.com/avatar.jpg'
          },
          visibility: 'PUBLIC',
          location_id: '123e4567-e89b-12d3-a456-426614174002',
          location: {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Ho Chi Minh City',
            address: '123 Main Street',
            type: 'CITY'
          },
          rating: 4.5,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          medias: [
            {
              id: '123e4567-e89b-12d3-a456-426614174003',
              url: 'https://drive.google.com/file/d/example123/view',
              type: 'IMAGE',
              order: 1,
              thumbnail_url: 'https://drive.google.com/file/d/example123/thumbnail'
            }
          ],
          comments: []
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        data: null
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post not found',
    schema: {
      example: {
        success: false,
        message: 'Post not found',
        data: null
      }
    }
  })
  @UseGuards(JwtAuthGuard)
  async getPost(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    try {
      const post = await this.postService.getPostById(id);
      return this.responseService.initResponse(true, 'Post fetched successfully', post);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
      }
      throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
    }
  }
}
