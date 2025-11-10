import React, { useState } from 'react';
import { Modal, Form, message } from 'antd';
import PurchaseOrderForm from './PurchaseOrderForm';
import type { PurchaseOrderFormData } from '../types';

interface AddPurchaseOrderModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddPurchaseOrderModal: React.FC<AddPurchaseOrderModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 处理表单提交
  const handleSubmit = (values: PurchaseOrderFormData) => {
    setLoading(true);
    
    // 模拟 API 调用
    console.log('新增采购订单数据:', values);
    
    setTimeout(() => {
      message.success('采购订单创建成功');
      form.resetFields();
      setLoading(false);
      onSuccess?.();
    }, 1000);
  };

  // 处理取消
  const handleCancel = () => {
    if (loading) {
      return;
    }
    form.resetFields();
    onCancel();
  };

  // 处理确定按钮
  const handleOk = () => {
    form.submit();
  };

  return (
    <Modal
      title="新增采购订单"
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      width={1000}
      confirmLoading={loading}
      destroyOnHidden
      maskClosable={false}
      okText="保存"
      cancelText="取消"
    >
      <PurchaseOrderForm
        form={form}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </Modal>
  );
};

export default AddPurchaseOrderModal;