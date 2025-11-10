/**
 * 头像上传组件
 */

import React, { useState } from 'react';
import { Upload, Avatar, Button, message, Spin } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { uploadService, type FileUploadResult } from '../../services/upload.service';
import type { UploadProps } from 'antd';

interface AvatarUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  size?: number;
  disabled?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value,
  onChange,
  size = 100,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(value || '');

  const beforeUpload = (file: File) => {
    // 验证文件类型
    if (!uploadService.validateFileType(file, 'avatar')) {
      message.error('只能上传图片文件！');
      return false;
    }

    // 验证文件大小
    if (!uploadService.validateFileSize(file, 'avatar')) {
      message.error('图片大小不能超过2MB！');
      return false;
    }

    return true;
  };

  const handleUpload = async (file: File) => {
    try {
      setLoading(true);
      const result: FileUploadResult = await uploadService.uploadAvatar(file);
      
      if (result.success && result.url) {
        const fullUrl = uploadService.getFileUrl(result.file!.filename, 'avatar');
        setImageUrl(fullUrl);
        onChange?.(fullUrl);
        message.success('头像上传成功！');
      } else {
        message.error(result.message || '头像上传失败');
      }
    } catch (error) {
      console.error('头像上传失败:', error);
      message.error('头像上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'avatar',
    showUploadList: false,
    beforeUpload: (file) => {
      if (beforeUpload(file)) {
        handleUpload(file);
      }
      return false; // 阻止默认上传行为
    },
    disabled: disabled || loading
  };

  return (
    <div className="avatar-upload" style={{ textAlign: 'center' }}>
      <Spin spinning={loading}>
        <Avatar
          size={size}
          src={imageUrl}
          icon={!imageUrl && <UserOutlined />}
          style={{ marginBottom: 16 }}
        />
      </Spin>
      <div>
        <Upload {...uploadProps}>
          <Button 
            icon={<UploadOutlined />} 
            disabled={disabled || loading}
            loading={loading}
          >
            {loading ? '上传中...' : '更换头像'}
          </Button>
        </Upload>
        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          支持 JPG、PNG 格式，文件大小不超过 2MB
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;