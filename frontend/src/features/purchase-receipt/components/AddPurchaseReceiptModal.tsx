import React from 'react';
import { Modal, message } from 'antd';
import PurchaseReceiptForm from './PurchaseReceiptForm';
import type { PurchaseReceiptFormData } from '../types';

interface AddPurchaseReceiptModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddPurchaseReceiptModal: React.FC<AddPurchaseReceiptModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const handleSubmit = (values: PurchaseReceiptFormData) => {
    // 模拟API调用
    console.log('新增采购入库数据:', values);
    
    // 这里应该调用实际的API
    // await createPurchaseReceipt(values);
    
    message.success('新增采购入库成功');
    onSuccess();
  };

  return (
    <Modal
      title="新增采购入库"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <PurchaseReceiptForm onSubmit={handleSubmit} />
    </Modal>
  );
};

export default AddPurchaseReceiptModal;