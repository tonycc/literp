import React from 'react';
import { Modal, Form, message } from 'antd';
import CustomerPriceListForm from './CustomerPriceListForm';
import type { CreateCustomerPriceListData, UpdateCustomerPriceListData } from '../types';

interface AddCustomerPriceListModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AddCustomerPriceListModal: React.FC<AddCustomerPriceListModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  // 处理表单提交
  const handleSubmit = async (values: CreateCustomerPriceListData | UpdateCustomerPriceListData) => {
    setLoading(true);
    try {
      // 这里应该调用实际的API
      console.log('提交客户价格表数据:', values);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('客户价格表创建成功');
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error('创建失败，请重试');
      console.error('创建客户价格表失败:', error);
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
      title="新增客户价格表"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnHidden
    >
      <CustomerPriceListForm
        form={form}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </Modal>
  );
};

export default AddCustomerPriceListModal;