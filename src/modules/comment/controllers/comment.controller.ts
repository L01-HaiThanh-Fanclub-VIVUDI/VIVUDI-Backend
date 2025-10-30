import { Controller } from '@nestjs/common';
import { CommentService } from '../services/comment.service';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // Add your controller methods here
}
