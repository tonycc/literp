import React, { useState, useRef } from 'react';
import type { CustomerPriceList, CreateCustomerPriceListData, UpdateCustomerPriceListData } from '../types';
import { PriceListStatus, VATRate, Unit } from '../types';
import CustomerPriceListList from './CustomerPriceListList';
import CustomerPriceListForm from './CustomerPriceListForm';
import { Modal } from 'antd';
import { useMessage, useModal } from '@/shared/hooks';
import { customerPriceListService } from '../services/customer-price-list.service';

const CustomerPriceListManagement: React.FC = () => {
  const message = useMessage();
  const modal = useModal();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const listRef = useRef<{ reload: () => void } | null>(null);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    modal.confirm({
      title: '确定要删除这条价格表记录吗？',
      onOk: async () => {
        try {
          const res = await customerPriceListService.delete(id);
          if (res.success) {
            message.success('删除成功');
            listRef.current?.reload?.();
          } else {
            message.error(res.message || '删除失败');
          }
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  // 处理编辑
  const handleEdit = (record: CustomerPriceList) => {
    console.log('编辑记录:', record);
    message.info('编辑功能开发中...');
  };

  // 处理新增
  const handleAdd = () => {
    setAddModalOpen(true);
  };

  const toDateString = (v: unknown): string | undefined => {
    if (!v) return undefined;
    if (typeof v === 'string') return v;
    const maybe = v as { format?: (fmt: string) => string };
    return typeof maybe.format === 'function' ? maybe.format('YYYY-MM-DD') : undefined;
  };

  type SubmitValues = (CreateCustomerPriceListData | UpdateCustomerPriceListData) & { effectiveDate?: unknown; expiryDate?: unknown };
  const handleSubmit = async (values: SubmitValues) => {
    setAddLoading(true);
    try {
      const base = values as Partial<CreateCustomerPriceListData>;
      const payload: CreateCustomerPriceListData = {
        customerId: String(base.customerId || ''),
        productName: String(base.productName || ''),
        productCode: String(base.productCode || ''),
        unit: String(base.unit || Unit.PCS) as Unit,
        priceIncludingTax: Number(base.priceIncludingTax ?? 0),
        vatRate: Number(base.vatRate ?? VATRate.RATE_13) as VATRate,
        salesManager: String(base.salesManager || ''),
        customerProductCode: base.customerProductCode,
        specification: base.specification,
        productImage: base.productImage,
        effectiveDate: toDateString((values as { effectiveDate?: unknown }).effectiveDate) || '',
        expiryDate: toDateString((values as { expiryDate?: unknown }).expiryDate),
        status: (typeof base.status === 'string' ? base.status : PriceListStatus.ACTIVE) as PriceListStatus,
      };
      const res = await customerPriceListService.create(payload);
      if (res.success) {
        message.success('客户价格表创建成功');
        setAddModalOpen(false);
        listRef.current?.reload?.();
      } else {
        message.error(res.message || '创建失败');
      }
    } catch {
      message.error('创建失败，请重试');
    } finally {
      setAddLoading(false);
    }
  };

  

  return (
    <div style={{ padding: '0' }}>
      <CustomerPriceListList
        ref={listRef}
        onAdd={handleAdd}
        onEdit={(record: CustomerPriceList) => handleEdit(record)}
        onDelete={(id: string) => handleDelete(id)}
        selectedRowKeys={selectedRowKeys}
        onSelectChange={onSelectChange}
      />

      <Modal
        title="新增客户价格表"
        open={addModalOpen}
        onCancel={() => setAddModalOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <CustomerPriceListForm
          onSubmit={(values) => handleSubmit(values)}
          loading={addLoading}
        />
      </Modal>
    </div>
  );
};

export default CustomerPriceListManagement;
  