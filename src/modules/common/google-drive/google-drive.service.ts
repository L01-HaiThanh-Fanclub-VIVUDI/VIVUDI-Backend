import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { Request, Response as ExpressResponse } from 'express';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { GOOGLE_DRIVE_ROOT_FOLDER_ID } from 'src/common/contants'; // Import the constant

@Injectable()
export class GoogleDriveService {
    private drive;

    constructor(
        private readonly logger: LoggerService,
        private readonly configService: ConfigService,
    ) {
        try {
            const oAuth2Client = new google.auth.OAuth2(
                this.configService.get<string>('GOOGLE_DRIVE_CLIENT_ID'),
                this.configService.get<string>('GOOGLE_DRIVE_CLIENT_SECRET'),
                this.configService.get<string>('GOOGLE_DRIVE_REDIRECT_URI'),
            );

            oAuth2Client.setCredentials({
                refresh_token: this.configService.get<string>('GOOGLE_DRIVE_REFRESH_TOKEN'),
            });

            this.drive = google.drive({ version: 'v3', auth: oAuth2Client });
        } catch (error) {
            this.logger.error('Error initializing Google Drive service', error.stack);
            throw error; // Re-throw the error to prevent the app from starting with a misconfigured Google Drive service
        }
    }

    async uploadFile(file: Express.Multer.File, folderId: string) {
        const response = await this.drive.files.create({
            requestBody: {
                name: file.originalname,
                parents: [folderId],
            },
            media: {
                mimeType: file.mimetype,
                body: Readable.from(file.buffer),
            },
            fields: 'id, webViewLink, parents',
        });

        this.logger.debug(`File uploaded successfully. File ID: ${response.data.id} in folder ${response.data.parents}`);

        return response.data;
    }

    async getFile(fileId: string, req: Request, res: ExpressResponse): Promise<void> {
        try {
            const fileMetadata = await this.drive.files.get({ fileId, fields: 'name, mimeType, size' });
            const fileName = fileMetadata.data.name;
            const mimeType = fileMetadata.data.mimeType;
            const fileSize = Number(fileMetadata.data.size);

            const range = req.headers.range;
            let start = 0;
            let end = fileSize - 1;

            if (range) {
                const parts = range.replace(/bytes=/, '').split('-');
                start = parseInt(parts[0], 10);
                end = parts[1] ? parseInt(parts[1], 10) : end;
                res.status(206); // Partial Content
                res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
            }

            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Length', end - start + 1);
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

            const response = await this.drive.files.get(
                { fileId, alt: 'media' },
                {
                    responseType: 'stream',
                    headers: { Range: `bytes=${start}-${end}` },
                },
            );

            response.data.pipe(res);
        } catch (error) {
            this.logger.error(error.message, error.stack);
            res.status(500).send('Internal Server Error');
        }
    }

    async deleteFile(fileId: string): Promise<void> {
        try {
            await this.drive.files.delete({ fileId: fileId });
            this.logger.debug(`File with ID ${fileId} deleted successfully from Google Drive.`);
        } catch (error) {
            this.logger.error(`Error deleting file with ID ${fileId} from Google Drive: ${error.message}`, error.stack);
            // throw new Error(`Failed to delete file from Google Drive: ${error.message}`);
        }
    }

    async createFolder(folderName: string, parentId?: string): Promise<any> {
        try {
            const fileMetadata: any = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            };

            if (parentId) {
                fileMetadata.parents = [parentId];
            } else {
                fileMetadata.parents = [GOOGLE_DRIVE_ROOT_FOLDER_ID]; // Use root folder ID if no parentId is provided
            }

            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                fields: 'id, name',
            });
            this.logger.debug(`Folder created successfully. Folder ID: ${response.data.id}, Name: ${response.data.name}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error creating folder '${folderName}': ${error.message}`, error.stack);
            throw new Error(`Failed to create folder: ${error.message}`);
        }
    }

    private extractFileIdFromLink(link: string): string {
        const regex = /id=([a-zA-Z0-9_-]+)/;
        const match = link.match(regex);
        if (match && match[1]) {
            return match[1];
        }
        throw new Error('Invalid Google Drive download link');
    }

    async getDirectFileLink(fileId: string): Promise<string | null> {
        try {
            const response = await this.drive.files.get({
                fileId: fileId,
                fields: 'webContentLink'
            });
            return response.data.webContentLink || null;
        } catch (error) {
            this.logger.error(`Error getting direct file link for file ID ${fileId}: ${error.message}`, error.stack);
            return null;
        }
    }

    private async uploadMultipleFiles(files: Array<Express.Multer.File>, folderId: string) {
        const uploadPromises = files.map(async (file) => {
            const response = await this.drive.files.create({
                requestBody: {
                    name: file.originalname,
                    parents: [folderId],
                },
                media: {
                    mimeType: file.mimetype,
                    body: Readable.from(file.buffer),
                },
                fields: 'id, webViewLink, parents',
            });
            this.logger.debug(`File uploaded successfully. File ID: ${response.data.id} in folder ${response.data.parents}`);
            return response.data;
        });
        return Promise.all(uploadPromises);
    }
}
