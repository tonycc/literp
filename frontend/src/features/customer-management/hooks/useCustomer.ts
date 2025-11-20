import { useState, useCallback } from 'react';
import type { Customer } from '@zyerp/shared';
import { customerService } from '../services/customer.service';
import { useMessage, useModal } from '@/shared/hooks';

export const useCustomer = (reload?: () => void) => {
  const message = useMessage();
  const modal = useModal();
  const [selectedItems, setSelectedItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRefresh = useCallback(() => {
    void reload?.();
  }, [reload]);

  const handleDelete = useCallback((id: string) => {
    modal.confirm({
      title: '确定要删除这个客户吗？',
      content: '删除后无法恢复，请确认操作。',
      onOk: async () => {
        try {
          setLoading(true);
          const res = await customerService.delete(id);
          if (res.success) {
            message.success('删除成功');
            handleRefresh();
          } else {
            message.error(res.message || '删除失败');
          }
        } catch {
          message.error('删除失败');
        } finally {
          setLoading(false);
        }
      },
    });
  }, [modal, message, handleRefresh]);

  const handleBatchDelete = useCallback((ids: string[]) => {
    modal.confirm({
      title: '确定要删除选中的客户吗？',
      content: `将删除 ${ids.length} 个客户，删除后无法恢复，请确认操作。`,
      onOk: async () => {
        try {
          setLoading(true);
          for (const id of ids) {
            await customerService.delete(id);
          }
          message.success('批量删除成功');
          setSelectedItems([]);
          handleRefresh();
        } catch {
          message.error('批量删除失败');
        } finally {
          setLoading(false);
        }
      },
    });
  }, [modal, message, handleRefresh]);

  const handleCreate = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleUpdate = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  return {
    selectedItems,
    setSelectedItems,
    loading,
    setLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBatchDelete,
    handleRefresh,
  };
};