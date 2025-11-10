/**
 * File Management Feature Module
 * 文件管理功能模块
 */

// Components
export { default as FileManagerPage } from './components/FileManager';
export { AvatarUpload, DocumentUpload } from './components/Upload';

// Services
export * from './services/upload.service';

// Types 已统一到服务层导出