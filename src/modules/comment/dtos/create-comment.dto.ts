import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UUID } from 'crypto';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a comment', description: 'Comment content' })
  @IsString()
  content: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Post ID' })
  @IsUUID()
  post_id: UUID;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Parent comment ID (for replies)' })
  @IsUUID()
  @IsOptional()
  parent_id?: UUID;
}
