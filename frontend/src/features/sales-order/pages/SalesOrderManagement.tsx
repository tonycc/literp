import React, { useState } from 'react';
import { SalesOrderList } from '../components/SalesOrderList';
import type { SalesOrder, SalesOrderFormItem } from '@zyerp/shared';
import { type SalesOrderFormData, type SalesOrderPaymentMethodType } from '@zyerp/shared';
import { AddSalesOrderModal } from '../components/AddSalesOrderModal';
import { useSalesOrder } from '../hooks/useSalesOrder';
import { SalesOrderDetail } from '../components/SalesOrderDetail';

export const SalesOrderManagement: React.FC = () => {

  const { handleCreate, handleUpdate, handleDelete } = useSalesOrder();

  const [refreshKey, setRefreshKey] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [current, setCurrent] = useState<SalesOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleAdd = () => {
    setEditorMode('create');
    setCurrent(null);
    setEditorOpen(true);
  };

  const handleView = (item: SalesOrder) => {
    setCurrent(item);
    setDetailOpen(true);
  };

  const handleEdit = (item: SalesOrder) => {
    setEditorMode('edit');
    setCurrent(item);
    setEditorOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    handleDelete(id, () => {
      setRefreshKey((k) => k + 1);
    });
  };

 



  const submitEditor = async (values: SalesOrderFormData) => {
    if (editorMode === 'create') {
      const ok = await handleCreate(values);
      if (ok) {
        setEditorOpen(false);
        setRefreshKey((k) => k + 1);
      }
    } else if (current) {
      const ok = await handleUpdate(current.id, values);
      if (ok) {
        setEditorOpen(false);
        setRefreshKey((k) => k + 1);
      }
    }
  };

  const initialFormValues = (): Partial<SalesOrderFormData> | undefined => {
    if (!current) return undefined;

    const items: SalesOrderFormItem[] = (current.items || []).map((item) => ({
      productId: item.productId,
      productName: item.product?.name,
      productCode: item.product?.code,
      specification: '',
      unit: item.unit?.name,
      quantity: item.quantity,
      unitPriceWithTax: item.price || 0,
    }));

    return {
      customerName: current.customerName || '',
      orderDate: current.orderDate,
      deliveryDate: current.deliveryDate || '',
      salesManager: current.salesManager || '',
      contactInfo: '',
      contactPerson: (current.contactPerson as string) || '',
      contactPhone: (current.contactPhone as string) || '',
      taxRate: 13,
      paymentMethod: (current.paymentMethod as SalesOrderPaymentMethodType) || 'cash',
      plannedPaymentDate: current.orderDate,
      remark: current.remark,
      items,
      totalPriceWithTax: current.totalAmount,
    };
  };

  return (
    <>
      <SalesOrderList
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteItem}
        refreshKey={refreshKey}
      />
      <AddSalesOrderModal
        visible={editorOpen}
        onCancel={() => setEditorOpen(false)}
        mode={editorMode}
        initialValues={initialFormValues()}
        onSubmit={submitEditor}
        onSuccess={() => {}}
      />
      <SalesOrderDetail visible={detailOpen} orderId={current?.id} onClose={() => setDetailOpen(false)} />
    </>
  );
};

export default SalesOrderManagement;