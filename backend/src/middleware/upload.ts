import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { AppError } from './errorHandler';
import { Request } from 'express';

/**
 * Configuration de stockage sécurisée pour Multer
 * Utilise un répertoire temporaire et génère des noms de fichiers sécurisés
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Stocker dans le répertoire temporaire
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    cb(null, path.join(uploadDir, 'temp'));
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier sécurisé et unique
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);

    // Assainir l'extension (enlever caractères dangereux)
    const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, '');

    cb(null, `temp_${timestamp}_${randomBytes}${safeExt}`);
  },
});

/**
 * Types MIME autorisés par catégorie
 */
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  video: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
  ],
};

/**
 * Extensions de fichiers autorisées
 */
const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.mp4', '.webm', '.ogg', '.mov',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.mp3', '.wav', '.ogg',
];

/**
 * Filtre de fichiers avancé avec validation stricte
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // 1. Vérifier l'extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new AppError(`Extension non autorisée: ${ext}`, 400));
    }

    // 2. Vérifier le MIME type
    const mimeTypeValid = Object.values(ALLOWED_MIME_TYPES)
      .flat()
      .includes(file.mimetype);

    if (!mimeTypeValid) {
      return cb(new AppError(`Type MIME non autorisé: ${file.mimetype}`, 400));
    }

    // 3. Vérifier la cohérence extension/MIME type
    const mimeCategory = file.mimetype.split('/')[0];
    const expectedExtensions: string[] = [];

    if (mimeCategory === 'image') {
      expectedExtensions.push('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg');
    } else if (mimeCategory === 'video') {
      expectedExtensions.push('.mp4', '.webm', '.ogg', '.mov');
    } else if (mimeCategory === 'audio') {
      expectedExtensions.push('.mp3', '.wav', '.ogg');
    } else if (file.mimetype.includes('pdf')) {
      expectedExtensions.push('.pdf');
    } else if (file.mimetype.includes('word')) {
      expectedExtensions.push('.doc', '.docx');
    } else if (file.mimetype.includes('excel') || file.mimetype.includes('sheet')) {
      expectedExtensions.push('.xls', '.xlsx');
    }

    if (expectedExtensions.length > 0 && !expectedExtensions.includes(ext)) {
      return cb(new AppError('Extension et type MIME incohérents', 400));
    }

    // 4. Vérifier les caractères dangereux dans le nom de fichier
    const dangerousPattern = /[<>:"|?*\x00-\x1f]/;
    if (dangerousPattern.test(file.originalname)) {
      return cb(new AppError('Nom de fichier contient des caractères interdits', 400));
    }

    // 5. Vérifier la longueur du nom de fichier
    if (file.originalname.length > 255) {
      return cb(new AppError('Nom de fichier trop long (max 255 caractères)', 400));
    }

    // 6. Interdire les double extensions suspectes
    const suspiciousDoubleExt = /\.(exe|bat|cmd|sh|php|asp|jsp|cgi)$/i;
    if (suspiciousDoubleExt.test(file.originalname)) {
      return cb(new AppError('Type de fichier potentiellement dangereux', 400));
    }

    cb(null, true);
  } catch (error) {
    cb(new AppError('Erreur lors de la validation du fichier', 400));
  }
};

/**
 * Configuration Multer principale
 */
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB par défaut
    files: 10, // Maximum 10 fichiers par requête
    fields: 20, // Maximum 20 champs de formulaire
    fieldNameSize: 100, // Taille max du nom de champ
    fieldSize: 1024 * 1024, // Taille max d'un champ (1MB)
  },
  fileFilter: fileFilter,
  preservePath: false, // Ne pas préserver le chemin du fichier
});

/**
 * Upload d'un seul fichier
 */
export const uploadSingle = (fieldName: string = 'file') => upload.single(fieldName);

/**
 * Upload de plusieurs fichiers (même champ)
 */
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 10) => {
  // Limiter à 10 fichiers maximum pour éviter les abus
  const safeMaxCount = Math.min(maxCount, 10);
  return upload.array(fieldName, safeMaxCount);
};

/**
 * Upload de plusieurs champs avec fichiers
 */
export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  // Limiter le nombre de fichiers par champ
  const safeFields = fields.map((field) => ({
    name: field.name,
    maxCount: Math.min(field.maxCount, 10),
  }));
  return upload.fields(safeFields);
};

/**
 * Middleware pour valider la taille totale des fichiers uploadés
 */
export const validateTotalSize = (maxTotalSize: number = 50 * 1024 * 1024) => {
  return (req: Request, res: any, next: any) => {
    let totalSize = 0;

    if (req.file) {
      totalSize = req.file.size;
    } else if (req.files) {
      if (Array.isArray(req.files)) {
        totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
      } else {
        totalSize = Object.values(req.files)
          .flat()
          .reduce((sum, file) => sum + file.size, 0);
      }
    }

    if (totalSize > maxTotalSize) {
      return next(
        new AppError(
          `Taille totale des fichiers dépasse la limite de ${maxTotalSize / 1024 / 1024}MB`,
          400
        )
      );
    }

    next();
  };
};
