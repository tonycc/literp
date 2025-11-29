import React, { useState } from 'react';
import { Button, Space, Tag } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ProTableProps, ActionType } from '@ant-design/pro-components';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Role } from '@zyerp/shared';
import { roleService } from '../services/role.service';
import RoleForm, { type RoleFormData } from './RoleForm';
import { useMessage } from '@/shared/hooks/useMessage';
import { useModal } from '@/shared/hooks/useModal';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';

const RoleList: React.FC = () => {
  const message = useMessage();
  const modal = useModal();
  const [formVisible, setFormVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const actionRef = React.useRef<ActionType | undefined>(undefined);

  const columns: ProColumns<Role>[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      ellipsis: true,
    },

    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      render: (_, r) => (<Tag color="green">{Array.isArray(r.permissions) ? r.permissions.length : 0} 个权限</Tag>),
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      render: (_, r) => (<Tag color="blue">{typeof r.userCount === 'number' ? r.userCount : 0} 个用户</Tag>),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record: Role) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const request: ProTableProps<Role, Record<string, unknown>>['request'] = async (params) => {
    try {
      const base = normalizeTableParams(params);
      const res = await roleService.getList({ page: base.page, limit: base.pageSize, search: typeof params['keyword'] === 'string' ? params['keyword'] : undefined });
      return { data: res.data, success: res.success ?? true, total: res.pagination?.total ?? 0 };
    } catch {
      message.error('获取角色列表失败');
      return { data: [], success: false, total: 0 };
    }
  };

  // 初始化：无，交给 ProTable 的 request

  // 处理新增角色
  const handleAdd = () => {
    setEditingRole(null);
    setFormVisible(true);
  };

  // 处理编辑角色
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormVisible(true);
  };

  // 处理删除角色
  const handleDelete = (role: Role) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除角色"${role.name}"吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          await roleService.deleteRole(String(role.id));
          message.success('删除成功');
          void actionRef.current?.reload?.();
        } catch (error: unknown) {
          let errorMessage = '删除失败';
          if (error && typeof error === 'object') {
            const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
            if (axiosError.response?.data?.message) {
              errorMessage = axiosError.response.data.message;
            } else if (axiosError.message) {
              errorMessage = axiosError.message;
            }
          }
          message.error(errorMessage);
        }
      },
    });
  };

  // 处理表单提交
  const handleFormSubmit = async (values: RoleFormData) => {
    try {
      if (editingRole) {
        // 更新角色
        await roleService.updateRole(String(editingRole.id), values);
        message.success('更新成功');
      } else {
        // 创建角色
        await roleService.createRole(values);
        message.success('创建成功');
      }
      
      setFormVisible(false);
      void actionRef.current?.reload?.();
    } catch (error: unknown) {
      // 提取具体的错误信息
      let errorMessage = editingRole ? '更新失败' : '创建失败';
      
      if (error && typeof error === 'object') {
        const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }
      
      message.error(errorMessage);
      console.error('角色操作失败:', error);
    }
  };

  // ProTable 自处理分页变化

  return (
    <>
  
        <ProTable<Role>
          columns={columns}
          actionRef={actionRef}
          form={{ name: 'roleListSearch' }}
          request={request}
          rowKey="id"
          search={{ labelWidth: 'auto' }}
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增角色</Button>,
            <Button key="refresh" onClick={() => { void actionRef.current?.reload?.() }}>刷新</Button>,
          ]}
          pagination={{ showSizeChanger: true, showQuickJumper: true, showTotal: (total) => `共 ${total} 条记录` }}
          scroll={{ x: 'max-content' }}
        />
      
      <RoleForm
        visible={formVisible}
        role={editingRole}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
      />
    </>
  );
};

export default RoleList;
