import { IsString } from 'class-validator';

export class CreatePostRequestDto {
  @IsString()
  data: string;
  file: Express.Multer.File[];
}
