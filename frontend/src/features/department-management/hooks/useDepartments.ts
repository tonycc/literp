/**
 * 部门管理相关的自定义 hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { departmentService } from '../services/department.service';
import type {
  Department,
  DepartmentTreeNode,
  DepartmentListParams,
  CreateDepartmentData,
  UpdateDepartmentData,
  DepartmentStats
} from '@zyerp/shared';

/**
 * 部门列表 hook
 */
export const useDepartments = (initialParams?: DepartmentListParams) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<DepartmentListParams>(initialParams || {});

  const fetchDepartments = useCallback(async (searchParams?: DepartmentListParams) => {
    setLoading(true);
    try {
      const queryParams = { ...params, ...searchParams };
      const response = await departmentService.getDepartments(queryParams);
      setDepartments(response.data);
      setTotal(response.total);
      setParams(queryParams);
    } catch (error) {
      console.error('获取部门列表失败:', error);
      message.error('获取部门列表失败');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const refresh = useCallback(() => {
    fetchDepartments(params);
  }, [fetchDepartments, params]);

  return {
    departments,
    loading,
    total,
    params,
    fetchDepartments,
    refresh,
  };
};

/**
 * 部门树 hook
 */
export const useDepartmentTree = () => {
  const [tree, setTree] = useState<DepartmentTreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const response = await departmentService.getDepartmentTree();
      setTree(response);
    } catch (error) {
      console.error('获取部门树失败:', error);
      message.error('获取部门树失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const refresh = useCallback(() => {
    fetchTree();
  }, [fetchTree]);

  return {
    tree,
    loading,
    fetchTree,
    refresh,
  };
};

/**
 * 部门详情 hook
 */
export const useDepartment = (id?: string) => {
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDepartment = useCallback(async (departmentId: string) => {
    setLoading(true);
    try {
      const response = await departmentService.getDepartmentById(departmentId);
      setDepartment(response);
    } catch (error) {
      console.error('获取部门详情失败:', error);
      message.error('获取部门详情失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchDepartment(id);
    }
  }, [id, fetchDepartment]);

  return {
    department,
    loading,
    fetchDepartment,
  };
};

/**
 * 部门操作 hook
 */
export const useDepartmentActions = () => {
  const [loading, setLoading] = useState(false);

  const createDepartment = useCallback(async (data: CreateDepartmentData) => {
    setLoading(true);
    try {
      const response = await departmentService.createDepartment(data);
      message.success('创建部门成功');
      return response;
    } catch (error) {
      console.error('创建部门失败:', error);
      message.error('创建部门失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDepartment = useCallback(async (id: string, data: UpdateDepartmentData) => {
    setLoading(true);
    try {
      const response = await departmentService.updateDepartment(id, data);
      message.success('更新部门成功');
      return response;
    } catch (error) {
      console.error('更新部门失败:', error);
      message.error('更新部门失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDepartment = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await departmentService.deleteDepartment(id);
      message.success('删除部门成功');
    } catch (error) {
      console.error('删除部门失败:', error);
      message.error('删除部门失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};

/**
 * 部门统计 hook
 */
export const useDepartmentStats = () => {
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await departmentService.getDepartmentStats();
      setStats(response);
    } catch (error) {
      console.error('获取部门统计失败:', error);
      message.error('获取部门统计失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    fetchStats,
  };
};