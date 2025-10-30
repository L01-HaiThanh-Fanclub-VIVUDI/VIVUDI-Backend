import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CommentEntity } from '../entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(CommentEntity) private readonly commentRepository: typeof CommentEntity,
  ) {}

  // Add your service methods here
}
