import { CustomParseFilePipe } from './custom-parse-file.pipe';
import { BadRequestException } from '@nestjs/common';

describe('CustomParseFilePipe', () => {
    it('should throw error if file is required but missing', () => {
        const pipe = new CustomParseFilePipe({ fileIsRequired: true });
        expect(() => pipe.transform(null, {} as any)).toThrow(BadRequestException);
    });

    it('should return files if valid', () => {
        const pipe = new CustomParseFilePipe({ maxSize: 1000 });
        const mockFile = { size: 500, originalname: 'test.png' };
        const result = pipe.transform([mockFile], {} as any);
        expect(result).toEqual([mockFile]);
    });

    it('should throw if file too large', () => {
        const pipe = new CustomParseFilePipe({ maxSize: 100 });
        const mockFile = { size: 500, originalname: 'test.png' };
        expect(() => pipe.transform([mockFile], {} as any)).toThrow(BadRequestException);
    });
});
