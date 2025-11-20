import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  Popconfirm,
  Modal,
  Form,
  Input,
  Switch,
  Row,
  Col,
  Select,
  TreeSelect,
} from 'antd';
import { useMessage } from '@/shared/hooks/useMessage';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { User } from '@zyerp/shared';
import userService, { type UserListParams, type UserListResponse } from '../../services/user.service';
import { useDepartmentTree } from '../../../department-management/hooks/useDepartments';
import { useAllRoles } from '../../../role-management/hooks/useRoles';
import type { DepartmentTreeNode } from '@zyerp/shared';

const { Search } = Input;
const { Option } = Select;

interface UserFormData {
  username: string;
  email: string;
  password?: string;
  isActive: boolean;
  roleIds?: string[];
  departmentId?: string;
}

const UserManagement: React.FC = () => {
  const message = useMessage();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('user:create');
  const canUpdate = hasPermission('user:update');
  const canDelete = hasPermission('user:delete');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState<UserListParams>({});
  
  // 模态框状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm<UserFormData>();
  
  // 部门数据
  const { tree: departmentTree, loading: departmentLoading } = useDepartmentTree();
  
  // 角色数据
  const { roles, loading: rolesLoading } = useAllRoles();

  // 定义 TreeSelect 数据类型
  type TreeSelectData = {
    title: string;
    value: string;
    key: string;
    children?: TreeSelectData[];
  };

  // 转换部门树数据为 TreeSelect 格式
  const convertDepartmentTreeData = (nodes: DepartmentTreeNode[]): TreeSelectData[] => {
    return nodes.map(node => ({
      title: node.name,
      value: String(node.id),
      key: String(node.id),
      children: node.children ? convertDepartmentTreeData(node.children) : undefined,
    }));
  };

  // 获取用户列表
  const fetchUsers = useCallback(async (params: UserListParams = {}) => {
    setLoading(true);
    try {
      const response: UserListResponse = await userService.getUsers({
        page: pagination.current,
        limit: pagination.pageSize,
        ...searchParams,
        ...params,
      });
      
      setUsers(response.users);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        current: response.page,
        pageSize: response.limit,
      }));
    } catch (error) {
      message.error('获取用户列表失败');
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchParams]);

  // 初始化加载
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 表格列定义
  const columns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 150,
      render: (roles: User['roles']) => (
        <>
          {roles?.map(role => (
            <Tag key={role.id} color="blue">
              {role.name}
            </Tag>
          )) || <Tag color="default">无角色</Tag>}
        </>
      ),
    },
    {
      title: '部门',
      dataIndex: 'mainDepartment',
      key: 'department',
      width: 150,
      render: (department: { name?: string } | null) => (
        <Tag color={department ? 'green' : 'default'}>
          {department?.name || '未分配'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            disabled={!canUpdate}
            onClick={() => handleEdit(record)}
            title={!canUpdate ? '无编辑权限' : undefined}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(String(record.id))}
            okText="确定"
            cancelText="取消"
            disabled={!canDelete}
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              disabled={!canDelete}
              title={!canDelete ? '无删除权限' : undefined}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理新增用户
  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理编辑用户
  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      roleIds: user.roles?.map(role => String(role.id)),
      departmentId: user.mainDepartment?.id ? String(user.mainDepartment.id) : undefined,
    });
    setIsModalVisible(true);
  };

  // 处理删除用户
  const handleDelete = async (id: string) => {
    try {
      await userService.deleteUser(id);
      message.success('删除用户成功');
      fetchUsers();
    } catch (error) {
      message.error('删除用户失败');
      console.error('删除用户失败:', error);
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: UserFormData) => {
    try {
      if (editingUser) {
        // 更新用户
        await userService.updateUser(String(editingUser.id), values);
        message.success('更新用户成功');
      } else {
        // 创建用户
        if (!values.password) {
          message.error('密码不能为空');
          return;
        }
        await userService.createUser({
          username: values.username,
          email: values.email,
          password: values.password,
          roleIds: values.roleIds,
          departmentId: values.departmentId,
        });
        message.success('创建用户成功');
      }
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error(editingUser ? '更新用户失败' : '创建用户失败');
      console.error('操作失败:', error);
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    const newParams = { ...searchParams, search: value };
    setSearchParams(newParams);
    fetchUsers({ ...newParams, page: 1 });
  };

  // 处理状态筛选
  const handleStatusFilter = (value: boolean | undefined) => {
    const newParams = { ...searchParams, isActive: value };
    setSearchParams(newParams);
    fetchUsers({ ...newParams, page: 1 });
  };

  // 处理表格分页变化
  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    const newPagination = {
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
      total: pagination.total,
    };
    setPagination(newPagination);
    fetchUsers({
      page: paginationConfig.current || 1,
      limit: paginationConfig.pageSize || 10,
    });
  };

  return (
    <div style={{ padding:0 }}>
      <Card
        title="用户管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={!canCreate} title={!canCreate ? '无新增权限' : undefined}>
            新增用户
          </Button>
        }
      >
        {/* 搜索和筛选区域 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索用户名或邮箱"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态筛选"
              allowClear
              onChange={handleStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value={true}>活跃</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Col>
        </Row>

        {/* 用户表格 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 用户表单模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 1, message: '用户名至少1个字符' },
              { max: 20, message: '用户名最多20个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            label="用户角色"
            name="roleIds"
            help="选择用户的角色，可多选"
          >
            <Select
              mode="multiple"
              placeholder="请选择角色"
              allowClear
              loading={rolesLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={roles.map(role => ({
                label: role.name,
                value: String(role.id),
                title: role.description || role.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="所属部门"
            name="departmentId"
            help="选择用户的主要部门"
          >
            <TreeSelect
              placeholder="请选择部门"
              allowClear
              treeData={convertDepartmentTreeData(departmentTree)}
              loading={departmentLoading}
              showSearch
              treeNodeFilterProp="title"
              styles={{
                popup: {
                  root: { maxHeight: 400, overflow: 'auto' }
                }
              }}
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="活跃" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" disabled={editingUser ? !canUpdate : !canCreate} title={(editingUser ? !canUpdate : !canCreate) ? '无操作权限' : undefined}>
                {editingUser ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;