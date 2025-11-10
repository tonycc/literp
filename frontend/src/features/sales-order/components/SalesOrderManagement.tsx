import React from 'react';
import { SalesOrderList } from './SalesOrderList';
import type { SalesOrder } from '../types';
import { useMessage, useModal } from '@/shared/hooks';

export const SalesOrderManagement: React.FC = () => {
  const message = useMessage();
  const modal = useModal();

  const handleAdd = () => {
    message.info('待实现：新增销售订单');
  };

  const handleView = (item: SalesOrder) => {
    modal.info({ title: '查看订单', content: `订单号：${item.id}` });
  };

  const handleEdit = (item: SalesOrder) => {
    modal.info({ title: '编辑订单', content: `待实现：编辑 ${item.id}` });
  };

  const handleDelete = async (id: string) => {
    message.warning(`待实现：删除订单 ${id}`);
  };

  return (
        <SalesOrderList
          onAdd={handleAdd}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
  );
};

export default SalesOrderManagement;