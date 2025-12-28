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
    @ApiResponse({ status: 201, description: 'File uploaded successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
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
    @ApiResponse({ status: 200, description: 'File retrieved successfully' })
    @ApiResponse({ status: 404, description: 'File not found' })
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
    @ApiResponse({ status: 200, description: 'File deleted successfully' })
    @ApiResponse({ status: 404, description: 'File not found' })
    async deleteFile(
        @Param('fileId') fileId: string,
    ) {
        return this.googleDriveService.deleteFile(fileId);
    }

    @Get('direct-link/:fileId')
    @ApiOperation({ summary: 'Get direct download link for Google Drive file' })
    @ApiParam({ name: 'fileId', description: 'Google Drive file ID' })
    @ApiResponse({ status: 200, description: 'Direct link retrieved successfully' })
    @ApiResponse({ status: 404, description: 'File not found' })
    async getDirectFileLink(@Param('fileId') fileId: string) {
        return this.googleDriveService.getDirectFileLink(fileId);
    }
}
