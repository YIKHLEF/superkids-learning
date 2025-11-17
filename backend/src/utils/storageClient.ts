import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BlobServiceClient } from '@azure/storage-blob';
import sharp from 'sharp';
import { storageConfig } from '../config/storage';
import { logger } from './logger';

export interface StoredFileMetadata {
  key: string;
  url: string;
  size: number;
  contentType: string;
  width?: number;
  height?: number;
  provider: string;
}

class StorageClient {
  private s3Client?: S3Client;
  private azureClient?: BlobServiceClient;

  private getS3Client() {
    if (!this.s3Client) {
      this.s3Client = new S3Client({
        region: storageConfig.region,
        credentials:
          storageConfig.accessKeyId && storageConfig.secretAccessKey
            ? {
                accessKeyId: storageConfig.accessKeyId,
                secretAccessKey: storageConfig.secretAccessKey,
              }
            : undefined,
      });
    }
    return this.s3Client;
  }

  private getAzureClient() {
    if (!this.azureClient) {
      if (!storageConfig.azureConnectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING manquante');
      }
      this.azureClient = BlobServiceClient.fromConnectionString(
        storageConfig.azureConnectionString
      );
    }
    return this.azureClient;
  }

  private async compressIfNeeded(file: Express.Multer.File) {
    if (!file.mimetype.startsWith('image/')) {
      const extension = path.extname(file.originalname) || '.bin';
      return {
        buffer: file.buffer,
        info: undefined as sharp.OutputInfo | undefined,
        contentType: file.mimetype,
        extension,
      };
    }

    const transformer = sharp(file.buffer).rotate();
    const { data, info } = await transformer
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });

    return { buffer: data, info, contentType: 'image/webp', extension: '.webp' };
  }

  async upload(file: Express.Multer.File, folder: string): Promise<StoredFileMetadata> {
    const fileId = randomUUID();
    const { buffer, info, contentType, extension } = await this.compressIfNeeded(file);
    const key = `${folder}/${fileId}${extension}`;

    if (storageConfig.provider === 's3') {
      const client = this.getS3Client();
      await client.send(
        new PutObjectCommand({
          Bucket: storageConfig.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        })
      );
      return {
        key,
        url: `https://${storageConfig.bucket}.s3.${storageConfig.region}.amazonaws.com/${key}`,
        size: buffer.length,
        contentType,
        width: info?.width,
        height: info?.height,
        provider: 's3',
      };
    }

    if (storageConfig.provider === 'azure') {
      const client = this.getAzureClient();
      const containerClient = client.getContainerClient(storageConfig.bucket);
      await containerClient.createIfNotExists();
      const blockBlobClient = containerClient.getBlockBlobClient(key);
      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType },
      });
      return {
        key,
        url: blockBlobClient.url,
        size: buffer.length,
        contentType,
        width: info?.width,
        height: info?.height,
        provider: 'azure',
      };
    }

    // Fallback local storage
    const uploadRoot = path.join(process.cwd(), storageConfig.basePath);
    const fullPath = path.join(uploadRoot, key);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, buffer);
    logger.info(`Fichier stocké localement: ${fullPath}`);

    return {
      key,
      url: fullPath,
      size: buffer.length,
      contentType,
      width: info?.width,
      height: info?.height,
      provider: 'local',
    };
  }
}

export const storageClient = new StorageClient();
