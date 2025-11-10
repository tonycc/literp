/**
 * 文件上传控制器
 */

import { Request, Response, NextFunction } from 'express';
import { createSuccessResponse } from '@zyerp/shared';
import { fileService } from './file.service';
import { AppError } from '../../../shared/middleware/error';

/**
 * 上传头像
 */
export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    
    if (!file) {
      throw new AppError('请选择要上传的头像文件', 400);
    }

    const result = await fileService.handleAvatarUpload(file);
    
    res.json(createSuccessResponse(result, '头像上传成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * 上传文档
 */
export const uploadDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw new AppError('请选择要上传的文件', 400);
    }

    const results = await fileService.handleDocumentUpload(files);
    
    res.json(createSuccessResponse(results, '文件上传完成'));
  } catch (error) {
    next(error);
  }
};

/**
 * 删除文件
 */
export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { filename, type } = req.params;
    
    if (!filename || !type) {
      throw new AppError('文件名和类型不能为空', 400);
    }

    if (type === 'avatar') {
      await fileService.deleteAvatar(filename);
    } else if (type === 'document') {
      await fileService.deleteDocument(filename);
    } else {
      throw new AppError('不支持的文件类型', 400);
    }
    
    res.json(createSuccessResponse(null, '文件删除成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * 获取文件信息
 */
export const getFileInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { filename, type } = req.params;
    
    if (!filename || !type) {
      throw new AppError('文件名和类型不能为空', 400);
    }

    if (type !== 'avatar' && type !== 'document') {
      throw new AppError('不支持的文件类型', 400);
    }

    const fileInfo = await fileService.getFileInfo(filename, type);
    
    if (!fileInfo) {
      throw new AppError('文件不存在', 404);
    }
    
    res.json(createSuccessResponse(fileInfo, '获取文件信息成功'));
  } catch (error) {
    next(error);
  }
};