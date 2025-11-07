import { IsString, IsOptional, IsEnum } from 'class-validator';
import type { UUID } from 'crypto';
import { PostVisibility } from '../../../common/contants';

export class CreatePostDto {

  @IsString()
  content: string;

  @IsString()
  @IsOptional() // Make author_id optional
  author_id: UUID;

  @IsString()
  location_id: UUID;

  @IsEnum(PostVisibility)
  visibility: PostVisibility;
}
