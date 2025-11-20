import React, { useState } from 'react';
import { SalesOrderList } from './SalesOrderList';
import type { SalesOrder } from '@zyerp/shared';
import type { SalesOrderFormData } from '../types';
import { SalesOrderPaymentMethod } from '@/shared/constants/sales-order';
import { PaymentMethod } from '../types';
import { AddSalesOrderModal } from './AddSalesOrderModal';
import { useSalesOrder } from '../hooks/useSalesOrder';
import { SalesOrderDetail } from './SalesOrderDetail';

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
    return {
      customerName: current.customerName || '',
      orderDate: current.orderDate,
      deliveryDate: current.deliveryDate,
      salesManager: current.salesManager || '',
      productName: '',
      productCode: '',
      specification: '',
      unit: '',
      quantity: 1,
      unitPriceWithTax: 0,
      taxRate: 13,
      paymentMethod: ((current.paymentMethod || SalesOrderPaymentMethod.CASH) as unknown) as PaymentMethod,
      plannedPaymentDate: current.orderDate,
      remark: current.remark,
    };
  };

  return (
    <>
      <SalesOrderList
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
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