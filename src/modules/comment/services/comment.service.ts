import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CommentEntity } from '../entities/comment.entity';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { UpdateCommentDto } from '../dtos/update-comment.dto';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Inject } from '@nestjs/common';
import { SEQUELIZE } from 'src/common/contants';
import type { UUID } from 'crypto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(CommentEntity) private readonly commentRepository: typeof CommentEntity,
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
  ) {}

  async createComment(createCommentDto: CreateCommentDto, userId: UUID, transaction?: Transaction) {
    const comment = await this.commentRepository.create({
      content: createCommentDto.content,
      post_id: createCommentDto.post_id,
      user_id: userId,
      parent_id: createCommentDto.parent_id || null,
    } as any, { transaction });

    return comment;
  }

  async getCommentsByPostId(postId: string) {
    // Fetch all comments for the post in a flat list
    const comments = await this.commentRepository.findAll({
      where: { post_id: postId },
      order: [['createdAt', 'ASC']],
    });

    // Convert to plain objects and build a tree structure of arbitrary depth
    const plainComments = comments.map((c) => c.get({ plain: true }) as any);
    const tree = this.buildCommentTree(plainComments);

    return tree;
  }

  /**
   * Build a comment tree (arbitrary depth) from a flat list of comments.
   * Each node has a `child_comments` array.
   */
  private buildCommentTree(comments: any[]) {
    const map = new Map<string, any>();
    const roots: any[] = [];

    // Initialize map and ensure each comment has child_comments array
    for (const comment of comments) {
      comment.child_comments = [];
      map.set(comment.id, comment);
    }

    // Link children to their parents
    for (const comment of comments) {
      if (!comment.parent_id) {
        roots.push(comment);
      } else {
        const parent = map.get(comment.parent_id);
        if (parent) {
          parent.child_comments.push(comment);
        } else {
          // Orphaned comment (parent deleted?) -> treat as root to avoid loss
          roots.push(comment);
        }
      }
    }

    return roots;
  }

  async getCommentById(commentId: string) {
    const comment = await this.commentRepository.findByPk(commentId, {
      include: [
        {
          model: CommentEntity,
          as: 'child_comments',
        },
      ],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found.`);
    }

    return comment;
  }

  async updateComment(commentId: string, updateCommentDto: UpdateCommentDto, userId: UUID) {
    const comment = await this.commentRepository.findByPk(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found.`);
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('You are not authorized to update this comment.');
    }

    await comment.update(updateCommentDto);

    return comment;
  }

  async deleteComment(commentId: string, userId: UUID) {
    const comment = await this.commentRepository.findByPk(commentId);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found.`);
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('You are not authorized to delete this comment.');
    }

    await comment.destroy();

    return comment;
  }
}
