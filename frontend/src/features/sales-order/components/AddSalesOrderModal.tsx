import React from 'react';
import { Modal, Form, message } from 'antd';
import type { SalesOrderFormData } from '../types';
import { SalesOrderForm } from './SalesOrderForm';

interface AddSalesOrderModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AddSalesOrderModal: React.FC<AddSalesOrderModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: SalesOrderFormData) => {
    try {
      // 模拟API调用
      console.log('提交销售订单数据:', values);
      
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('销售订单创建成功');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('创建销售订单失败:', error);
      message.error('创建销售订单失败');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="新增销售订单"
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      width={1000}
      okText="确定"
      cancelText="取消"
      destroyOnHidden
    >
      <SalesOrderForm
        form={form}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
};