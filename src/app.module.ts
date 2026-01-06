import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ResponseModule } from './modules/common/response/response.module';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { PositionModule } from './modules/position/position.module';
import { GoogleDriveModule } from './modules/common/google-drive/google-drive.module';
import { LoggerModule } from './modules/common/logger/logger.module';
import { APP_FILTER } from '@nestjs/core';
import { UnauthorizedExceptionFilter } from './common/filters/unauthorized.filter';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';

@Module({
    imports: [
        SentryModule.forRoot(),
        DatabaseModule,
        AuthModule,
        PostModule,
        UserModule,
        CommentModule,
        PositionModule,
        GoogleDriveModule,
        LoggerModule,
        ResponseModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: SentryGlobalFilter,
        },
        {
            provide: APP_FILTER,
            useClass: UnauthorizedExceptionFilter,
        },
    ],
})
export class AppModule { }
