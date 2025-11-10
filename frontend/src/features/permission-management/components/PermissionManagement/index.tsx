import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Tag,
} from 'antd';
import { useMessage } from '../../../../shared/hooks/useMessage';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Permission } from '@zyerp/shared';
import { permissionService } from '../../services/permission.service';
import type { CreatePermissionData, UpdatePermissionData } from '../../services/permission.service';
import PermissionForm from '../../components/PermissionForm';

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

const PermissionManagement: React.FC = () => {
  const message = useMessage();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const columns: ColumnsType<Permission> = [
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '权限代码',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource: string) => <Tag color="green">{resource}</Tag>,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => <Tag color="orange">{action}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'operation',
      render: (_, record: Permission) => (
        <Space size="middle">
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

  // 获取权限列表
  const fetchPermissions = useCallback(async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      const response = await permissionService.getPermissions({
        page,
        limit: pageSize,
      });
      
      setPermissions(response.data);
      setPagination({
        current: response.page,
        pageSize: response.limit,
        total: response.total,
      });
    } catch {
      message.error('获取权限列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // 处理新增权限
  const handleAdd = () => {
    setEditingPermission(null);
    setFormVisible(true);
  };

  // 处理编辑权限
  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setFormVisible(true);
  };

  // 处理删除权限
  const handleDelete = (permission: Permission) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除权限"${permission.name}"吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await permissionService.deletePermission(String(permission.id));
          message.success('删除成功');
          fetchPermissions(pagination.current, pagination.pageSize);
        } catch {
          message.error('删除失败');
        }
      },
    });
  };

  // 处理表单提交
  const handleFormSubmit = async (values: CreatePermissionData | UpdatePermissionData) => {
    try {
      if (editingPermission) {
        // 更新权限
        await permissionService.updatePermission(String(editingPermission.id), values as UpdatePermissionData);
        message.success('更新成功');
      } else {
        // 创建权限
        await permissionService.createPermission(values as CreatePermissionData);
        message.success('创建成功');
      }
      
      setFormVisible(false);
      fetchPermissions(pagination.current, pagination.pageSize);
    } catch {
      message.error(editingPermission ? '更新失败' : '创建失败');
    }
  };

  // 处理表格分页变化
  const handleTableChange = (page: number, pageSize?: number) => {
    fetchPermissions(page, pageSize || pagination.pageSize);
  };

  return (
    <div style={{ padding: 0 }}>
      <Card
        title="权限管理"
        styles={{ body: { padding: 12 } }}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增权限
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={permissions}
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
      
      <PermissionForm
        visible={formVisible}
        permission={editingPermission}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default PermissionManagement;