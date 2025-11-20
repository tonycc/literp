import React, { useState } from 'react';
import { Modal, Form } from 'antd';
import PurchaseOrderForm from './PurchaseOrderForm';
import type { PurchaseOrderFormData } from '@zyerp/shared';
import { useMessage } from '@/shared/hooks';

interface AddPurchaseOrderModalProps {
  visible: boolean;
  mode?: 'create' | 'edit';
  initialValues?: Partial<PurchaseOrderFormData>;
  onCancel: () => void;
  onSuccess: () => void;
  onSubmit?: (values: PurchaseOrderFormData) => Promise<void> | void;
}

const AddPurchaseOrderModal: React.FC<AddPurchaseOrderModalProps> = ({
  visible,
  mode = 'create',
  initialValues,
  onCancel,
  onSuccess,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const message = useMessage();

  // 处理表单提交
  const handleSubmit = async (values: PurchaseOrderFormData) => {
    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
      message.success(mode === 'create' ? '采购订单创建成功' : '采购订单更新成功');
      form.resetFields();
      onSuccess?.();
    } finally {
      setLoading(false);
    }
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
      title={mode === 'create' ? '新增采购订单' : '编辑采购订单'}
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
        initialValues={initialValues}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </Modal>
  );
};

export default AddPurchaseOrderModal;