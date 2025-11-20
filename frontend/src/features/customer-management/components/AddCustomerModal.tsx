import React from 'react';
import { Modal } from 'antd';
import CustomerForm from './CustomerForm';
import type { CreateCustomerData, UpdateCustomerData, Customer } from '@zyerp/shared';
import { customerService } from '../services/customer.service';
import { useMessage } from '@/shared/hooks';

interface AddCustomerModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  customerId?: string;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  open,
  onCancel,
  onSuccess,
  customerId,
}) => {
  const [loading, setLoading] = React.useState(false);
  const message = useMessage();
  const [customer, setCustomer] = React.useState<Customer | undefined>(undefined);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (open && customerId) {
        try {
          setLoading(true);
          const res = await customerService.getById(customerId);
          if (mounted) {
            if (res.success) {
              setCustomer(res.data);
            } else {
              message.error(res.message || '加载失败');
            }
          }
        } catch {
          if (mounted) message.error('加载失败');
        } finally {
          if (mounted) setLoading(false);
        }
      } else if (open && !customerId) {
        setCustomer(undefined);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [open, customerId, message]);

  const handleSubmit = async (data: CreateCustomerData | UpdateCustomerData) => {
    try {
      setLoading(true);
      if ('id' in data && data.id) {
        const res = await customerService.update(data.id, data);
        if (res.success) message.success('客户信息更新成功');
        else message.error(res.message || '更新失败');
      } else {
        const res = await customerService.create(data as CreateCustomerData);
        if (res.success) message.success('客户信息保存成功');
        else message.error(res.message || '保存失败');
      }
      
      // 成功后关闭弹窗并刷新列表
      onSuccess();
    } catch {
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
      title={customerId ? '编辑客户' : '新增客户'}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose
      maskClosable={!loading}
      closable={!loading}
    >
      <CustomerForm
        customer={customer}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </Modal>
  );
};