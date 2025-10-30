import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentEntity } from './entities/comment.entity';
import { CommentService } from './services/comment.service';
import { CommentController } from './controllers/comment.controller';

@Module({
  imports: [SequelizeModule.forFeature([CommentEntity])],
  providers: [CommentService],
  controllers: [CommentController]
})
export class CommentModule {}
