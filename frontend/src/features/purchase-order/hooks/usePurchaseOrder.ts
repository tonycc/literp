import { useState } from 'react';
import type { PurchaseOrder, PurchaseOrderFormData } from '@zyerp/shared';
import { purchaseOrderService } from '../services/purchase-order.service';
import { useMessage, useModal } from '@/shared/hooks';

export const usePurchaseOrder = () => {
  const [selectedItems, setSelectedItems] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const message = useMessage();
  const modal = useModal();

  

  const handleCreate = async (values: PurchaseOrderFormData): Promise<PurchaseOrder | null> => {
    setLoading(true);
    try {
      const res = await purchaseOrderService.create(values);
      if (res.success) {
        message.success('创建成功');
        return res.data as unknown as PurchaseOrder;
      }
      message.error(res.message || '创建失败');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, values: PurchaseOrderFormData): Promise<PurchaseOrder | null> => {
    setLoading(true);
    try {
      const res = await purchaseOrderService.update(id, values);
      if (res.success) {
        message.success('更新成功');
        return res.data as unknown as PurchaseOrder;
      }
      message.error(res.message || '更新失败');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, onDeleted?: () => void): Promise<void> => {
    modal.confirm({
      title: '确认删除',
      content: '删除后不可恢复，是否继续？',
      onOk: async () => {
        setLoading(true);
        try {
          const res = await purchaseOrderService.delete(id);
          if (res.success) {
            message.success('删除成功');
            onDeleted?.();
          } else {
            message.error(res.message || '删除失败');
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleRefresh = async () => {
    return Promise.resolve();
  };

  return {
    selectedItems,
    setSelectedItems,
    loading,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleRefresh,
  };
};

export default usePurchaseOrder;