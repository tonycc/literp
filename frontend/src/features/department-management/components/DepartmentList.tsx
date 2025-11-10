/**
 * 部门列表组件
 */

import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Card,
  Tag,
  Popconfirm,

  Row,
  Col,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDepartments, useDepartmentActions } from '../hooks/useDepartments';
import type { Department, DepartmentListParams } from '@zyerp/shared';

const { Option } = Select;

interface DepartmentListProps {
  onEdit?: (department: Department) => void;
}

export const DepartmentList: React.FC<DepartmentListProps> = ({
  onEdit,
}) => {
  const [searchForm, setSearchForm] = useState<DepartmentListParams>({
    page: 1,
    limit: 10,
  });

  const { departments, loading, total, fetchDepartments, refresh } = useDepartments(searchForm);
  const { deleteDepartment, loading: actionLoading } = useDepartmentActions();

  // 处理搜索
  const handleSearch = () => {
    fetchDepartments({ ...searchForm, page: 1 });
  };

  // 处理重置
  const handleReset = () => {
    const resetForm = { page: 1, limit: 10 };
    setSearchForm(resetForm);
    fetchDepartments(resetForm);
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment(id);
      refresh();
    } catch {
      // 错误已在 hook 中处理
    }
  };

  // 处理分页
  const handleTableChange = (page: number, pageSize?: number) => {
    const newParams = { ...searchForm, page, limit: pageSize || 10 };
    setSearchForm(newParams);
    fetchDepartments(newParams);
  };

  // 表格列定义
  const columns: ColumnsType<Department> = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      sorter: true,
    },
     {
      title: '负责人',
      dataIndex: ['manager', 'username'],
      key: 'managerName',
      width: 120,
      render: (text) => text || '未设置',
    },
    {
      title: '上级部门',
      dataIndex: ['parent', 'name'],
      key: 'parentName',
      width: 150,
      render: (text) => text || '无',
    },
    {
      title: '部门层级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      align: 'center',
      render: (level: number) => (
        <Tag color="blue">
          {level}级
        </Tag>
      ),
      sorter: (a: Department, b: Department) => a.level - b.level,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '用户数',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 80,
      align: 'center',
      render: (count: number) => count || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (text) => new Date(text).toLocaleString(),
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
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个部门吗？"
            description="删除后不可恢复，请谨慎操作。"
            onConfirm={() => handleDelete(String(record.id))}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={actionLoading}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>

      {/* 搜索表单 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input
              placeholder="搜索部门名称"
              value={searchForm.search}
              onChange={(e) =>
                setSearchForm({ ...searchForm, search: e.target.value })
              }
              onPressEnter={handleSearch}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态"
              allowClear
              style={{ width: '100%' }}
              value={searchForm.isActive}
              onChange={(value) =>
                setSearchForm({ ...searchForm, isActive: value })
              }
            >
              <Option value={true}>启用</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={refresh}
                loading={loading}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Table
        columns={columns}
        dataSource={departments}
        rowKey="id"
        loading={loading}
        expandable={{
          childrenColumnName: 'nonExistentField', // 指定一个不存在的字段名，禁用展开功能
        }}
        pagination={{
          current: searchForm.page,
          pageSize: searchForm.limit,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: handleTableChange,
          onShowSizeChange: handleTableChange,
        }}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
};