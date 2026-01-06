import { LoggerService } from './logger.service';
import { Logger } from '@nestjs/common';

describe('LoggerService', () => {
    let service: LoggerService;

    beforeEach(() => {
        service = new LoggerService();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call super.error', () => {
        const spy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
        service.error('msg', 'stack');
        expect(spy).toHaveBeenCalledWith('msg', 'stack', undefined);
        spy.mockRestore();
    });
});
