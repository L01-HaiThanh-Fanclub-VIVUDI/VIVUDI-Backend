import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ResponseModule } from './modules/common/response/response.module';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { PositionModule } from './modules/position/position.module';

@Module({
  imports: [DatabaseModule, AuthModule, ResponseModule, UserModule, PostModule, CommentModule, PositionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
