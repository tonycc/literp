/**
 * 文件上传服务
 */

import fs from 'fs/promises';
import path from 'path';
import { uploadPaths } from '../../../config/upload';
import { AppError } from '../../../shared/middleware/error';

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
}

export interface FileUploadResult {
  success: boolean;
  file?: UploadedFile;
  url?: string;
  message?: string;
}

export class FileService {
  /**
   * 处理头像上传
   */
  async handleAvatarUpload(file: Express.Multer.File): Promise<FileUploadResult> {
    try {
      if (!file) {
        throw new AppError('没有上传文件', 400);
      }

      // 验证文件类型
      if (!file.mimetype.startsWith('image/')) {
        await this.deleteFile(file.path);
        throw new AppError('头像只能上传图片文件', 400);
      }

      // 验证文件大小
      if (file.size > 2 * 1024 * 1024) {
        await this.deleteFile(file.path);
        throw new AppError('头像文件大小不能超过2MB', 400);
      }

      const uploadedFile: UploadedFile = {
        id: this.generateFileId(),
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date()
      };

      const url = `/api/v1/uploads/avatars/${file.filename}`;

      return {
        success: true,
        file: uploadedFile,
        url,
        message: '头像上传成功'
      };
    } catch (error) {
      if (file?.path) {
        await this.deleteFile(file.path);
      }
      throw error;
    }
  }

  /**
   * 处理文档上传
   */
  async handleDocumentUpload(files: Express.Multer.File[]): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];

    for (const file of files) {
      try {
        // 验证文件大小
        if (file.size > 5 * 1024 * 1024) {
          await this.deleteFile(file.path);
          results.push({
            success: false,
            message: `文件 ${file.originalname} 大小不能超过5MB`
          });
          continue;
        }

        const uploadedFile: UploadedFile = {
          id: this.generateFileId(),
          originalName: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          uploadedAt: new Date()
        };

        const url = `/api/v1/uploads/documents/${file.filename}`;

        results.push({
          success: true,
          file: uploadedFile,
          url,
          message: '文件上传成功'
        });
      } catch (error) {
        if (file?.path) {
          await this.deleteFile(file.path);
        }
        results.push({
          success: false,
          message: `文件 ${file.originalname} 上传失败: ${error instanceof Error ? error.message : '未知错误'}`
        });
      }
    }

    return results;
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('删除文件失败:', error);
    }
  }

  /**
   * 删除用户头像
   */
  async deleteAvatar(filename: string): Promise<void> {
    const filePath = path.join(uploadPaths.avatarDir, filename);
    await this.deleteFile(filePath);
  }

  /**
   * 删除文档
   */
  async deleteDocument(filename: string): Promise<void> {
    const filePath = path.join(uploadPaths.documentsDir, filename);
    await this.deleteFile(filePath);
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filename: string, type: 'avatar' | 'document'): Promise<UploadedFile | null> {
    try {
      const dir = type === 'avatar' ? uploadPaths.avatarDir : uploadPaths.documentsDir;
      const filePath = path.join(dir, filename);
      
      const stats = await fs.stat(filePath);
      
      return {
        id: filename,
        originalName: filename,
        filename,
        path: filePath,
        size: stats.size,
        mimetype: this.getMimeType(filename),
        uploadedAt: stats.birthtime
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * 生成文件ID
   */
  private generateFileId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 根据文件扩展名获取MIME类型
   */
  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export const fileService = new FileService();