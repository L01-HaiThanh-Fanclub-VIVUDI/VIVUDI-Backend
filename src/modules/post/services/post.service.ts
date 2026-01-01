import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostEntity } from '../entities/post.entity';
import { MediaEntity } from '../entities/media.entity';
import { GoogleDriveService } from '../../common/google-drive/google-drive.service';
import { MediaType, OwnerMediaType } from '../../../common/contants';
import { CreatePostDto } from '../dtos/create-post.dto';
import { Transaction } from 'sequelize';
import { UserService } from '../../user/services/user.service';
import { PositionService } from '../../position/services/position.service';
import { Sequelize } from 'sequelize-typescript';
import { Inject } from '@nestjs/common';
import { SEQUELIZE } from 'src/common/contants';
import { LoggerService } from '../../common/logger/logger.service';
import { PositionEntity } from 'src/modules/position/entities/position.entity';

@Injectable()
export class PostService {
	constructor(
		@InjectModel(PostEntity) private readonly postRepository: typeof PostEntity,
		@InjectModel(MediaEntity) private readonly mediaRepository: typeof MediaEntity,
		private readonly googleDriveService: GoogleDriveService,
		private readonly userService: UserService,
		private readonly positionService: PositionService,
		@Inject(SEQUELIZE) private readonly sequelize: Sequelize,
		private readonly logger: LoggerService,
	) { }

	async createPost(createPostDto: CreatePostDto, files: Array<Express.Multer.File>, transaction: Transaction) {
		try {
			const isUserExist = await this.userService.checkUserExist(createPostDto.author_id);
			if (!isUserExist) {
				throw new NotFoundException('User does not exist.');
			}
			const isPositionExist = await this.positionService.checkPositionExist(createPostDto.location_id);
			if (!isPositionExist) {
				throw new NotFoundException('Position does not exist.');
			}
			const post = await this.postRepository.create({
				content: createPostDto.content,
				author_id: createPostDto.author_id,
				visibility: createPostDto.visibility,
				location_id: createPostDto.location_id,
				rating: createPostDto.rating,
			} as any, { transaction });

			// Asynchronously process media uploads
			this._processMediaUploads(post.id, createPostDto.location_id, files).catch(error => {
				console.error(`Error processing media for post ${post.id}:`, error);
				// TODO: Implement a more robust error handling mechanism for background tasks, e.g., dead-letter queue, retry logic.
			});

			const createdPost = await this.postRepository.findByPk(post.id, {
				include: [{ model: MediaEntity, as: 'medias' }],
				transaction,
			});

			return createdPost;
		} catch (error) {
			console.error('Error in createPost service:', error);
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new InternalServerErrorException('Failed to create post and upload media.');
		}
	}

	async getPostById(postId: string) {
		const post = await this.postRepository.findByPk(postId, {
			include: [
				{ model: MediaEntity, as: 'medias' },
				{ model: PositionEntity, as: 'location' },
			],
		});

		if (!post) {
			throw new NotFoundException(`Post with ID ${postId} not found.`);
		}

		return post;
	}

	async getPostByPositionId(positionId: string, page: number, limit: number) {
		const offset = (page - 1) * limit;

		const { rows, count } = await this.postRepository.findAndCountAll({
			offset,
			limit,
			where: { location_id: positionId },
			include: [
				{ model: MediaEntity, as: 'medias' },
				{ model: PositionEntity, as: 'location' },
			],

			order: [['createdAt', 'DESC']],
		});

		return {
				data: rows.map(r => r.get({ plain: true })),
				pagination: {
					page,
					limit,
					total: count,
					totalPage: Math.ceil(count / limit),
				},
			};
	}

	private async _processMediaUploads(
		postId: string,
		locationId: string,
		files: Array<Express.Multer.File>,
	) {
		const transaction = await this.sequelize.transaction();
		try {
			const folderName = postId;
			const folder = await this.googleDriveService.createFolder(folderName);

			const uploadedFiles = await this.googleDriveService['uploadMultipleFiles'](files, folder.id);

			for (let i = 0; i < uploadedFiles.length; i++) {
				const uploadedFile = uploadedFiles[i];
				const file = files[i];

				let mediaType: MediaType;
				if (file.mimetype.startsWith('image')) {
					mediaType = MediaType.IMAGE;
				} else if (file.mimetype.startsWith('video')) {
					mediaType = MediaType.VIDEO;
				} else {
					throw new InternalServerErrorException('Unsupported media type.');
				}

				await this.mediaRepository.create({
					post_id: postId,
					location_id: locationId,
					url: uploadedFile.id,
					folder_path: folder.id,
					owner_type: OwnerMediaType.POST,
					type: mediaType,
					order: i,
				} as any, { transaction });
			}
			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			console.error(`Error in _processMediaUploads for post ${postId}:`, error);
			// Log the error but do not re-throw to allow post creation to succeed even if media upload fails
			this.logger.error(`Media upload failed for post ${postId}: ${error.message}`, error.stack);
			// TODO: Consider more robust error handling, e.g., notifying admin, queueing for retry.
		}
	}

	public async getAllPost(page: number, limit: number) {
		try {
			console.log('Fetching posts with pagination:', { page, limit });
			const offset = (page - 1) * limit;


			const { rows, count } = await this.postRepository.findAndCountAll({
				limit,
				offset,
				include: [
					{ model: MediaEntity, as: 'medias' },
					{ model: PositionEntity, as: 'location' },
				],

				order: [['createdAt', 'DESC']],
			})

			return {
				data: rows.map(r => r.get({ plain: true })),
				pagination: {
					page,
					limit,
					total: count,
					totalPage: Math.ceil(count / limit),
				},
			};

		}
		catch (error) {
			console.error('Error fetching posts:', error);
		}
	}
}
