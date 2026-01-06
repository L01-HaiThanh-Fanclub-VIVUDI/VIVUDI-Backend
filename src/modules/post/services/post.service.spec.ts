import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getModelToken } from '@nestjs/sequelize';
import { PostEntity } from '../entities/post.entity';
import { MediaEntity } from '../entities/media.entity';
import { GoogleDriveService } from '../../common/google-drive/google-drive.service';
import { UserService } from '../../user/services/user.service';
import { PositionService } from '../../position/services/position.service';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../common/contants';
import { LoggerService } from '../../common/logger/logger.service';
import { NotFoundException } from '@nestjs/common';

const mockPostRepository = () => ({
    create: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
});

const mockMediaRepository = () => ({
    create: jest.fn(),
});

const mockGoogleDriveService = () => ({
    createFolder: jest.fn(),
    uploadMultipleFiles: jest.fn(),
});

const mockUserService = () => ({
    checkUserExist: jest.fn(),
});

const mockPositionService = () => ({
    checkPositionExist: jest.fn(),
});

const mockSequelize = () => ({
    transaction: jest.fn().mockReturnValue({
        commit: jest.fn(),
        rollback: jest.fn(),
    }),
});

const mockLogger = () => ({
    error: jest.fn(),
});

describe('PostService', () => {
    let service: PostService;
    let postRepository: any;
    let userService: any;
    let positionService: any;
    let googleDriveService: any;
    let mediaRepository: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostService,
                { provide: getModelToken(PostEntity), useFactory: mockPostRepository },
                { provide: getModelToken(MediaEntity), useFactory: mockMediaRepository },
                { provide: GoogleDriveService, useFactory: mockGoogleDriveService },
                { provide: UserService, useFactory: mockUserService },
                { provide: PositionService, useFactory: mockPositionService },
                { provide: SEQUELIZE, useFactory: mockSequelize },
                { provide: LoggerService, useFactory: mockLogger },
            ],
        }).compile();

        service = module.get<PostService>(PostService);
        postRepository = module.get(getModelToken(PostEntity));
        userService = module.get(UserService);
        positionService = module.get(PositionService);
        googleDriveService = module.get(GoogleDriveService);
        mediaRepository = module.get(getModelToken(MediaEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createPost', () => {
        const createPostDto = {
            content: 'test content',
            author_id: 'user-id',
            visibility: 'PUBLIC' as any,
            location_id: 'location-id',
            rating: 5,
        };

        it('should throw NotFoundException if user does not exist', async () => {
            userService.checkUserExist.mockResolvedValue(false);
            await expect(service.createPost(createPostDto as any, [], {} as any)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should throw NotFoundException if position does not exist', async () => {
            userService.checkUserExist.mockResolvedValue(true);
            positionService.checkPositionExist.mockResolvedValue(false);
            await expect(service.createPost(createPostDto as any, [], {} as any)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should successfully create a post', async () => {
            userService.checkUserExist.mockResolvedValue(true);
            positionService.checkPositionExist.mockResolvedValue(true);
            postRepository.create.mockResolvedValue({ id: 'post-id' });
            postRepository.findByPk.mockResolvedValue({ id: 'post-id', content: 'test content' });

            const result = await service.createPost(createPostDto as any, [], {} as any);

            expect(result).toBeDefined();
            expect(result.id).toBe('post-id');
            expect(postRepository.create).toHaveBeenCalled();
        });
    });

    describe('getPostById', () => {
        it('should return a post if found', async () => {
            const mockPost = { id: 'post-id' };
            postRepository.findByPk.mockResolvedValue(mockPost);

            const result = await service.getPostById('post-id');

            expect(result).toEqual(mockPost);
        });

        it('should throw NotFoundException if post not found', async () => {
            postRepository.findByPk.mockResolvedValue(null);

            await expect(service.getPostById('invalid-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getPostByPositionId', () => {
        it('should return paginated posts', async () => {
            postRepository.findAndCountAll.mockResolvedValue({
                rows: [{ get: () => ({ id: '1' }) }],
                count: 1,
            });

            const result = await service.getPostByPositionId('pos-id', 1, 10);

            expect(result.data.length).toBe(1);
            expect(result.pagination.total).toBe(1);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
        });
    });

    describe('getAllPost', () => {
        it('should return paginated posts for all', async () => {
            postRepository.findAndCountAll.mockResolvedValue({
                rows: [{ get: () => ({ id: '1' }) }],
                count: 1,
            });

            const result = await service.getAllPost(1, 10);

            expect(result.data.length).toBe(1);
            expect(result.pagination.page).toBe(1);
        });
    });

    describe('_processMediaUploads', () => {
        it('should process media uploads successfully', async () => {
            const mockFile = {
                mimetype: 'image/jpeg',
                originalname: 'test.jpg',
                buffer: Buffer.from('test'),
            } as any;

            googleDriveService.createFolder.mockResolvedValue({ id: 'folder-id' });
            googleDriveService['uploadMultipleFiles'] = jest.fn().mockResolvedValue([{ id: 'file-id' }]);

            await service._processMediaUploads('post-id', 'location-id', [mockFile]);

            expect(googleDriveService.createFolder).toHaveBeenCalledWith('post-id');
            expect(mediaRepository.create).toHaveBeenCalled();
        });

        it('should handle unsupported media type', async () => {
            const mockFile = {
                mimetype: 'application/pdf',
                originalname: 'test.pdf',
            } as any;

            googleDriveService.createFolder.mockResolvedValue({ id: 'folder-id' });
            googleDriveService['uploadMultipleFiles'] = jest.fn().mockResolvedValue([{ id: 'file-id' }]);

            await service._processMediaUploads('post-id', 'location-id', [mockFile]);

            // Should not throw, just log error
            expect(googleDriveService.createFolder).toHaveBeenCalled();
        });
    });
});
