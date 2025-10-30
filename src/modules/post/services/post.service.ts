import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostEntity } from '../entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(PostEntity) private readonly postRepository: typeof PostEntity,
  ) {}

  // Add your service methods here
}
