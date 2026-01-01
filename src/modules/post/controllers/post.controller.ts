import { Controller, Post, Body, UseInterceptors, UploadedFiles, Inject, HttpException, BadRequestException, InternalServerErrorException, UseGuards, Req, Get, Param, Query } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
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
	) { }

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
					example: '{"content":"My post content","location_id":"123e4567-e89b-12d3-a456-426614174000","visibility":"public","rating":5}',
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
					'image/jpg',
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
				console.log('Validation errors:', errorMessages); // Log detailed errors
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
			console.error('Create post error:', error); // Log full error
			if (error instanceof BadRequestException) {
				const response: any = error.getResponse();
				// If response has data (our validation errors), use it. Otherwise use message or default.
				const validationErrors = response.data || response.message || response;
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
	
	@Get('/getByPositionId')
	@ApiOperation({ summary: 'Get post by positionId' })
	@ApiQuery({ name: 'positionId', description: 'Position ID' })
	@ApiQuery({ name: 'page', description: 'Page number' })
	@ApiQuery({ name: 'limit', description: 'Number of items per page' })
	@ApiResponse({
		status: 200,
		description: 'Post fetched successfully',
		schema: {
			example: {
				success: true,
				message: 'Post fetched successfully',
				data: {
					data: [
						{
							"id": "f75e0166-cca4-403f-8578-08b197bc97bd",
							"content": "gyvyyv",
							"author_id": "36e3a933-6be7-4f7c-bce4-221de3f2206b",
							"visibility": "public",
							"location_id": "48ebb300-4070-43f6-952a-7f740cf35505",
							"rating": null,
							"createdAt": "2025-12-29T03:44:38.000Z",
							"updatedAt": "2025-12-29T03:44:38.000Z",
							"medias": [
								{
									"id": "643472a8-33c9-42c9-a387-cfe426a74de8",
									"post_id": "f75e0166-cca4-403f-8578-08b197bc97bd",
									"location_id": "48ebb300-4070-43f6-952a-7f740cf35505",
									"owner_type": "post",
									"type": "image",
									"url": "1SHNwQgEaZs8SsVrTc2-sUV5kUvYU5eCs",
									"order": 0,
									"thumbnail_url": null,
									"folder_path": "1GpWyJfOcioC9MfvqA0jbFEFkRcJ35C0s",
									"createdAt": "2025-12-29T03:44:42.000Z",
									"updatedAt": "2025-12-29T03:44:42.000Z"
								}
							],
							"location": {
								"id": "48ebb300-4070-43f6-952a-7f740cf35505",
								"name": "KTX KHU A",
								"address": "Dĩ An, Bình Dương, Việt Nam",
								"description": "Created by user on 29/12/2025",
								"point": {
									"type": "Point",
									"coordinates": [
										106.8064133,
										10.8773
									]
								},
								"type": "coffee",
								"createdAt": "2025-12-29T03:44:21.000Z",
								"updatedAt": "2025-12-29T03:44:21.000Z"
							}
						}
					],
					pagination: {
						"page": 1,
						"limit": 10,
						"total": 39,
						"totalPage": 4
					}
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
	// @UseGuards(JwtAuthGuard)
	async getPostByPositionId(
		@Query('positionId') positionId: string,
		@Query('page') page: string, 
		@Query('limit') limit: string) {
		
			try {
				const post = await this.postService.getPostByPositionId(positionId, parseInt(page), parseInt(limit));
				return this.responseService.initResponse(true, 'Post fetched successfully', post);
			} catch (error) {
				if (error instanceof HttpException) {
					throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
				}
				throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
			}
	}

	@Get()
	@ApiOperation({ summary: 'Get all post by ID' })
	@ApiQuery({ name: 'page', description: 'Page number' })
	@ApiQuery({ name: 'limit', description: 'Number of items per page' })
	@ApiResponse({
		status: 200,
		description: 'Post fetched successfully',
		schema: {
			example: {
				success: true,
				message: 'Post fetched successfully',
				data: {
					data: [
						{
							"id": "f75e0166-cca4-403f-8578-08b197bc97bd",
							"content": "gyvyyv",
							"author_id": "36e3a933-6be7-4f7c-bce4-221de3f2206b",
							"visibility": "public",
							"location_id": "48ebb300-4070-43f6-952a-7f740cf35505",
							"rating": null,
							"createdAt": "2025-12-29T03:44:38.000Z",
							"updatedAt": "2025-12-29T03:44:38.000Z",
							"medias": [
								{
									"id": "643472a8-33c9-42c9-a387-cfe426a74de8",
									"post_id": "f75e0166-cca4-403f-8578-08b197bc97bd",
									"location_id": "48ebb300-4070-43f6-952a-7f740cf35505",
									"owner_type": "post",
									"type": "image",
									"url": "1SHNwQgEaZs8SsVrTc2-sUV5kUvYU5eCs",
									"order": 0,
									"thumbnail_url": null,
									"folder_path": "1GpWyJfOcioC9MfvqA0jbFEFkRcJ35C0s",
									"createdAt": "2025-12-29T03:44:42.000Z",
									"updatedAt": "2025-12-29T03:44:42.000Z"
								}
							],
							"location": {
								"id": "48ebb300-4070-43f6-952a-7f740cf35505",
								"name": "KTX KHU A",
								"address": "Dĩ An, Bình Dương, Việt Nam",
								"description": "Created by user on 29/12/2025",
								"point": {
									"type": "Point",
									"coordinates": [
										106.8064133,
										10.8773
									]
								},
								"type": "coffee",
								"createdAt": "2025-12-29T03:44:21.000Z",
								"updatedAt": "2025-12-29T03:44:21.000Z"
							}
						}
					],
					pagination: {
						"page": 1,
						"limit": 10,
						"total": 39,
						"totalPage": 4
					}
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
	// @ApiResponse({
	// 	status: 404,
	// 	description: 'Post not found',
	// 	schema: {
	// 		example: {
	// 			success: false,
	// 			message: 'Post not found',
	// 			data: null
	// 		}
	// 	}
	// })
	@UseGuards(JwtAuthGuard)
	async getPost(@Query('page') page: string, @Query('limit') limit: string) {
		try {
			const post = await this.postService.getAllPost(Number(page), Number(limit));
			return this.responseService.initResponse(true, 'Post fetched successfully', post);
		} catch (error) {
			if (error instanceof HttpException) {
				throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
			}
			throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
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
	async getAllPost(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
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


