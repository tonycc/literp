import React, { useState } from 'react';
import { Modal, Form, message } from 'antd';
import SalesReceiptForm from './SalesReceiptForm';
import type { SalesReceiptFormData } from '../types';

interface AddSalesReceiptModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddSalesReceiptModal: React.FC<AddSalesReceiptModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成出库单编号（模拟）
      const receiptNumber = `SR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      const receiptData: SalesReceiptFormData = {
        ...values,
        receiptNumber,
        createdAt: new Date().toISOString(),
      };

      console.log('新增销售出库单:', receiptData);
      
      message.success('销售出库单创建成功！');
      form.resetFields();
      onSuccess();
    } catch (error) {
      if (error instanceof Error) {
        message.error(`创建失败: ${error.message}`);
      } else {
        message.error('创建销售出库单失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="新增销售出库单"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={1000}
      okText="确认创建"
      cancelText="取消"
      destroyOnHidden
    >
      <SalesReceiptForm form={form} />
    </Modal>
  );
};

export default AddSalesReceiptModal;