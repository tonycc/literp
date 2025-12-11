/**
 * 部门成员管理相关的自定义 hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { useMessage } from '@/shared/hooks';
import { departmentService } from '../services/department.service';
import type {
  DepartmentMember,
  DepartmentMemberListParams,
  AssignUserToDepartmentData,
  UpdateUserDepartmentData,
  ID
} from '@zyerp/shared';

/**
 * 部门成员列表 hook
 */
export const useDepartmentMembers = (initialParams?: DepartmentMemberListParams) => {
  const message = useMessage();
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<DepartmentMemberListParams>((initialParams || {}) as DepartmentMemberListParams);

  const fetchMembers = useCallback(async (searchParams?: DepartmentMemberListParams) => {
    if (!searchParams?.departmentId && !params.departmentId) {
      return;
    }
    
    setLoading(true);
    try {
      const queryParams = { ...params, ...searchParams };
      const response = await departmentService.getDepartmentMembers(queryParams);
      setMembers(response.data);
      setTotal(response.total);
      setParams(queryParams);
    } catch (error) {
      console.error('获取部门成员列表失败:', error);
      message.error('获取部门成员列表失败');
    } finally {
      setLoading(false);
    }
  }, [params, message]);

  useEffect(() => {
    if (params.departmentId) {
      void fetchMembers();
    }
  }, [fetchMembers, params.departmentId]);

  const refresh = useCallback(() => {
    void fetchMembers(params);
  }, [fetchMembers, params]);

  return {
    members,
    loading,
    total,
    params,
    fetchMembers,
    refresh,
  };
};

/**
 * 部门成员操作 hook
 */
export const useDepartmentMemberActions = () => {
  const message = useMessage();
  const [actionLoading, setActionLoading] = useState(false);

  const assignMember = useCallback(async (data: AssignUserToDepartmentData) => {
    setActionLoading(true);
    try {
      const response = await departmentService.assignUserToDepartment(data);
      message.success('添加成员成功');
      return response;
    } catch (error) {
      console.error('添加成员失败:', error);
      message.error('添加成员失败');
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [message]);

  const updateMember = useCallback(async (userId: ID, departmentId: ID, data: UpdateUserDepartmentData) => {
    setActionLoading(true);
    try {
      const response = await departmentService.updateUserDepartment(userId, departmentId, data);
      message.success('更新成员信息成功');
      return response;
    } catch (error) {
      console.error('更新成员信息失败:', error);
      message.error('更新成员信息失败');
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [message]);

  const removeMember = useCallback(async (userId: ID, departmentId: ID) => {
    setActionLoading(true);
    try {
      await departmentService.removeUserFromDepartment(userId, departmentId);
      message.success('移除成员成功');
    } catch (error) {
      console.error('移除成员失败:', error);
      message.error('移除成员失败');
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [message]);

  return {
    actionLoading,
    assignMember,
    updateMember,
    removeMember,
  };
};

/**
 * 组合 hook，包含成员列表和操作
 */
export const useDepartmentMembersWithActions = (initialParams?: DepartmentMemberListParams) => {
  const memberHook = useDepartmentMembers(initialParams);
  const actionHook = useDepartmentMemberActions();

  return {
    ...memberHook,
    ...actionHook,
  };
};