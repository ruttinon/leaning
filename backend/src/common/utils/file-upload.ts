import { extname } from 'path';

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.mp4', '.zip']);
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'video/mp4', 'application/zip']);
const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

export function isAllowedUpload(file: Express.Multer.File) {
  const ext = extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  return allowedExtensions.has(ext) && allowedMimeTypes.has(mime);
}

export function isAllowedImageUpload(file: Express.Multer.File) {
  const ext = extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  return allowedImageExtensions.has(ext) && allowedImageMimeTypes.has(mime);
}

export function buildUploadFilename(originalName: string) {
  const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
  return `${randomName}${extname(originalName)}`;
}
