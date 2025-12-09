import { useState } from 'react';
import type { SalesOrder } from '@zyerp/shared';
import type { SalesOrderFormData } from '@zyerp/shared';
import { salesOrderService } from '../services/sales-order.service';
import { useMessage, useModal } from '@/shared/hooks';

export const useSalesOrder = () => {
  const [selectedItems, setSelectedItems] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const message = useMessage();
  const modal = useModal();

  const buildPayload = (values: SalesOrderFormData): Partial<SalesOrder> => {
    const payload: Partial<SalesOrder> = {
      customerName: values.customerName,
      contactPerson: values.contactPerson,
      contactPhone: values.contactPhone,
      orderDate: values.orderDate,
      deliveryDate: values.deliveryDate,
      salesManager: values.salesManager,
      paymentMethod: values.paymentMethod,
      currency: 'CNY',
      remark: values.remark,
      items: (values.items ?? []).map((it) => ({
        id: '', // 新建时后端生成，更新时可能需要处理逻辑
        orderId: '', // 后端关联
        productId: it.productId,
        quantity: it.quantity,
        price: it.unitPriceWithTax,
        amount: (it.quantity || 0) * (it.unitPriceWithTax || 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
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

  const handleDelete = (id: string, onDeleted?: () => void): void => {
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