/**
 * 文件上传配置
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'uploads');
const avatarDir = path.join(uploadDir, 'avatars');
const documentsDir = path.join(uploadDir, 'documents');

// 创建目录
[uploadDir, avatarDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 文件存储配置
const storage = multer.diskStorage({
  destination: (_req: Request, file: Express.Multer.File, cb) => {
    // 根据文件类型决定存储目录
    if (file.fieldname === 'avatar') {
      cb(null, avatarDir);
    } else {
      cb(null, documentsDir);
    }
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // 头像文件类型限制
    if (file.fieldname === 'avatar') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
    // 文档文件类型限制
    else {
      const allowedTypes = [
        'image/',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      
      const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
      cb(null, isAllowed);
    }
  } catch (error) {
    cb(error as Error);
  }
};

// 上传配置
export const uploadConfig = {
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // 最多5个文件
  }
};

// 头像上传中间件
export const avatarUpload = multer({
  ...uploadConfig,
  limits: {
    fileSize: 2 * 1024 * 1024, // 头像限制2MB
    files: 1
  }
}).single('avatar');

// 文档上传中间件
export const documentUpload = multer(uploadConfig).array('documents', 5);

// 单文件上传中间件
export const singleFileUpload = multer(uploadConfig).single('file');

// 上传目录配置
export const uploadPaths = {
  uploadDir,
  avatarDir,
  documentsDir
};