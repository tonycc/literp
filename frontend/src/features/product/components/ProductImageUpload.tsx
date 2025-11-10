import React, { useState } from 'react';
import { Upload, Modal, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { uploadService, type ProductImageUploadResult } from '../../../features/file-management/services/upload.service';

interface ProductImageUploadProps {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  maxCount?: number;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  value = [],
  onChange,
  maxCount = 5
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [setUploading] = useState(false);

  // 处理预览
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
    setPreviewTitle(file.name || '图片预览');
  };

  // 处理文件变化
  const handleChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
    // 过滤掉被删除的文件
    const filteredList = newFileList.filter(file => file.status !== 'removed');

    // 处理新上传的文件
    const newFiles = newFileList.filter(file => file.originFileObj && file.status === 'uploading');

    if (newFiles.length > 0) {
      setUploading(true);
      try {
        const filesToUpload = newFiles.map(f => f.originFileObj as File);
        const uploadResults = await uploadService.uploadProductImages(filesToUpload);

        // 将上传结果转换为UploadFile格式
        const uploadedFileList: UploadFile[] = uploadResults.map((result, index) => ({
          uid: result.id,
          name: result.name,
          status: 'done' as const,
          url: result.url,
          response: result,
          size: result.size,
          type: result.type
        }));

        // 合并已存在的文件和新增的文件
        const allFiles = [...filteredList.filter(f => f.status !== 'uploading'), ...uploadedFileList];
        onChange?.(allFiles);
      } catch (error) {
        console.error('图片上传失败:', error);
        message.error('图片上传失败，请重试');
        onChange?.(filteredList);
      } finally {
        setUploading(false);
      }
    } else {
      onChange?.(filteredList);
    }
  };

  // 删除图片
  const handleRemove = async (file: UploadFile) => {
    try {
      if (file.response && (file.response as ProductImageUploadResult).id) {
        const imageId = (file.response as ProductImageUploadResult).id;
        await uploadService.deleteProductImage(imageId);
      }
      message.success('图片删除成功');
      return true;
    } catch (error) {
      console.error('删除图片失败:', error);
      message.error('删除图片失败');
      return false;
    }
  };

  // 自定义上传请求
  const customUploadRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;

    try {
      // 文件验证
      if (!uploadService.validateFileType(file, 'product-image')) {
        throw new Error('只支持图片文件（JPG、PNG、GIF等）');
      }

      if (!uploadService.validateFileSize(file, 'product-image')) {
        throw new Error('图片大小不能超过2MB');
      }

      // 直接返回，不在这里上传，在onChange中处理
      onSuccess({}, file);
    } catch (error) {
      onError(error);
    }
  };

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={value}
        onChange={handleChange}
        onPreview={handlePreview}
        onRemove={handleRemove}
        customRequest={customUploadRequest}
        multiple
        accept="image/*"
        beforeUpload={() => false} // 阻止自动上传
        showUploadList={{
          showRemoveIcon: true,
          showPreviewIcon: true,
        }}
      >
        {value.length >= maxCount ? null : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传图片</div>
          </div>
        )}
      </Upload>

      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        centered
      >
        <img alt="预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

// 将文件转换为Base64
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

export default ProductImageUpload;
