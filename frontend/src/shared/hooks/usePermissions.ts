import { useMemo } from 'react';
import { useAuth } from '../../features/auth';

/**
 * 权限检查Hook
 */
export const usePermissions = () => {
  const { user } = useAuth();

  // 获取用户所有权限
  const userPermissions = useMemo(() => {
    if (!user?.roles) {
      return [];
    }

    const permissions: string[] = [];
    
    user.roles.forEach(role => {
      role.permissions?.forEach(permission => {
        const permissionCode = `${permission.resource}:${permission.action}`;
        permissions.push(permissionCode);
      });
    });

    return permissions;
  }, [user]);

  // 检查是否具有特定权限
  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  // 检查是否具有任意一个权限
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // 检查是否具有所有权限
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // 检查是否是管理员
  const isAdmin = useMemo(() => {
    return user?.roles?.some(role => role.name === '系统管理员') || false;
  }, [user?.roles]);

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
  };
};