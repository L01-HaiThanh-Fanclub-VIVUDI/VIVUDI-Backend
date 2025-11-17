import { IsString, IsOptional, IsUUID } from 'class-validator';
import type { UUID } from 'crypto';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsUUID()
  post_id: UUID;

  @IsUUID()
  @IsOptional()
  parent_id?: UUID;
}
