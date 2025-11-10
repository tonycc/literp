/**
 * 文件上传服务
 */

import apiClient from '../../../shared/services/api';

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

export interface ProductImageUploadResult {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

export class UploadService {
  /**
   * 上传头像
   */
  async uploadAvatar(file: File): Promise<FileUploadResult> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post('/uploads/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  /**
   * 上传文档
   */
  async uploadDocuments(files: File[]): Promise<FileUploadResult[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });

    const response = await apiClient.post('/uploads/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  /**
   * 上传产品图片
   */
  async uploadProductImages(files: File[]): Promise<ProductImageUploadResult[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await apiClient.post('/uploads/product-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  }

  /**
   * 删除产品图片
   */
  async deleteProductImage(imageId: string): Promise<void> {
    await apiClient.delete(`/uploads/product-images/${imageId}`);
  }

  /**
   * 删除文件
   */
  async deleteFile(filename: string, type: 'avatar' | 'document'): Promise<void> {
    await apiClient.delete(`/uploads/${type}/${filename}`);
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filename: string, type: 'avatar' | 'document'): Promise<UploadedFile> {
    const response = await apiClient.get(`/uploads/info/${type}/${filename}`);
    return response.data.data;
  }

  /**
   * 获取文件URL
   */
  getFileUrl(filename: string, type: 'avatar' | 'document' | 'product-image'): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    const typeMap = {
      'avatar': 'avatars',
      'document': 'documents',
      'product-image': 'product-images'
    };
    return `${baseUrl}/uploads/${typeMap[type]}/${filename}`;
  }

  /**
   * 验证文件类型
   */
  validateFileType(file: File, type: 'avatar' | 'document' | 'product-image'): boolean {
    if (type === 'avatar' || type === 'product-image') {
      return file.type.startsWith('image/');
    }

    const allowedTypes = [
      'image/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    return allowedTypes.some(allowedType => file.type.startsWith(allowedType));
  }

  /**
   * 验证文件大小
   */
  validateFileSize(file: File, type: 'avatar' | 'document' | 'product-image'): boolean {
    const maxSizeMap = {
      'avatar': 2 * 1024 * 1024,
      'document': 5 * 1024 * 1024,
      'product-image': 2 * 1024 * 1024
    };
    const maxSize = maxSizeMap[type];
    return file.size <= maxSize;
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const uploadService = new UploadService();