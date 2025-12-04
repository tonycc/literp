import { useState, useCallback } from 'react';
import { useMessage, useModal } from '@/shared/hooks';
import { customerPriceListService } from '../services/customer-price-list.service';
import type { CreateCustomerPriceListData, UpdateCustomerPriceListData } from '@zyerp/shared';

export const useCustomerPriceList = (reload?: () => void) => {
  const message = useMessage();
  const modal = useModal();
  const [loading, setLoading] = useState(false);

  const handleRefresh = useCallback(() => reload?.(), [reload]);

  const handleCreate = useCallback(async (data: CreateCustomerPriceListData) => {
    try {
      setLoading(true);
      const res = await customerPriceListService.create(data);
      if (res.success) {
        message.success('创建成功');
        handleRefresh();
        return true;
      } else {
        message.error(res.message || '创建失败');
        return false;
      }
    } catch {
      message.error('创建失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [message, handleRefresh]);

  const handleUpdate = useCallback(async (id: string, data: UpdateCustomerPriceListData) => {
    try {
      setLoading(true);
      const res = await customerPriceListService.update(id, data);
      if (res.success) {
        message.success('更新成功');
        handleRefresh();
        return true;
      } else {
        message.error(res.message || '更新失败');
        return false;
      }
    } catch {
      message.error('更新失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [message, handleRefresh]);

  const handleDelete = useCallback((id: string) => {
    modal.confirm({
      title: '确定要删除这条价格表记录吗？',
      onOk: async () => {
        try {
          setLoading(true);
          const res = await customerPriceListService.delete(id);
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
      }
    });
  }, [modal, message, handleRefresh]);

  const handleBatchDelete = useCallback(async (ids: string[]) => {
    modal.confirm({
      title: '确定要删除选中的价格表吗？',
      content: `将删除 ${ids.length} 条记录，删除后无法恢复，请确认操作。`,
      onOk: async () => {
        try {
          setLoading(true);
          for (const id of ids) {
            await customerPriceListService.delete(id);
          }
          message.success('批量删除成功');
          handleRefresh();
        } catch {
          message.error('批量删除失败');
        } finally {
          setLoading(false);
        }
      }
    });
  }, [modal, message, handleRefresh]);

  return { loading, handleCreate, handleUpdate, handleDelete, handleBatchDelete, handleRefresh };
};
