/**
 * 文档上传组件
 */

import React, { useState } from 'react';
import { Upload, Button, List, message, Progress, Space, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { uploadService, type UploadedFile, type FileUploadResult } from '../../services/upload.service';
import type { UploadProps } from 'antd';

const { Text } = Typography;

interface DocumentUploadProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  maxCount?: number;
  disabled?: boolean;
  accept?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  value = [],
  onChange,
  maxCount = 10,
  disabled = false,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [fileList, setFileList] = useState<UploadedFile[]>(value);

  const beforeUpload = (file: File) => {
    // 验证文件类型
    if (!uploadService.validateFileType(file, 'document')) {
      message.error(`不支持的文件类型: ${file.name}`);
      return false;
    }

    // 验证文件大小
    if (!uploadService.validateFileSize(file, 'document')) {
      message.error(`文件 ${file.name} 大小不能超过5MB！`);
      return false;
    }

    // 验证文件数量
    if (fileList.length >= maxCount) {
      message.error(`最多只能上传 ${maxCount} 个文件！`);
      return false;
    }

    return true;
  };

  const handleUpload = async (files: File[]) => {
    try {
      setUploading(true);
      
      // 模拟上传进度
      files.forEach((file, index) => {
        const fileId = `${file.name}_${Date.now()}_${index}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        // 模拟进度更新
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[fileId] || 0;
            if (currentProgress >= 90) {
              clearInterval(interval);
              return prev;
            }
            return { ...prev, [fileId]: currentProgress + 10 };
          });
        }, 200);
      });

      const results: FileUploadResult[] = await uploadService.uploadDocuments(files);
      
      const successFiles: UploadedFile[] = [];
      const failedFiles: string[] = [];

      results.forEach((result, index) => {
        const fileId = `${files[index].name}_${Date.now()}_${index}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        if (result.success && result.file) {
          successFiles.push(result.file);
        } else {
          failedFiles.push(files[index].name);
        }
      });

      if (successFiles.length > 0) {
        const newFileList = [...fileList, ...successFiles];
        setFileList(newFileList);
        onChange?.(newFileList);
        message.success(`成功上传 ${successFiles.length} 个文件`);
      }

      if (failedFiles.length > 0) {
        message.error(`以下文件上传失败: ${failedFiles.join(', ')}`);
      }

      // 清除进度
      setTimeout(() => {
        setUploadProgress({});
      }, 1000);

    } catch (error) {
      console.error('文件上传失败:', error);
      message.error('文件上传失败，请重试');
      setUploadProgress({});
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    try {
      await uploadService.deleteFile(file.filename, 'document');
      const newFileList = fileList.filter(f => f.id !== file.id);
      setFileList(newFileList);
      onChange?.(newFileList);
      message.success('文件删除成功');
    } catch (error) {
      console.error('文件删除失败:', error);
      message.error('文件删除失败');
    }
  };

  const handlePreview = (file: UploadedFile) => {
    const url = uploadService.getFileUrl(file.filename, 'document');
    window.open(url, '_blank');
  };

  const handleDownload = (file: UploadedFile) => {
    const url = uploadService.getFileUrl(file.filename, 'document');
    const link = document.createElement('a');
    link.href = url;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadProps: UploadProps = {
    name: 'documents',
    multiple: true,
    showUploadList: false,
    accept,
    beforeUpload: (file, fileList) => {
      void file;
      const validFiles = fileList.filter(f => beforeUpload(f));
      if (validFiles.length > 0) {
        handleUpload(validFiles);
      }
      return false; // 阻止默认上传行为
    },
    disabled: disabled || uploading
  };

  return (
    <div className="document-upload">
      <div style={{ marginBottom: 16 }}>
        <Upload {...uploadProps}>
          <Button 
            icon={<UploadOutlined />} 
            disabled={disabled || uploading || fileList.length >= maxCount}
            loading={uploading}
          >
            {uploading ? '上传中...' : '选择文件'}
          </Button>
        </Upload>
        <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
          支持 PDF、Word、Excel、图片等格式，单个文件不超过 5MB，最多 {maxCount} 个文件
        </Text>
      </div>

      {/* 上传进度 */}
      {Object.keys(uploadProgress).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12 }}>{fileId.split('_')[0]}</Text>
              <Progress percent={progress} size="small" />
            </div>
          ))}
        </div>
      )}

      {/* 文件列表 */}
      {fileList.length > 0 && (
        <List
          size="small"
          dataSource={fileList}
          renderItem={(file) => (
            <List.Item
              actions={[
                <Button
                  key="preview"
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(file)}
                >
                  预览
                </Button>,
                <Button
                  key="download"
                  type="link"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(file)}
                >
                  下载
                </Button>,
                <Button
                  key="delete"
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(file)}
                  disabled={disabled}
                >
                  删除
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text>{file.originalName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ({uploadService.formatFileSize(file.size)})
                    </Text>
                  </Space>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    上传时间: {new Date(file.uploadedAt).toLocaleString()}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default DocumentUpload;