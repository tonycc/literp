import { useMemo } from 'react';
import { useAuth } from '../../features/auth';

/**
 * 权限检查Hook
 */
export const usePermissions = () => {
  const { user } = useAuth();

  // 获取用户所有权限
  const userPermissions = useMemo(() => {
    const permissions: string[] = [];
    const rawRoles = user?.roles as unknown;
    const roles = Array.isArray(rawRoles) ? rawRoles : [];
    roles.forEach((role) => {
      const perms = Array.isArray((role as { permissions?: unknown }).permissions)
        ? (role as { permissions: Array<{ resource?: unknown; action?: unknown }> }).permissions
        : [];
      perms.forEach((p) => {
        const resource = typeof p.resource === 'string' ? p.resource : undefined;
        const action = typeof p.action === 'string' ? p.action : undefined;
        if (resource && action) {
          permissions.push(`${resource}:${action}`);
        }
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
    const rawRoles = user?.roles as unknown;
    const roles = Array.isArray(rawRoles) ? rawRoles : [];
    return roles.some((r) => typeof (r as { name?: unknown }).name === 'string' && (r as { name?: string }).name === '系统管理员');
  }, [user]);

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
  };
};