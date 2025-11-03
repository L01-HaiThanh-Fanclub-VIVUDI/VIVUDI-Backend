import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostEntity } from './entities/post.entity';
import { MediaEntity } from './entities/media.entity';
import { PostService } from './services/post.service';
import { PostController } from './controllers/post.controller';
import { GoogleDriveModule } from '../common/google-drive/google-drive.module';
import { GoogleDriveService } from '../common/google-drive/google-drive.service';
import { LoggerModule } from '../common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { ResponseModule } from '../common/response/response.module';
import { UserModule } from '../../modules/user/user.module';
import { PositionModule } from '../../modules/position/position.module';

@Module({
  imports: [
    SequelizeModule.forFeature([PostEntity, MediaEntity]),
    GoogleDriveModule,
    LoggerModule,
    ConfigModule,
    DatabaseModule,
    ResponseModule,
    UserModule,
    PositionModule,
  ],
  providers: [PostService, GoogleDriveService],
  controllers: [PostController],
})
export class PostModule {}
