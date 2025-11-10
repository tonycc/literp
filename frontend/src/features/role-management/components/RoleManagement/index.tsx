import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Space, Tag, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Role } from '@zyerp/shared';
import { roleService } from '../../services/role.service';
import RoleForm from '../../components/RoleForm';
import type { CreateRoleData, UpdateRoleData } from '../../services/role.service';
import { useMessage } from '../../../../shared/hooks/useMessage';

const RoleManagement: React.FC = () => {
  const { modal } = App.useApp();
  const message = useMessage();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const columns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },

    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Tag color="green">{permissions.length} 个权限</Tag>
      ),
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (userCount: number) => (
        <Tag color="blue">{userCount || 0} 个用户</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
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

  // 获取角色列表
  const fetchRoles = useCallback(async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await roleService.getRoles({
        page,
        limit: pageSize,
      });
      
      setRoles(response.data);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });
    } catch {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

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
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除角色"${role.name}"吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await roleService.deleteRole(String(role.id));
          message.success('删除成功');
          fetchRoles(pagination.current, pagination.pageSize);
        } catch (error: unknown) {
          // 提取具体的错误信息
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
  const handleFormSubmit = async (values: CreateRoleData | UpdateRoleData) => {
    try {
      if (editingRole) {
        // 更新角色
        await roleService.updateRole(String(editingRole.id), values as UpdateRoleData);
        message.success('更新成功');
      } else {
        // 创建角色
        await roleService.createRole(values as CreateRoleData);
        message.success('创建成功');
      }
      
      setFormVisible(false);
      fetchRoles(pagination.current, pagination.pageSize);
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

  // 处理表格分页变化
  const handleTableChange = (page: number, pageSize?: number) => {
    fetchRoles(page, pageSize || pagination.pageSize);
  };

  return (
    <div style={{ padding: 0 }}>
      <Card
        title="角色管理"
        styles={{ body: { padding: 12 } }}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增角色
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: handleTableChange,
          }}
        />
      </Card>
      
      <RoleForm
        visible={formVisible}
        role={editingRole}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default RoleManagement;