import { Controller } from '@nestjs/common';
import { PostService } from '../services/post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Add your controller methods here
}
