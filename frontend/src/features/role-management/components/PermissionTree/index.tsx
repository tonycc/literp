/**
 * 权限树形选择器组件
 */

import React, { useMemo, useState } from 'react';
import { Tree } from 'antd';
import type { Permission } from '@zyerp/shared';
import {
  PlusOutlined,
  MinusOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  SettingOutlined,
  DashboardOutlined,
  FileOutlined,
  AuditOutlined,
  BankOutlined,
} from '@ant-design/icons';

interface PermissionTreeProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onChange: (selectedKeys: string[]) => void;
}

interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
  isLeaf?: boolean;
  permissionId?: string;
}

// 资源图标映射
const resourceIcons: Record<string, React.ReactNode> = {
  user: <UserOutlined />,
  role: <TeamOutlined />,
  permission: <SafetyOutlined />,
  department: <BankOutlined />,
  system: <SettingOutlined />,
  dashboard: <DashboardOutlined />,
  file: <FileOutlined />,
  log: <AuditOutlined />,
};

// 资源名称映射
const resourceNames: Record<string, string> = {
  user: '用户管理',
  role: '角色管理',
  permission: '权限管理',
  department: '部门管理',
  system: '系统管理',
  dashboard: '仪表板',
  file: '文件管理',
  log: '日志管理',
};

const PermissionTree: React.FC<PermissionTreeProps> = ({
  permissions,
  selectedPermissions,
  onChange,
}) => {
  // 管理展开状态
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  // 构建树形数据
  const treeData = useMemo(() => {
    // 按资源分组权限
    const groupedPermissions = permissions.reduce((groups, permission) => {
      const resource = permission.resource;
      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(permission);
      return groups;
    }, {} as Record<string, Permission[]>);

    // 构建树形结构
    const nodes: TreeNode[] = Object.entries(groupedPermissions).map(([resource, perms]) => {
      const resourceNode: TreeNode = {
        key: `resource-${resource}`,
        title: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {resourceIcons[resource] || <PlusOutlined />}
            <span style={{ fontWeight: 500 }}>
              {resourceNames[resource] || resource.toUpperCase()}
            </span>
          </div>
        ),
        children: perms.map(permission => ({
          key: String(permission.id),
          title: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileTextOutlined style={{ color: '#8c8c8c' }} />
              <span>{permission.name}</span>
              <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                ({permission.action})
              </span>
            </div>
          ),
          isLeaf: true,
          permissionId: String(permission.id),
        })),
      };
      return resourceNode;
    });

    return nodes;
  }, [permissions]);

  // 处理展开/折叠事件
  const handleExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
  };

  // 处理节点选择
  const handleCheck = (checkedKeys: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
    let keys: React.Key[];
    
    if (Array.isArray(checkedKeys)) {
      keys = checkedKeys;
    } else {
      keys = checkedKeys.checked;
    }

    // 只保留权限节点的key（过滤掉资源节点）
    const permissionKeys = keys.filter(key => !String(key).startsWith('resource-'));
    onChange(permissionKeys.map(key => String(key)));
  };

  // 获取选中的keys（包括半选中的父节点）
  const getCheckedKeys = () => {
    // 只包含实际的权限ID
    const checkedKeys = [...selectedPermissions];
    const halfCheckedKeys: string[] = [];

    // 检查每个资源节点是否应该半选中或全选中
    treeData.forEach(resourceNode => {
      if (resourceNode.children) {
        const childKeys = resourceNode.children.map(child => child.key);
        const selectedChildKeys = childKeys.filter(key => selectedPermissions.includes(key));
        
        if (selectedChildKeys.length > 0 && selectedChildKeys.length < childKeys.length) {
          // 部分选中，显示为半选中
          halfCheckedKeys.push(resourceNode.key);
        } else if (selectedChildKeys.length === childKeys.length && selectedChildKeys.length > 0) {
          // 全部选中，显示为选中状态（仅用于UI显示）
          checkedKeys.push(resourceNode.key);
        }
      }
    });

    return {
      checked: checkedKeys,
      halfChecked: halfCheckedKeys,
    };
  };

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 8, maxHeight: 400, overflow: 'auto' }}>
      <Tree
        checkable
        checkedKeys={getCheckedKeys()}
        onCheck={handleCheck}
        treeData={treeData}
        expandedKeys={expandedKeys}
        onExpand={handleExpand}
        showIcon
        switcherIcon={({ expanded }) => 
          expanded ? <MinusOutlined /> : <PlusOutlined />
        }
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default PermissionTree;