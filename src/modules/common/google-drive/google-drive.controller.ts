import { Controller, Post, UseInterceptors, UploadedFile, Body, Res, Get, Param, Req, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleDriveService } from './google-drive.service';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('google-drive')
export class GoogleDriveController {
    constructor(private readonly googleDriveService: GoogleDriveService) { }

    @Post('upload/:folderId')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Param('folderId') folderId: string,
    ) {
        return this.googleDriveService.uploadFile(file, folderId);
    }

    @Get('file/:fileId')
    async getFile(
        @Param('fileId') fileId: string,
        @Req() req: ExpressRequest,
        @Res() res: ExpressResponse
    ) {
        return this.googleDriveService.getFile(fileId, req, res);
    }

    @Post('delete/:fileId')
    async deleteFile(
        @Param('fileId') fileId: string,
    ) {
        return this.googleDriveService.deleteFile(fileId);
    }

    @Get('direct-link/:fileId')
    async getDirectFileLink(@Param('fileId') fileId: string) {
        return this.googleDriveService.getDirectFileLink(fileId);
    }
}
