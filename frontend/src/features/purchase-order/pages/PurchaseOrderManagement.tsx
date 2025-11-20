import React, { useState } from 'react';
import { PurchaseOrderList } from '../components/PurchaseOrderList';
import type { PurchaseOrder, PurchaseOrderDetail, PurchaseOrderFormData } from '@zyerp/shared';
import { useModal } from '@/shared/hooks';
import AddPurchaseOrderModal from '../components/AddPurchaseOrderModal';
import { usePurchaseOrder } from '../hooks/usePurchaseOrder';

const PurchaseOrderManagement: React.FC = () => {
  const modal = useModal();
  const { handleCreate, handleUpdate, handleDelete } = usePurchaseOrder();

  const [refreshKey, setRefreshKey] = useState(0);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [current, setCurrent] = useState<(PurchaseOrderDetail & { expectedDeliveryDate?: string }) | null>(null);

  const handleAdd = () => {
    setEditorMode('create');
    setCurrent(null);
    setEditorOpen(true);
  };

  const handleView = (item: PurchaseOrder) => {
    modal.info({ title: '查看采购订单', content: `订单号：${item.orderNo || item.id}` });
  };

  const handleEdit = (item: PurchaseOrder) => {
    setEditorMode('edit');
    setCurrent(item as unknown as PurchaseOrderDetail);
    setEditorOpen(true);
  };

  const handleDeleteFn = async (id: string) => {
    await handleDelete(id, () => setRefreshKey((k) => k + 1));
  };

  const submitEditor = async (values: PurchaseOrderFormData) => {
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

  const initialFormValues = (): Partial<PurchaseOrderFormData> | undefined => {
    if (!current) return undefined;
    const expected = current.expectedDeliveryDate;
    return {
      supplierId: current.supplierId,
      orderDate: current.orderDate,
      expectedDeliveryDate: expected,
      remark: current.remark,
      items: (current.items || []).map((it) => ({
        productId: it.productId,
        quantity: Number(it.quantity) || 0,
        price: typeof it.price === 'number' ? it.price : 0,
      })),
    };
  };

  return (
    <>
      <PurchaseOrderList
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteFn}
        refreshKey={refreshKey}
      />
      <AddPurchaseOrderModal
        visible={editorOpen}
        mode={editorMode}
        initialValues={initialFormValues()}
        onCancel={() => setEditorOpen(false)}
        onSubmit={submitEditor}
        onSuccess={() => {}}
      />
    </>
  );
};

export default PurchaseOrderManagement;