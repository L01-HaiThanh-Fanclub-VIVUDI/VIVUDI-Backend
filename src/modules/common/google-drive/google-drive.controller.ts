import { Controller, Post, UseInterceptors, UploadedFile, Body, Res, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { GoogleDriveService } from './google-drive.service';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('google-drive')
@Controller('google-drive')
export class GoogleDriveController {
    constructor(private readonly googleDriveService: GoogleDriveService) { }

    @Post('upload/:folderId')
    @ApiOperation({ summary: 'Upload file to Google Drive' })
    @ApiBearerAuth('JWT-auth')
    @ApiParam({ name: 'folderId', description: 'Google Drive folder ID' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ 
        status: 201, 
        description: 'File uploaded successfully',
        schema: {
            example: {
                success: true,
                message: 'File uploaded successfully',
                data: {
                    id: '1a2b3c4d5e6f7g8h9i0j',
                    name: 'example.jpg',
                    mimeType: 'image/jpeg',
                    size: '1024000',
                    webViewLink: 'https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view',
                    webContentLink: 'https://drive.google.com/uc?export=download&id=1a2b3c4d5e6f7g8h9i0j',
                    folderId: '0a1b2c3d4e5f6g7h8i9j'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized',
        schema: {
            example: {
                success: false,
                message: 'Unauthorized',
                data: null
            }
        }
    })
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Param('folderId') folderId: string,
    ) {
        return this.googleDriveService.uploadFile(file, folderId);
    }

    @Get('file/:fileId')
    @ApiOperation({ summary: 'Get file from Google Drive' })
    @ApiParam({ name: 'fileId', description: 'Google Drive file ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'File retrieved successfully - Returns file stream',
        schema: {
            type: 'string',
            format: 'binary',
            description: 'File content stream'
        }
    })
    @ApiResponse({ 
        status: 404, 
        description: 'File not found',
        schema: {
            example: {
                success: false,
                message: 'File not found',
                data: null
            }
        }
    })
    async getFile(
        @Param('fileId') fileId: string,
        @Req() req: ExpressRequest,
        @Res() res: ExpressResponse
    ) {
        return this.googleDriveService.getFile(fileId, req, res);
    }

    @Post('delete/:fileId')
    @ApiOperation({ summary: 'Delete file from Google Drive' })
    @ApiParam({ name: 'fileId', description: 'Google Drive file ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'File deleted successfully',
        schema: {
            example: {
                success: true,
                message: 'File deleted successfully',
                data: {
                    fileId: '1a2b3c4d5e6f7g8h9i0j',
                    deleted: true
                }
            }
        }
    })
    @ApiResponse({ 
        status: 404, 
        description: 'File not found',
        schema: {
            example: {
                success: false,
                message: 'File not found',
                data: null
            }
        }
    })
    async deleteFile(
        @Param('fileId') fileId: string,
    ) {
        return this.googleDriveService.deleteFile(fileId);
    }

    @Get('direct-link/:fileId')
    @ApiOperation({ summary: 'Get direct download link for Google Drive file' })
    @ApiParam({ name: 'fileId', description: 'Google Drive file ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'Direct link retrieved successfully',
        schema: {
            example: {
                success: true,
                message: 'Direct link retrieved successfully',
                data: {
                    fileId: '1a2b3c4d5e6f7g8h9i0j',
                    directLink: 'https://drive.google.com/uc?export=download&id=1a2b3c4d5e6f7g8h9i0j',
                    webViewLink: 'https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view',
                    name: 'example.jpg',
                    mimeType: 'image/jpeg',
                    size: '1024000'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 404, 
        description: 'File not found',
        schema: {
            example: {
                success: false,
                message: 'File not found',
                data: null
            }
        }
    })
    async getDirectFileLink(@Param('fileId') fileId: string) {
        return this.googleDriveService.getDirectFileLink(fileId);
    }
}
