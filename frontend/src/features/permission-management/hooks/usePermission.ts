import { useState, useCallback } from 'react';
import { useMessage } from '@/shared/hooks/useMessage';
import { permissionService } from '../services/permission.service';
import type { Permission } from '@zyerp/shared';
import type { CreatePermissionData, UpdatePermissionData } from '../services/permission.service';

export const usePermission = () => {
  const [selectedItems, setSelectedItems] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const message = useMessage();

  const handleCreate = useCallback(async (data: CreatePermissionData) => {
    try {
      setLoading(true);
      await permissionService.createPermission(data);
      message.success('创建权限成功');
      return true;
    } catch (error) {
      console.error(error);
      message.error('创建权限失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [message]);

  const handleUpdate = useCallback(async (id: string, data: UpdatePermissionData) => {
    try {
      setLoading(true);
      await permissionService.updatePermission(id, data);
      message.success('更新权限成功');
      return true;
    } catch (error) {
      console.error(error);
      message.error('更新权限失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [message]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await permissionService.deletePermission(id);
      message.success('删除权限成功');
      return true;
    } catch (error) {
      console.error(error);
      message.error('删除权限失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [message]);

  return {
    selectedItems,
    loading,
    setSelectedItems,
    setLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
};
