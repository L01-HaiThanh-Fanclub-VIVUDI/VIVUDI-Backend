import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentEntity } from './entities/comment.entity';
import { CommentService } from './services/comment.service';
import { CommentController } from './controllers/comment.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { ResponseModule } from '../common/response/response.module';
import { UserModule } from '../../modules/user/user.module';
import { PostModule } from '../../modules/post/post.module';

@Module({
  imports: [
    SequelizeModule.forFeature([CommentEntity]),
    ConfigModule,
    DatabaseModule,
    ResponseModule,
    UserModule,
    PostModule,
  ],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
