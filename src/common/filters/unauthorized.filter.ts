import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException, HttpStatus, Inject } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '../../modules/common/logger/logger.service';
import { Response as ResponseService } from '../../modules/common/response/response.entity';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly logger: LoggerService,
        @Inject(ResponseService) private readonly responseService: ResponseService,
    ) { }

    catch(exception: UnauthorizedException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const message = exception.message || 'Unauthorized';

        this.logger.error(`Unauthorized error: ${message}`, exception.stack || '');

        this.responseService.initResponse(false, message, null);

        response
            .status(status)
            .json(this.responseService);
    }
}
