import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostEntity } from './entities/post.entity';
import { MediaEntity } from './entities/media.entity';
import { PostService } from './services/post.service';
import { PostController } from './controllers/post.controller';

@Module({
  imports: [SequelizeModule.forFeature([PostEntity, MediaEntity])],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
