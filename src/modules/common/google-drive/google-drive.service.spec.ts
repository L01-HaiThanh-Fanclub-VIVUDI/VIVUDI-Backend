import { Test, TestingModule } from '@nestjs/testing';
import { GoogleDriveService } from './google-drive.service';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Readable } from 'stream';

jest.mock('googleapis', () => ({
    google: {
        auth: {
            OAuth2: jest.fn().mockImplementation(() => ({
                setCredentials: jest.fn(),
            })),
        },
        drive: jest.fn().mockReturnValue({
            files: {
                create: jest.fn(),
                get: jest.fn(),
                delete: jest.fn(),
            },
        }),
    },
}));

describe('GoogleDriveService', () => {
    let service: GoogleDriveService;
    let drive: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GoogleDriveService,
                { provide: LoggerService, useValue: { error: jest.fn(), debug: jest.fn() } },
                { provide: ConfigService, useValue: { get: jest.fn() } },
            ],
        }).compile();

        service = module.get<GoogleDriveService>(GoogleDriveService);
        drive = (google.drive as jest.Mock)();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createFolder', () => {
        it('should call drive.files.create', async () => {
            drive.files.create.mockResolvedValue({ data: { id: 'f1', name: 'folder' } });

            const result = await service.createFolder('test-folder');

            expect(drive.files.create).toHaveBeenCalled();
            expect(result.id).toBe('f1');
        });

        it('should handle errors', async () => {
            drive.files.create.mockRejectedValue(new Error('Drive Error'));
            await expect(service.createFolder('test-folder')).rejects.toThrow('Drive Error');
        });
    });

    describe('uploadFile', () => {
        it('should upload file successfully', async () => {
            const mockFile = {
                originalname: 'test.jpg',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('test'),
            } as any;
            drive.files.create.mockResolvedValue({ data: { id: 'file-id' } });

            const result = await service.uploadFile(mockFile, 'folder-id');

            expect(drive.files.create).toHaveBeenCalledWith(expect.objectContaining({
                requestBody: expect.objectContaining({ name: 'test.jpg' })
            }));
            expect(result.id).toBe('file-id');
        });
    });

    describe('deleteFile', () => {
        it('should delete file successfully', async () => {
            drive.files.delete.mockResolvedValue({});
            await service.deleteFile('file-id');
            expect(drive.files.delete).toHaveBeenCalledWith({ fileId: 'file-id' });
        });

        it('should handle delete error', async () => {
            drive.files.delete.mockRejectedValue(new Error('Delete Error'));
            // The service catches error and logs it, does not throw
            await service.deleteFile('file-id');
            expect(drive.files.delete).toHaveBeenCalled();
        });
    });

    describe('getDirectFileLink', () => {
        it('should return link if found', async () => {
            drive.files.get.mockResolvedValue({ data: { webContentLink: 'http://link.com' } });
            const result = await service.getDirectFileLink('file-id');
            expect(result).toBe('http://link.com');
        });

        it('should return null if not found or error', async () => {
            drive.files.get.mockRejectedValue(new Error('Not found'));
            const result = await service.getDirectFileLink('file-id');
            expect(result).toBeNull();
        });
    });

    describe('getFile', () => {
        it('should stream file content', async () => {
            const mockRes = {
                setHeader: jest.fn(),
                status: jest.fn(),
            } as any;
            const mockReq = { headers: {} } as any;

            drive.files.get
                .mockResolvedValueOnce({ data: { name: 'test.png', mimeType: 'image/png', size: 100 } }) // metadata
                .mockResolvedValueOnce({ data: { pipe: jest.fn() } }); // stream

            await service.getFile('file-id', mockReq, mockRes);

            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
        });

        it('should handle range request', async () => {
            const mockRes = {
                setHeader: jest.fn(),
                status: jest.fn(),
            } as any;
            const mockReq = { headers: { range: 'bytes=0-50' } } as any;

            drive.files.get
                .mockResolvedValueOnce({ data: { name: 'test.png', mimeType: 'image/png', size: 100 } }) // metadata
                .mockResolvedValueOnce({ data: { pipe: jest.fn() } }); // stream

            await service.getFile('file-id', mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(206);
        });

        it('should handle errors in getFile', async () => {
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as any;
            drive.files.get.mockRejectedValue(new Error('Get Error'));

            await service.getFile('file-id', {} as any, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
        });
    });

    describe('private methods', () => {
        it('uploadMultipleFiles should work', async () => {
            const mockFiles = [
                { originalname: '1.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('1') },
                { originalname: '2.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('2') }
            ] as any[];

            drive.files.create.mockResolvedValue({ data: { id: 'id' } });

            const result = await service['uploadMultipleFiles'](mockFiles, 'folder-id');
            expect(result).toHaveLength(2);
        });

        it('extractFileIdFromLink should extract id', () => {
            const link = 'https://drive.google.com/uc?export=download&id=1a2b3c';
            const id = service['extractFileIdFromLink'](link);
            expect(id).toBe('1a2b3c');
        });

        it('extractFileIdFromLink should throw on invalid link', () => {
            expect(() => service['extractFileIdFromLink']('invalid')).toThrow();
        });
    });
});
