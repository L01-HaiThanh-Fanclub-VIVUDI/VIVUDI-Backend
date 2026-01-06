import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { getModelToken } from '@nestjs/sequelize';
import { CommentEntity } from '../entities/comment.entity';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../common/contants';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockCommentRepository = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
});

const mockSequelize = () => ({
    transaction: jest.fn(),
});

describe('CommentService', () => {
    let service: CommentService;
    let repository: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentService,
                { provide: getModelToken(CommentEntity), useFactory: mockCommentRepository },
                { provide: SEQUELIZE, useFactory: mockSequelize },
            ],
        }).compile();

        service = module.get<CommentService>(CommentService);
        repository = module.get(getModelToken(CommentEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createComment', () => {
        it('should successfully create a comment', async () => {
            const dto = { content: 'test', post_id: 'post-id' };
            const userId = 'user-id' as any;
            repository.create.mockResolvedValue({ id: 'comment-id', ...dto, user_id: userId });

            const result = await service.createComment(dto as any, userId);

            expect(result.id).toBe('comment-id');
            expect(repository.create).toHaveBeenCalled();
        });
    });

    describe('getCommentsByPostId', () => {
        it('should return a tree including orphaned comments', async () => {
            const mockComments = [
                { id: '1', parent_id: null, get: () => ({ id: '1', parent_id: null }) },
                { id: '2', parent_id: '1', get: () => ({ id: '2', parent_id: '1' }) },
                { id: '3', parent_id: '99', get: () => ({ id: '3', parent_id: '99' }) }, // Orphaned
            ];
            repository.findAll.mockResolvedValue(mockComments);

            const result = await service.getCommentsByPostId('post-id');

            expect(result.length).toBe(2); // root '1' and orphaned '3'
            expect(result.find(c => c.id === '1').child_comments.length).toBe(1);
        });
    });

    describe('getCommentById', () => {
        it('should return comment if found', async () => {
            repository.findByPk.mockResolvedValue({ id: '1' });
            const result = await service.getCommentById('1');
            expect(result.id).toBe('1');
        });

        it('should throw NotFoundException if not found', async () => {
            repository.findByPk.mockResolvedValue(null);
            await expect(service.getCommentById('1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateComment', () => {
        it('should throw ForbiddenException if user does not own the comment', async () => {
            const commentId = 'comment-id';
            const userId = 'user-1' as any;
            const otherUserId = 'user-2' as any;
            repository.findByPk.mockResolvedValue({ id: commentId, user_id: otherUserId });

            await expect(service.updateComment(commentId, {} as any, userId)).rejects.toThrow(
                ForbiddenException,
            );
        });

        it('should successfully update own comment', async () => {
            const commentId = 'comment-id';
            const userId = 'user-id' as any;
            const mockComment = {
                id: commentId,
                user_id: userId,
                update: jest.fn().mockResolvedValue(true),
            };
            repository.findByPk.mockResolvedValue(mockComment);

            const result = await service.updateComment(commentId, { content: 'new' } as any, userId);

            expect(mockComment.update).toHaveBeenCalled();
            expect(result).toBe(mockComment);
        });
    });

    describe('deleteComment', () => {
        it('should delete comment successfully', async () => {
            const commentId = 'c1';
            const userId = 'u1' as any;
            const mockComment = {
                id: commentId,
                user_id: userId,
                destroy: jest.fn().mockResolvedValue(true),
            };
            repository.findByPk.mockResolvedValue(mockComment);

            const result = await service.deleteComment(commentId, userId);

            expect(mockComment.destroy).toHaveBeenCalled();
            expect(result).toBe(mockComment);
        });

        it('should throw NotFound if not found', async () => {
            repository.findByPk.mockResolvedValue(null);
            await expect(service.deleteComment('1', 'u1' as any)).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException if user not authorized', async () => {
            const commentId = 'c1';
            const userId = 'u1' as any;
            const mockComment = {
                id: commentId,
                user_id: 'u2',
            };
            repository.findByPk.mockResolvedValue(mockComment);

            await expect(service.deleteComment(commentId, userId)).rejects.toThrow(ForbiddenException);
        });
    });
});
