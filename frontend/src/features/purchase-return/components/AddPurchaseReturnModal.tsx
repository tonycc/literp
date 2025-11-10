import React from 'react';
import { Modal } from 'antd';
import { PurchaseReturnForm } from './PurchaseReturnForm';
import type { PurchaseReturnFormData } from '../types';

interface AddPurchaseReturnModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AddPurchaseReturnModal: React.FC<AddPurchaseReturnModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const handleSubmit = async (formData: PurchaseReturnFormData) => {
    try {
      // 这里应该调用实际的API
      console.log('提交退货数据:', formData);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
    } catch (error) {
      console.error('提交失败:', error);
      throw error;
    }
  };

  return (
    <Modal
      title="新增采购退货"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <PurchaseReturnForm
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </Modal>
  );
};