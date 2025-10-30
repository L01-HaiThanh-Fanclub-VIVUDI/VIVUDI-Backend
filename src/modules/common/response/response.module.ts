import { Module } from '@nestjs/common';
import { Response } from './response.entity';

@Module({
  providers: [Response],
  exports: [Response],
})
export class ResponseModule {}
