import multer from 'multer';
import { AppError } from './errorHandler';
import { storageConfig } from '../config/storage';

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!storageConfig.allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError('Type de fichier non autorisé', 400));
  }
  cb(null, true);
};

export const secureUpload = multer({
  storage,
  limits: {
    fileSize: storageConfig.maxFileSize,
  },
  fileFilter,
});

export const uploadAvatarMiddleware = secureUpload.single('avatar');
export const uploadResourceMiddleware = secureUpload.single('resource');
