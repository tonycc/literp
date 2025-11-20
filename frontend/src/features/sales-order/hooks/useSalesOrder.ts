import { useState } from 'react';
import type { SalesOrder } from '@zyerp/shared';
import type { SalesOrderFormData } from '../types';
import { salesOrderService } from '../services/sales-order.service';
import { useMessage, useModal } from '@/shared/hooks';

export const useSalesOrder = () => {
  const [selectedItems, setSelectedItems] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const message = useMessage();
  const modal = useModal();

  const buildPayload = (values: SalesOrderFormData) => {
    const payload: Record<string, unknown> = {
      customerName: values.customerName,
      orderDate: values.orderDate,
      deliveryDate: values.deliveryDate,
      salesManager: values.salesManager,
      paymentMethod: values.paymentMethod,
      currency: 'CNY',
      remark: values.remark,
      items: Array.isArray(values.items) && values.items?.length
        ? values.items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            price: it.unitPriceWithTax,
          }))
        : [
          {
            productId: (values as unknown as { productId?: string }).productId || '',
            quantity: Number((values as unknown as { quantity?: number }).quantity || 0),
            price: Number((values as unknown as { unitPriceWithTax?: number }).unitPriceWithTax || 0),
          },
        ],
    };
    return payload;
  };

  const handleCreate = async (values: SalesOrderFormData): Promise<SalesOrder | null> => {
    setLoading(true);
    try {
      const payload = buildPayload(values);
      const res = await salesOrderService.createSalesOrder(payload);
      if (res.success) {
        message.success('创建成功');
        return res.data as unknown as SalesOrder;
      }
      message.error(res.message || '创建失败');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, values: SalesOrderFormData): Promise<SalesOrder | null> => {
    setLoading(true);
    try {
      const payload = buildPayload(values);
      const res = await salesOrderService.updateSalesOrder(id, payload);
      if (res.success) {
        message.success('更新成功');
        return res.data as unknown as SalesOrder;
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
          const res = await salesOrderService.deleteSalesOrder(id);
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
    // 由调用方触发表格刷新（actionRef.reload），此处仅预留接口
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

export default useSalesOrder;