import React from 'react';
import { Modal, message } from 'antd';
import CustomerForm from './CustomerForm';
import type { CreateCustomerData, UpdateCustomerData } from '../types';

interface AddCustomerModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (data: CreateCustomerData | UpdateCustomerData) => {
    try {
      setLoading(true);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('新增客户数据:', data);
      message.success('客户信息保存成功！');
      
      // 成功后关闭弹窗并刷新列表
      onSuccess();
    } catch (error) {
      console.error('保存客户信息失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onCancel();
    }
  };

  return (
    <Modal
      title="新增客户"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnHidden
      maskClosable={!loading}
      closable={!loading}
    >
      <CustomerForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </Modal>
  );
};