/**
 * 部门成员列表组件
 */

import React, { useMemo, useRef } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ProTableProps, ActionType } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { departmentService } from '../services/department.service';
import type { DepartmentMember, DepartmentPosition, ID } from '@zyerp/shared';
import { DEPARTMENT_POSITIONS } from '@zyerp/shared';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';
import { useMessage } from '@/shared/hooks';

interface DepartmentMemberListProps {
  departmentId: ID;
}

const DepartmentMemberList: React.FC<DepartmentMemberListProps> = ({ departmentId }) => {
  const message = useMessage();
  const actionRef = useRef<ActionType | undefined>(undefined);

  const handleDeleteMember = React.useCallback(async (userId: ID) => {
    try {
      await departmentService.removeUserFromDepartment(userId, departmentId);
      message.success('移除成员成功');
      void actionRef.current?.reload?.();
    } catch {
      message.error('移除成员失败');
    }
  }, [departmentId, message]);

  const positionValueEnum: Record<string, { text: string }> = useMemo(() => {
    const r: Record<string, { text: string }> = {};
    Object.values(DEPARTMENT_POSITIONS).forEach((pos) => {
      r[pos.key] = { text: pos.name };
    });
    return r;
  }, []);

  const columns: ProColumns<DepartmentMember>[] = useMemo(() => ([
    { title: '序号', dataIndex: 'index', valueType: 'indexBorder', width: 48 },
    { title: '姓名', dataIndex: ['user', 'username'], ellipsis: true, width: 160 },
    { title: '邮箱', dataIndex: ['user', 'email'], ellipsis: true, width: 220 },
    { title: '职位', dataIndex: 'position', width: 140, valueType: 'select', valueEnum: positionValueEnum },
    { title: '主要部门', dataIndex: 'isMain', width: 100, valueType: 'select', valueEnum: { true: { text: '是' }, false: { text: '否' } } },
    { title: '加入时间', dataIndex: 'createdAt', width: 180, valueType: 'dateTime' },
    { title: '操作', valueType: 'option', width: 160, fixed: 'right', render: (_, r) => (
      <Space size="small">
        <Button type="link" icon={<EditOutlined />} onClick={() => { message.info('编辑功能待实现') }}>编辑</Button>
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => { void handleDeleteMember(r.userId) }}>移除</Button>
      </Space>
    ) },
  ]), [positionValueEnum, handleDeleteMember, message]);

  const request: ProTableProps<DepartmentMember, Record<string, unknown>>['request'] = async (params) => {
    try {
      const base = normalizeTableParams(params);
      const res = await departmentService.getMemberList({ departmentId, page: base.page, limit: base.pageSize, search: typeof params['keyword'] === 'string' ? params['keyword'] : undefined, position: typeof params['position'] === 'string' ? (params['position'] as DepartmentPosition) : undefined, isMain: typeof params['isMain'] === 'string' ? params['isMain'] === 'true' : undefined });
      return { data: res.data, success: res.success ?? true, total: res.pagination?.total ?? 0 };
    } catch {
      message.error('获取部门成员列表失败');
      return { data: [], success: false, total: 0 };
    }
  };

  return (
    <ProTable<DepartmentMember>
      columns={columns}
      actionRef={actionRef}
      form={{ name: 'departmentMemberListSearch' }}
      request={request}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      toolBarRender={() => [
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { message.info('添加成员功能待实现') }}>新增</Button>,
        <Button key="refresh" onClick={() => { void actionRef.current?.reload?.() }}>刷新</Button>,
      ]}
      pagination={{ showSizeChanger: true, showQuickJumper: true, showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条` }}
      scroll={{ x: 'max-content' }}
    />
  );
};

export default DepartmentMemberList;
