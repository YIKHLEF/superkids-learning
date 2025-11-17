import dotenv from 'dotenv';

dotenv.config();

export type StorageProvider = 's3' | 'azure' | 'local';

export const storageConfig = {
  provider: (process.env.STORAGE_PROVIDER as StorageProvider) || 'local',
  bucket: process.env.STORAGE_BUCKET || process.env.AZURE_STORAGE_CONTAINER || 'uploads',
  region: process.env.STORAGE_REGION || 'us-east-1',
  basePath: process.env.STORAGE_BASE_PATH || 'uploads',
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  azureConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  maxFileSize: Number(process.env.MAX_UPLOAD_SIZE || 5 * 1024 * 1024),
  allowedMimeTypes:
    process.env.ALLOWED_UPLOAD_MIME_TYPES?.split(',') ||
    ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4', 'video/webm'],
};
