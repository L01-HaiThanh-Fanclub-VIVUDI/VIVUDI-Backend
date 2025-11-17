import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

interface CustomParseFileOptions {
  maxSize?: number; // in bytes
  fileTypes?: string[]; // allowed mimetypes
  fileIsRequired?: boolean;
}

@Injectable()
export class CustomParseFilePipe implements PipeTransform {
  constructor(private readonly options: CustomParseFileOptions) {}

  transform(value: any, _metadata: ArgumentMetadata) {
    const files = value;

    if (!files || (Array.isArray(files) && files.length === 0)) {
      if (this.options.fileIsRequired) {
        throw new BadRequestException('File is required');
      }
      return files;
    }

    const allFiles: Express.Multer.File[] = Array.isArray(files)
      ? files
      : (Object.values(files).flat() as Express.Multer.File[]);

    for (const file of allFiles) {
      if (!file) continue;

      if (this.options.maxSize && file.size > this.options.maxSize) {
        throw new BadRequestException(`File ${file.originalname} is too large`);
      }

      if (this.options.fileTypes && this.options.fileTypes.length > 0) {
        if (!this.options.fileTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `File type not allowed: ${file.originalname} (${file.mimetype})`,
          );
        }
      }
    }

    return files;
  }
}
