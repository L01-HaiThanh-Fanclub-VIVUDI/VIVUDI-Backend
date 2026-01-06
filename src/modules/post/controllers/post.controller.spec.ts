import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from '../services/post.service';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from 'src/common/contants';
import { BadRequestException, HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from '../dtos/create-post.dto';

const mockPostService = () => ({
    createPost: jest.fn(),
    getPostById: jest.fn(),
    getPostByPositionId: jest.fn(),
    getAllPost: jest.fn(),
});

const mockResponseService = () => ({
    initResponse: jest.fn((success, message, data) => ({ success, message, data })),
});

const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
};

const mockSequelize = () => ({
    transaction: jest.fn().mockResolvedValue(mockTransaction),
});

describe('PostController', () => {
    let controller: PostController;
    let service: any;
    let sequelize: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostController],
            providers: [
                { provide: PostService, useFactory: mockPostService },
                { provide: ResponseService, useFactory: mockResponseService },
                { provide: SEQUELIZE, useFactory: mockSequelize },
            ],
        }).compile();

        controller = module.get<PostController>(PostController);
        service = module.get(PostService);
        sequelize = module.get(SEQUELIZE);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createPost', () => {
        const mockFiles = [{ originalname: 'test.jpg' }] as any[];
        const mockUser = { userId: 'user-id', email: 'test@example.com' };
        const mockReq = { user: mockUser } as any;

        it('should create a post successfully', async () => {
            const validData = JSON.stringify({
                content: 'test content',
                location_id: '123e4567-e89b-12d3-a456-426614174000',
                visibility: 'PUBLIC'
            });
            const body = { data: validData };
            const createdPost = { id: 'post-id', content: 'test content' };

            service.createPost.mockResolvedValue(createdPost);

            const result = await controller.createPost(body as any, mockReq, mockFiles);

            expect(sequelize.transaction).toHaveBeenCalled();
            expect(service.createPost).toHaveBeenCalledWith(
                expect.any(CreatePostDto),
                mockFiles,
                mockTransaction
            );
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(result.success).toBe(true);
            expect(result.data).toEqual(createdPost);
        });

        it('should throw BadRequestException if validation fails', async () => {
            // Invalid data (empty content)
            const invalidData = JSON.stringify({
                content: '',
                location_id: 'invalid-uuid'
            });
            const body = { data: invalidData };

            await expect(controller.createPost(body as any, mockReq, mockFiles))
                .rejects.toThrow(BadRequestException);

            expect(mockTransaction.rollback).toHaveBeenCalled();
            expect(service.createPost).not.toHaveBeenCalled();
        });

        it('should handle BadRequestException from service', async () => {
            const validData = JSON.stringify({
                content: 'test',
                location_id: '123e4567-e89b-12d3-a456-426614174000',
                visibility: 'PUBLIC'
            });
            const body = { data: validData };

            const badRequestError = new BadRequestException('Bad Request');
            service.createPost.mockRejectedValue(badRequestError);

            await expect(controller.createPost(body as any, mockReq, mockFiles))
                .rejects.toThrow(BadRequestException);

            expect(mockTransaction.rollback).toHaveBeenCalled();
        });

        it('should handle InternalServerErrorException', async () => {
            const validData = JSON.stringify({
                content: 'test',
                location_id: '123e4567-e89b-12d3-a456-426614174000',
                visibility: 'PUBLIC'
            });
            const body = { data: validData };

            service.createPost.mockRejectedValue(new Error('Unexpected error'));

            await expect(controller.createPost(body as any, mockReq, mockFiles))
                .rejects.toThrow(InternalServerErrorException);

            expect(mockTransaction.rollback).toHaveBeenCalled();
        });

        it('should handle HttpException from service', async () => {
            const validData = JSON.stringify({
                content: 'test',
                location_id: '123e4567-e89b-12d3-a456-426614174000',
                visibility: 'PUBLIC'
            });
            const body = { data: validData };

            service.createPost.mockRejectedValue(new NotFoundException('Not found'));

            await expect(controller.createPost(body as any, mockReq, mockFiles))
                .rejects.toThrow(HttpException);

            expect(mockTransaction.rollback).toHaveBeenCalled();
        });
    });

    describe('getPostByPositionId', () => {
        it('should call service and return success', async () => {
            const mockResult = { data: [], pagination: {} };
            service.getPostByPositionId.mockResolvedValue(mockResult);

            const result = await controller.getPostByPositionId('pos-id', '1', '10');

            expect(service.getPostByPositionId).toHaveBeenCalledWith('pos-id', 1, 10);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockResult);
        });

        it('should handle HttpException', async () => {
            service.getPostByPositionId.mockRejectedValue(new HttpException('Error', 500));

            await expect(controller.getPostByPositionId('pos-id', '1', '10')).rejects.toThrow(HttpException);
        });

        it('should handle InternalServerError', async () => {
            service.getPostByPositionId.mockRejectedValue(new Error('Unknown'));
            await expect(controller.getPostByPositionId('pos-id', '1', '10')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('getPost (mapped to getAllPost service)', () => {
        it('should call service and return success', async () => {
            const mockResult = { data: [], pagination: {} };
            service.getAllPost.mockResolvedValue(mockResult);

            const result = await controller.getPost('1', '10');

            expect(service.getAllPost).toHaveBeenCalledWith(1, 10);
            expect(result.success).toBe(true);
        });

        it('should handle error', async () => {
            service.getAllPost.mockRejectedValue(new Error('Unknown'));
            await expect(controller.getPost('1', '10')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('getAllPost (mapped to getPostById service)', () => {
        it('should call service and return success', async () => {
            const mockPost = { id: 'post-id' };
            service.getPostById.mockResolvedValue(mockPost);

            const result = await controller.getAllPost('post-id', { user: { userId: 'u1' } } as any);

            expect(service.getPostById).toHaveBeenCalledWith('post-id');
            expect(result.data).toEqual(mockPost);
        });

        it('should handle NotFoundException via HttpException', async () => {
            service.getPostById.mockRejectedValue(new NotFoundException('Post not found'));

            await expect(controller.getAllPost('invalid-id', { user: { userId: 'u1' } } as any)).rejects.toThrow(HttpException);
        });

        it('should handle InternalServerError', async () => {
            service.getPostById.mockRejectedValue(new Error('Unknown'));
            await expect(controller.getAllPost('id', {} as any)).rejects.toThrow(InternalServerErrorException);
        });
    });
});
