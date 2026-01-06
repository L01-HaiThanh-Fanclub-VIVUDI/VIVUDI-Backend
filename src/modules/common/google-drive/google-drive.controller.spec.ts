import { Test, TestingModule } from '@nestjs/testing';
import { GoogleDriveController } from './google-drive.controller';
import { GoogleDriveService } from './google-drive.service';

const mockGoogleDriveService = () => ({
    uploadFile: jest.fn(),
    getFile: jest.fn(),
    deleteFile: jest.fn(),
    getDirectFileLink: jest.fn(),
});

describe('GoogleDriveController', () => {
    let controller: GoogleDriveController;
    let service: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GoogleDriveController],
            providers: [
                { provide: GoogleDriveService, useFactory: mockGoogleDriveService },
            ],
        }).compile();

        controller = module.get<GoogleDriveController>(GoogleDriveController);
        service = module.get(GoogleDriveService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('uploadFile', () => {
        it('should call service.uploadFile', async () => {
            const mockFile = { originalname: 'test.jpg' } as Express.Multer.File;
            service.uploadFile.mockResolvedValue({ id: 'file-id' });

            const result = await controller.uploadFile(mockFile, 'folder-id');

            expect(service.uploadFile).toHaveBeenCalledWith(mockFile, 'folder-id');
            expect(result).toEqual({ id: 'file-id' });
        });
    });

    describe('getFile', () => {
        it('should call service.getFile', async () => {
            const mockReq = {} as any;
            const mockRes = {} as any;
            service.getFile.mockResolvedValue(undefined);

            await controller.getFile('file-id', mockReq, mockRes);

            expect(service.getFile).toHaveBeenCalledWith('file-id', mockReq, mockRes);
        });
    });

    describe('deleteFile', () => {
        it('should call service.deleteFile', async () => {
            service.deleteFile.mockResolvedValue(undefined);

            await controller.deleteFile('file-id');

            expect(service.deleteFile).toHaveBeenCalledWith('file-id');
        });
    });

    describe('getDirectFileLink', () => {
        it('should call service.getDirectFileLink', async () => {
            service.getDirectFileLink.mockResolvedValue('http://link.com');

            const result = await controller.getDirectFileLink('file-id');

            expect(service.getDirectFileLink).toHaveBeenCalledWith('file-id');
            expect(result).toBe('http://link.com');
        });
    });
});
