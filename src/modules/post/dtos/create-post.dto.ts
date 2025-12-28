import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UUID } from 'crypto';
import { PostVisibility } from '../../../common/contants';

export class CreatePostDto {
  @ApiProperty({ example: 'This is my post content', description: 'Post content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Author ID (optional, auto-filled from token)' })
  @IsString()
  @IsOptional() // Make author_id optional
  author_id: UUID;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Location ID' })
  @IsString()
  location_id: UUID;

  @ApiProperty({ enum: PostVisibility, example: PostVisibility.PUBLIC, description: 'Post visibility' })
  @IsEnum(PostVisibility)
  visibility: PostVisibility;

  @ApiPropertyOptional({ example: 5, description: 'Rating (1-5)', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}
