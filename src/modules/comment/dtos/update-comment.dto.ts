import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiPropertyOptional({ example: 'Updated comment content', description: 'Updated comment content' })
  @IsString()
  @IsOptional()
  content?: string;
}
