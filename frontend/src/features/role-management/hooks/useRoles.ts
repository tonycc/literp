/**
 * 角色管理相关的自定义Hook
 */

import { useState, useEffect, useCallback } from 'react';
import type { Role } from '@zyerp/shared';
import { roleService } from '../services/role.service';
import { useMessage } from '../../../shared/hooks/useMessage';

export interface UseRolesOptions {
  autoFetch?: boolean; // 是否自动获取数据
  page?: number;
  limit?: number;
  search?: string;
}

export interface UseRolesReturn {
  roles: Role[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  fetchRoles: (params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * 获取角色列表的Hook
 */
export const useRoles = (options: UseRolesOptions = {}): UseRolesReturn => {
  const { autoFetch = true, page = 1, limit = 100, search } = options;
  const message = useMessage();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
  });

  const fetchRoles = useCallback(async (params?: { page?: number; limit?: number; search?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roleService.getRoles({
        page: params?.page || page,
        limit: params?.limit || limit,
        search: params?.search || search,
      });
      
      setRoles(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
      });
    } catch (err) {
      const errorMessage = '获取角色列表失败';
      setError(errorMessage);
      message.error(errorMessage);
      console.error('获取角色列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, message]);

  const refresh = useCallback(() => {
    return fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    if (autoFetch) {
      fetchRoles();
    }
  }, [autoFetch, fetchRoles]);

  return {
    roles,
    loading,
    error,
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    fetchRoles,
    refresh,
  };
};

/**
 * 获取所有角色的简化Hook（用于选择器）
 */
export const useAllRoles = () => {
  const { roles, loading, error, fetchRoles } = useRoles({
    autoFetch: true,
    limit: 1000, // 获取所有角色
  });

  return {
    roles,
    loading,
    error,
    refresh: fetchRoles,
  };
};