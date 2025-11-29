import React, { useRef, useState } from 'react';
import { Button, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import type { Permission } from '@zyerp/shared';
import { useModal } from '@/shared/hooks/useModal';
import { permissionService } from '../services/permission.service';
import { usePermission } from '../hooks/usePermission';
import PermissionForm from './PermissionForm';
import { PERMISSION_RESOURCE_VALUE_ENUM, PERMISSION_ACTION_VALUE_ENUM } from '../constants/permission';
import type { CreatePermissionData } from '../services/permission.service';

const PermissionList: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [formVisible, setFormVisible] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null);
  
  const modal = useModal();
  const { handleCreate, handleUpdate, handleDelete, setSelectedItems } = usePermission();

  const handleEdit = (record: Permission) => {
    setCurrentPermission(record);
    setFormVisible(true);
  };

  const handleRemove = (record: Permission) => {
    modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除权限"${record.name}"吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const success = await handleDelete(String(record.id));
        if (success) {
          await actionRef.current?.reload();
        }
      },
    });
  };

  const handleSubmit = async (values: CreatePermissionData) => {
    let success = false;
    if (currentPermission) {
      success = await handleUpdate(String(currentPermission.id), values);
    } else {
      success = await handleCreate(values);
    }

    if (success) {
      setFormVisible(false);
      await actionRef.current?.reload();
    }
    return success;
  };

  const columns: ProColumns<Permission>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
      ellipsis: true,
      formItemProps: {
        rules: [{ required: true, message: '此项为必填项' }],
      },
    },
    {
      title: '权限代码',
      dataIndex: 'code',
      copyable: true,
      ellipsis: true,
      render: (_, record) => <Tag color="blue">{record.code}</Tag>,
    },
    {
      title: '资源',
      dataIndex: 'resource',
      valueType: 'select',
      valueEnum: PERMISSION_RESOURCE_VALUE_ENUM,
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      valueType: 'select',
      valueEnum: PERMISSION_ACTION_VALUE_ENUM,
      render: (_, record) => {
        const enumItem = PERMISSION_ACTION_VALUE_ENUM[record.action as keyof typeof PERMISSION_ACTION_VALUE_ENUM];
        return <Tag color={enumItem?.color}>{enumItem?.text || record.action}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          编辑
        </Button>,
        <Button key="delete" type="link" danger icon={<DeleteOutlined />} onClick={() => handleRemove(record)}>
          删除
        </Button>,
      ],
    },
  ];

  return (
    <>
      <ProTable<Permission>
        headerTitle="权限列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setCurrentPermission(null);
              setFormVisible(true);
            }}
          >
            新增权限
          </Button>,
        ]}
        request={async (params, sort) => {
          const { current, pageSize, ...rest } = params;
          
          let sortBy: string | undefined;
          let sortOrder: 'asc' | 'desc' | undefined;
          
          if (sort && Object.keys(sort).length > 0) {
            const field = Object.keys(sort)[0];
            const order = sort[field];
            if (order) {
              sortBy = field;
              sortOrder = order === 'ascend' ? 'asc' : 'desc';
            }
          }

          const res = await permissionService.getList({
            page: current,
            limit: pageSize,
            sortBy,
            sortOrder,
            ...rest,
          });
          return {
            data: res.data,
            success: res.success,
            total: res.pagination.total,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedItems(selectedRows);
          },
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
      <PermissionForm
        visible={formVisible}
        onVisibleChange={setFormVisible}
        initialValues={currentPermission}
        onFinish={handleSubmit}
      />
    </>
  );
};

export default PermissionList;
