import { UnauthorizedExceptionFilter } from './unauthorized.filter';
import { UnauthorizedException } from '@nestjs/common';

describe('UnauthorizedExceptionFilter', () => {
    let filter: UnauthorizedExceptionFilter;
    let logger: any;
    let responseService: any;

    beforeEach(() => {
        logger = { error: jest.fn() };
        responseService = { initResponse: jest.fn().mockReturnThis() };
        filter = new UnauthorizedExceptionFilter(logger, responseService);
    });

    it('should catch unauthorized exception and return custom response', () => {
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        const mockHost = {
            switchToHttp: () => ({
                getResponse: () => mockResponse,
            }),
        };

        const exception = new UnauthorizedException('Custom message');
        filter.catch(exception, mockHost as any);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(responseService.initResponse).toHaveBeenCalledWith(false, 'Custom message', null);
        expect(mockResponse.json).toHaveBeenCalled();
    });
});
