import React, { useRef } from 'react';
import { Modal } from 'antd';
import type { SalesOrderFormData } from '../types';
import { SalesOrderForm } from './SalesOrderForm';
import { useMessage } from '@/shared/hooks';
import type { ProFormInstance } from '@ant-design/pro-components';

interface AddSalesOrderModalProps {
  visible: boolean;
  onCancel: () => void;
  mode?: 'create' | 'edit';
  initialValues?: Partial<SalesOrderFormData>;
  onSubmit: (values: SalesOrderFormData) => Promise<void>;
  onSuccess?: () => void;
}

export const AddSalesOrderModal: React.FC<AddSalesOrderModalProps> = ({
  visible,
  onCancel,
  mode = 'create',
  initialValues,
  onSubmit,
  onSuccess,
}) => {
  const message = useMessage();
  const formRef = useRef<ProFormInstance<SalesOrderFormData> | undefined>(undefined);

  const handleSubmit = async (values: SalesOrderFormData) => {
    try {
      await onSubmit(values);
      formRef.current?.resetFields();
      onSuccess?.();
    } catch {
      message.error('提交失败');
    }
  };

  const handleCancel = () => {
    formRef.current?.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={mode === 'edit' ? '编辑销售订单' : '新增销售订单'}
      open={visible}
      onCancel={handleCancel}
      onOk={() => formRef.current?.submit?.()}
      width={1000}
      okText="确定"
      cancelText="取消"
      destroyOnClose
    >
      <SalesOrderForm
        formRef={formRef}
        onSubmit={handleSubmit}
        initialValues={initialValues}
      />
    </Modal>
  );
};