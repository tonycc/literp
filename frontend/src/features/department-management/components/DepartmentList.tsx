/**
 * 部门列表组件
 */

import React, { useMemo, useRef, useCallback } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ProTableProps, ActionType } from '@ant-design/pro-components';
import { Button, Space, Tag, Popconfirm } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useMessage } from '@/shared/hooks';
import { departmentService } from '../services/department.service';
import { useDepartmentActions } from '../hooks/useDepartments';
import type { Department } from '@zyerp/shared';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';
import { DEPARTMENT_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/department';

interface DepartmentListProps {
  onEdit?: (department: Department) => void;
  onAdd?: () => void;
}

export const DepartmentList: React.FC<DepartmentListProps> = ({ onEdit }) => {
  const message = useMessage();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const { deleteDepartment, loading: actionLoading } = useDepartmentActions();

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteDepartment(id);
      void actionRef.current?.reload?.();
    } catch {
      // 错误已在 hook 中处理
    }
  }, [deleteDepartment]);
  const columns: ProColumns<Department>[] = useMemo(() => ([
    { title: '部门名称', dataIndex: 'name', ellipsis: true, width: 160 },
    { title: '负责人', dataIndex: ['manager', 'username'], width: 140, render: (_, r) => r.manager?.username || '未设置' },
    { title: '上级部门', dataIndex: ['parent', 'name'], width: 160, render: (_, r) => r.parent?.name || '无' },
    { title: '部门层级', dataIndex: 'level', width: 100, render: (_, r) => (<Tag color="blue">{r.level}级</Tag>) },
    { title: '状态', dataIndex: 'isActive', width: 100, valueType: 'select', valueEnum: DEPARTMENT_STATUS_VALUE_ENUM_PRO },
    { title: '用户数', dataIndex: 'userCount', width: 100, render: (_, r) => r.userCount ?? 0 },
    { title: '创建时间', dataIndex: 'createdAt', width: 180, valueType: 'dateTime' },
    { title: '更新时间', dataIndex: 'updatedAt', width: 180, valueType: 'dateTime' },
    { title: '操作', valueType: 'option', width: 160, fixed: 'right', render: (_, r) => (
      <Space size="small">
        <Button type="link" icon={<EditOutlined />} onClick={() => onEdit?.(r)}>编辑</Button>
        <Popconfirm title="确认删除" onConfirm={() => { void handleDelete(String(r.id)) }}>
          <Button type="link" danger loading={actionLoading}>删除</Button>
        </Popconfirm>
      </Space>
    ) },
  ]), [onEdit, actionLoading, handleDelete]);

  const request: ProTableProps<Department, Record<string, unknown>>['request'] = async (params) => {
    try {
      const base = normalizeTableParams(params);
      const res = await departmentService.getList({ page: base.page, limit: base.pageSize, search: typeof params['name'] === 'string' ? params['name'] : undefined, isActive: typeof params['isActive'] === 'string' ? params['isActive'] === 'true' : undefined });
      return { data: res.data, success: res.success ?? true, total: res.pagination?.total ?? 0 };
    } catch {
      message.error('获取部门列表失败');
      return { data: [], success: false, total: 0 };
    }
  };

  return (
      <ProTable<Department>
        columns={columns}
        actionRef={actionRef}
        options={{
          reload: false,
          density: false,
          setting: false,

        }}
        form={{ name: 'departmentListSearch' }}
        request={request}
        rowKey="id"
        expandable={{ childrenColumnName: 'nonExistentField' }}
        search={{ labelWidth: 'auto' }}
        pagination={{ showSizeChanger: true, showQuickJumper: true, showTotal: (total: number, range: number[]) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条` }}
        scroll={{ x: 'max-content' }}
      />
  );
};
