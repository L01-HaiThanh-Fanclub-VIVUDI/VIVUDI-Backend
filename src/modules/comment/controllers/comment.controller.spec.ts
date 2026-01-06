import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from '../services/comment.service';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from 'src/common/contants';
import { BadRequestException, HttpException, NotFoundException, ForbiddenException } from '@nestjs/common';

const mockCommentService = () => ({
    createComment: jest.fn(),
    getCommentsByPostId: jest.fn(),
    getCommentById: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
});

const mockResponseService = () => ({
    initResponse: jest.fn((success, message, data) => ({ success, message, data })),
});

const mockSequelize = () => ({
    transaction: jest.fn().mockReturnValue({
        commit: jest.fn(),
        rollback: jest.fn(),
    }),
});

describe('CommentController', () => {
    let controller: CommentController;
    let service: any;
    let sequelize: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentController],
            providers: [
                { provide: CommentService, useFactory: mockCommentService },
                { provide: ResponseService, useFactory: mockResponseService },
                { provide: SEQUELIZE, useFactory: mockSequelize },
            ],
        }).compile();

        controller = module.get<CommentController>(CommentController);
        service = module.get(CommentService);
        sequelize = module.get(SEQUELIZE);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createComment', () => {
        it('should call service and return success', async () => {
            const validUuid = '123e4567-e89b-12d3-a456-426614174000' as any;
            const dto = { content: 'test', post_id: validUuid };
            const req = { user: { userId: validUuid } };
            service.createComment.mockResolvedValue({ id: validUuid });

            const result = await controller.createComment(dto as any, req as any);

            expect(service.createComment).toHaveBeenCalled();
            expect(result.success).toBe(true);
        });

        it('should rollback on error', async () => {
            const transaction = sequelize.transaction();
            const validUuid = '123e4567-e89b-12d3-a456-426614174000' as any;
            service.createComment.mockRejectedValue(new BadRequestException('Error'));

            await expect(controller.createComment({ content: 'test', post_id: validUuid } as any, { user: { userId: validUuid } } as any))
                .rejects.toThrow(BadRequestException);
            expect(transaction.rollback).toHaveBeenCalled();
        });
    });

    describe('getCommentsByPostId', () => {
        it('should call service and return success', async () => {
            service.getCommentsByPostId.mockResolvedValue([]);

            const result = await controller.getCommentsByPostId('p1');

            expect(service.getCommentsByPostId).toHaveBeenCalledWith('p1');
            expect(result.success).toBe(true);
        });

        it('should handle HttpException', async () => {
            service.getCommentsByPostId.mockRejectedValue(new HttpException('Error', 500));

            await expect(controller.getCommentsByPostId('p1')).rejects.toThrow(HttpException);
        });
    });

    describe('getCommentById', () => {
        it('should return comment if found', async () => {
            service.getCommentById.mockResolvedValue({ id: 'c1' });

            const result = await controller.getCommentById('c1');

            expect(result.success).toBe(true);
            expect(result.data.id).toBe('c1');
        });

        it('should handle NotFoundException', async () => {
            service.getCommentById.mockRejectedValue(new NotFoundException('Not found'));

            await expect(controller.getCommentById('invalid')).rejects.toThrow(HttpException);
        });
    });

    describe('updateComment', () => {
        it('should update comment successfully', async () => {
            const req = { user: { userId: 'u1' as any } };
            service.updateComment.mockResolvedValue({ id: 'c1' });

            const result = await controller.updateComment('c1', { content: 'updated' } as any, req as any);

            expect(service.updateComment).toHaveBeenCalledWith('c1', { content: 'updated' }, 'u1');
            expect(result.success).toBe(true);
        });

        it('should handle ForbiddenException', async () => {
            const req = { user: { userId: 'u1' as any } };
            service.updateComment.mockRejectedValue(new ForbiddenException('Not authorized'));

            await expect(controller.updateComment('c1', {} as any, req as any)).rejects.toThrow(HttpException);
        });
    });

    describe('deleteComment', () => {
        it('should delete comment successfully', async () => {
            const req = { user: { userId: 'u1' as any } };
            service.deleteComment.mockResolvedValue({ id: 'c1' });

            const result = await controller.deleteComment('c1', req as any);

            expect(service.deleteComment).toHaveBeenCalledWith('c1', 'u1');
            expect(result.success).toBe(true);
        });
    });
});
