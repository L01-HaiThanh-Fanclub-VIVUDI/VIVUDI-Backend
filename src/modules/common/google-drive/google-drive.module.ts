import { Module } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';
import { LoggerModule } from '../logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleDriveController } from './google-drive.controller';

@Module({
  imports: [LoggerModule, ConfigModule],
  controllers: [GoogleDriveController],
  providers: [GoogleDriveService],
  exports: [GoogleDriveService],
})
export class GoogleDriveModule {}
