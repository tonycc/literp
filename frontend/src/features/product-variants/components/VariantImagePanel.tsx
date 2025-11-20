import React, { useEffect, useState } from 'react';
import { Modal, Upload, Button, Image, Space } from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import { useMessage } from '@/shared/hooks';
import { ProductVariantsService } from '../services/product-variants.service';

interface VariantImagePanelProps {
  productId: string;
  variantId: string;
  visible: boolean;
  onClose: () => void;
}

const VariantImagePanel: React.FC<VariantImagePanelProps> = ({ productId, variantId, visible, onClose }) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const message = useMessage();

  const loadImages = async () => {
    try {
      const resp = await ProductVariantsService.listVariantImages(productId, variantId);
      const list = (resp.data || []).map((img) => ({
        uid: img.id,
        name: img.id,
        status: 'done',
        url: img.url,
      } as UploadFile));
      setFiles(list);
    } catch {
      message.error('加载图片失败');
    }
  };

  useEffect(() => {
    if (visible) loadImages();
  }, [visible]);

  const handleUpload = async ({ file }: { file: File }) => {
    try {
      const resp = await ProductVariantsService.uploadVariantImage(productId, variantId, file);
      if (resp.success) {
        message.success('上传成功');
        await loadImages();
      } else {
        message.error(resp.message || '上传失败');
      }
    } catch {
      message.error('上传失败');
    }
  };

  const handleRemove = async (file: UploadFile) => {
    try {
      const resp = await ProductVariantsService.deleteVariantImage(productId, variantId, String(file.uid));
      if (resp.success) {
        message.success('删除成功');
        await loadImages();
      } else {
        message.error(resp.message || '删除失败');
      }
    } catch {
      message.error('删除失败');
    }
    return true;
  };

  return (
    <Modal title="图片管理" open={visible} onCancel={onClose} footer={null} destroyOnHidden>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Upload
          fileList={files}
          listType="picture-card"
          customRequest={handleUpload}
          onRemove={handleRemove}
        >
          <div>
            <Button type="primary">上传</Button>
          </div>
        </Upload>
        <div>
          {files.map((f) => (
            <Image key={f.uid} width={80} src={f.url as string} />
          ))}
        </div>
      </Space>
    </Modal>
  );
};

export default VariantImagePanel;
