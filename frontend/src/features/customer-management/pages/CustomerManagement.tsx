/**
 * 客户信息管理主页面组件
 */

import React, { useState, useRef } from 'react';
import { AddCustomerModal } from '../components/AddCustomerModal';
import CustomerDetail from '../components/CustomerDetail';
import type { ActionType } from '@ant-design/pro-components';
import type { Customer } from '../types';
import { customerService } from '../services/customer.service';
import { useMessage } from '@/shared/hooks';
import { useCustomer } from '../hooks/useCustomer';
import CustomerList from '../components/CustomerList';

const CustomerManagement: React.FC = () => {
  const message = useMessage();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const actionRef = useRef<ActionType>(undefined);

  const {
    handleDelete: hookHandleDelete,
    handleBatchDelete: hookHandleBatchDelete,
  } = useCustomer(() => void actionRef.current?.reload?.());

  const handleDelete = (id: string) => {
    hookHandleDelete(id);
  };

  const handleBatchDelete = () => {
    hookHandleBatchDelete(selectedRowKeys as string[]);
  };

  const handleView = async (record: Customer) => {
    try {
      const res = await customerService.getById(record.id);
      if (res.success) {
        setDetailCustomer(res.data || null);
        setDetailOpen(true);
      } else {
        message.error(res.message || '加载失败');
      }
    } catch {
      message.error('加载失败');
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <CustomerList
        actionRef={actionRef}
        selectedRowKeys={selectedRowKeys}
        onSelectChange={setSelectedRowKeys}
        onAdd={() => {
          setEditingCustomerId(null);
          setAddModalOpen(true);
        }}
        onEdit={(id: string) => {
          setEditingCustomerId(id);
          setAddModalOpen(true);
        }}
        onView={(record: Customer) => void handleView(record)}
        onDelete={(id: string) => void handleDelete(id)}
        onBatchDelete={() => void handleBatchDelete()}
        onExport={() => {
          message.info('导出功能开发中...');
        }}
      />

      {/* 新增客户弹窗 */}
      <AddCustomerModal
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          setEditingCustomerId(null);
        }}
        onSuccess={() => {
          setAddModalOpen(false);
          setEditingCustomerId(null);
          void actionRef.current?.reload?.();
          setSelectedRowKeys([]);
        }}
        customerId={editingCustomerId || undefined}
      />

      <CustomerDetail
        open={detailOpen}
        customer={detailCustomer}
        onClose={() => {
          setDetailOpen(false);
          setDetailCustomer(null);
        }}
      />
    </div>
  );
};

export default CustomerManagement;
