/**
 * 部门成员列表组件
 */

import React, { useState, useEffect } from 'react';
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
  Avatar,
  message,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { departmentService } from '../services/department.service';
import type { 
  DepartmentMember, 
  DepartmentMemberListParams,
  DepartmentPosition,
  ID 
} from '@zyerp/shared';
import { DEPARTMENT_POSITIONS, getPositionInfo } from '@zyerp/shared';

const { Option } = Select;

interface DepartmentMemberListProps {
  departmentId: ID;
}

const DepartmentMemberList: React.FC<DepartmentMemberListProps> = ({ departmentId }) => {
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [positionFilter, setPositionFilter] = useState<DepartmentPosition | undefined>();
  const [isMainFilter, setIsMainFilter] = useState<boolean | undefined>();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // 获取部门成员列表
  const fetchMembers = async () => {
    if (!departmentId) return;
    
    setLoading(true);
    try {
      const params: DepartmentMemberListParams = {
        departmentId,
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
        position: positionFilter,
        isMain: isMainFilter,
      };
      
      const response = await departmentService.getDepartmentMembers(params);
      setMembers(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('获取部门成员列表失败:', error);
      message.error('获取部门成员列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [departmentId, pagination.current, pagination.pageSize]);

  // 搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchMembers();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchText('');
    setPositionFilter(undefined);
    setIsMainFilter(undefined);
    setPagination({ ...pagination, current: 1 });
    setTimeout(fetchMembers, 0);
  };

  // 删除成员
  const handleDeleteMember = async (userId: ID) => {
    try {
      await departmentService.removeUserFromDepartment(userId, departmentId);
      message.success('移除成员成功');
      fetchMembers();
    } catch (error) {
      console.error('移除成员失败:', error);
      message.error('移除成员失败');
    }
  };

  // 获取职位选项
  const getPositionOptions = () => {
    return Object.values(DEPARTMENT_POSITIONS).map(pos => ({
      label: pos.name,
      value: pos.key,
    }));
  };

  // 表格列定义
  const columns: ColumnsType<DepartmentMember> = [
    {
      title: '成员信息',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar src={record.user.avatar} size="small">
            {record.user.username.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div>{record.user.username}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.user.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      render: (position: DepartmentPosition) => {
        const positionInfo = getPositionInfo(position);
        return (
          <Tag color="blue">
            {positionInfo.name}
          </Tag>
        );
      },
    },
    {
      title: '主要部门',
      dataIndex: 'isMain',
      key: 'isMain',
      render: (isMain: boolean) => (
        <Tag color={isMain ? 'green' : 'default'}>
          {isMain ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '加入时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              // TODO: 实现编辑功能
              message.info('编辑功能待实现');
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要移除该成员吗？"
            onConfirm={() => handleDeleteMember(record.userId)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              移除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="部门成员管理">
      {/* 搜索和筛选区域 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Input
            placeholder="搜索成员姓名或邮箱"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="职位筛选"
            value={positionFilter}
            onChange={setPositionFilter}
            allowClear
            style={{ width: '100%' }}
          >
            {getPositionOptions().map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select
            placeholder="主要部门"
            value={isMainFilter}
            onChange={setIsMainFilter}
            allowClear
            style={{ width: '100%' }}
          >
            <Option value={true}>是</Option>
            <Option value={false}>否</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              搜索
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重置
            </Button>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => {
                // TODO: 实现添加成员功能
                message.info('添加成员功能待实现');
              }}
            >
              添加成员
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 成员列表表格 */}
      <Table
        columns={columns}
        dataSource={members}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize: pageSize || 10 });
          },
        }}
      />
    </Card>
  );
};

export default DepartmentMemberList;