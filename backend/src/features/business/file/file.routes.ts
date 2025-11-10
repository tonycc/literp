/**
 * 文件上传路由
 */

import express, { Router } from 'express';
import { authenticateToken } from '../../../shared/middleware/auth';
import { avatarUpload, documentUpload, uploadPaths } from '../../../config/upload';
import {
  uploadAvatar,
  uploadDocuments,
  deleteFile,
  getFileInfo,
} from './file.controller';

const router = Router();

// 文件上传路由
router.post('/avatar', authenticateToken, avatarUpload, uploadAvatar);
router.post('/documents', authenticateToken, documentUpload, uploadDocuments);

// 文件管理路由
router.delete('/:type/:filename', authenticateToken, deleteFile);
router.get('/info/:type/:filename', authenticateToken, getFileInfo);

// 静态文件服务
router.use('/avatars', express.static(uploadPaths.avatarDir));
router.use('/documents', express.static(uploadPaths.documentsDir));

export default router;