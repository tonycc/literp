import { useState, useCallback } from 'react';
import type { ProductStockInfo } from '@zyerp/shared';
import { inventoryService } from '../services/inventory.service';
import { useMessage } from '@/shared/hooks/useMessage';

export const useInventory = () => {
  const [selectedItems, setSelectedItems] = useState<ProductStockInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const message = useMessage();

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      // 仅用于触发刷新，列表实际通过 ProTable.request 自动调用 service
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch {
      message.error('刷新库存数据失败');
    } finally {
      setLoading(false);
    }
  }, [message]);

  const handleCreate = useCallback(async () => {
    message.info('创建库存记录功能待实现');
    await Promise.resolve();
  }, [message]);

  const handleUpdate = useCallback(async (_item: ProductStockInfo) => {
    message.info('更新库存记录功能待实现');
    await Promise.resolve();
  }, [message]);

  const handleDelete = useCallback(async (_id: string) => {
    message.info('删除库存记录功能待实现');
    await Promise.resolve();
  }, [message]);

  return {
    selectedItems,
    loading,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleRefresh,
    setSelectedItems,
    setLoading,
    inventoryService,
  };
};

export default useInventory;