import React, { useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType, ProTableProps } from '@ant-design/pro-components';
import { Button, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { WorkcenterInfo } from '@zyerp/shared';
import { workcenterService } from '../services/workcenter.service';
import { useMessage } from '@/shared/hooks';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';

interface WorkcenterListProps {
  // 使用 ReturnType<typeof useRef<...>> 规避 React 19 中 MutableRefObject 的弃用提示
  actionRef?: ReturnType<typeof useRef<ActionType | undefined>>;
  onEdit?: (record: WorkcenterInfo) => void;
  onAdd?: (type?: string) => void;
  onRefresh?: () => void;
  onDelete?: (id: string) => Promise<void>;
  selectedRowKeys?: React.Key[];
  onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: WorkcenterInfo[]) => void;
  type?: string; // 筛选类型，如'TEAM'表示只显示车间
}

// ProTable 请求参数类型，避免使用 any
type WorkcenterTableParams = {
  current?: number;
  pageSize?: number;
  keyword?: string;
  active?: 'true' | 'false';
  type?: string;
} & Record<string, unknown>;

const WorkcenterList: React.FC<WorkcenterListProps> = ({ actionRef, onEdit, onAdd, onDelete, selectedRowKeys, onSelectChange, type }) => {
  const messageApi = useMessage();
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<React.Key[]>(selectedRowKeys || []);

  // 删除工作中心
  const handleDelete = async (id: string) => {
    try {
      if (onDelete) {
        await onDelete(id);
      } else {
        const response = await workcenterService.delete(id);
        if (response.success) {
          messageApi.success('删除成功');
        } else {
          messageApi.error(response.message || '删除失败');
          return;
        }
      }
      if (actionRef?.current?.reload) {
        void actionRef.current.reload();
      }
    } catch (error) {
      console.error('删除工作中心失败:', error);
      messageApi.error('删除失败');
    }
  };

  // 表格列定义
  const columns: ProColumns<WorkcenterInfo>[] = [
    {
      title: '编码',
      dataIndex: 'code',
      width: 120,
      fixed: 'left',
      sorter: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
      fixed: 'left',
      ellipsis: true,
      sorter: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      valueType: 'select',
      valueEnum: {
        TEAM: { text: '车间', status: 'Success' },
        EQUIPMENT: { text: '设备', status: 'Processing' },
        PRODUCTION_LINE: { text: '生产线', status: 'Default' },
        OUTSOURCING: { text: '外协', status: 'Warning' },
      },
    },
    {
      title: '负责人',
      dataIndex: 'manager',
      width: 140,
      hideInSearch: true,
      render: (_, record) =>
        record.manager?.username ??
        (record.managerId ? `#${record.managerId.slice(0, 8)}` : '-'),
    },
    {
      title: '车间人数',
      dataIndex: 'teamSize',
      width: 120,
      valueType: 'digit',
      hideInSearch: true,
      render: (_, record) => (record.type === 'TEAM' ? (record.teamSize ?? '-') : '-'),
    },
    {
      title: '产能',
      dataIndex: 'capacity',
      width: 100,
      valueType: 'digit',
      sorter: true,
    },
    {
      title: '每小时成本',
      dataIndex: 'costsHour',
      width: 120,
      valueType: 'money',
      sorter: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'active',
      width: 100,
      render: (_, record) => (
        <Tag color={record.active ? 'success' : 'default'}>
          {record.active ? '启用' : '停用'}
        </Tag>
      ),
      valueType: 'select',
      valueEnum: {
        true: { text: '启用', status: 'Success' },
        false: { text: '停用', status: 'Default' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个工作中心吗？"
            onConfirm={() => { void handleDelete(record.id) }}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              icon={<DeleteOutlined />}
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 请求工作中心列表数据
  const fetchData: ProTableProps<WorkcenterInfo, WorkcenterTableParams>['request'] = async (params, sort) => {
    try {
      const sortEntries = Object.entries(sort || {});
      const [sortByFromArg, sortOrderRaw] = sortEntries.length ? sortEntries[0] : [undefined, undefined];
      const sortOrderFromArg = sortOrderRaw === 'ascend' ? 'asc' : sortOrderRaw === 'descend' ? 'desc' : undefined;
      const base = normalizeTableParams(params);
      const sortBy = sortByFromArg || base.sortField;
      const sortOrder = (sortOrderFromArg || base.sortOrder) as ('asc' | 'desc' | undefined);
      const response = await workcenterService.getList({
        page: base.page,
        pageSize: base.pageSize,
        keyword: params.keyword as string,
        active: params.active !== undefined ? params.active === 'true' : undefined,
        type: type || params.type as string,
        sortBy,
        sortOrder,
      });
      
      return {
        data: response.data,
        success: response.success,
        total: response.pagination?.total || 0,
      };
    } catch (error) {
      console.error('获取工作中心列表失败:', error);
      messageApi.error('获取数据失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  return (
    <ProTable<WorkcenterInfo>
      columns={columns}
      actionRef={actionRef}
      request={fetchData}
      rowKey="id"
      debounceTime={300}
      search={{
        labelWidth: 'auto',
      }}
      pagination={{
        pageSize: 10,
      }}
      options={{ density: false, fullScreen: false, reload: true, setting: true }}
      columnsState={{
        persistenceKey: 'workcenter-list-columns',
        persistenceType: 'localStorage',
      }}
      rowSelection={{
        selectedRowKeys: selectedRowKeys ?? internalSelectedKeys,
        onChange: (keys, rows) => {
          if (onSelectChange) {
            onSelectChange(keys, rows);
          } else {
            setInternalSelectedKeys(keys);
          }
        },
      }}
      scroll={{ x: 'max-content' }}
      dateFormatter="string"
      headerTitle={type === 'TEAM' ? '车间管理' : '工作中心管理'}
      toolBarRender={(action, rowsArg) => {
        const items: React.ReactNode[] = [];
        const selectedCount = Array.isArray(rowsArg?.selectedRowKeys)
          ? rowsArg.selectedRowKeys.length
          : (selectedRowKeys ?? internalSelectedKeys).length;
        if (selectedCount > 0) {
          items.push(
            <Popconfirm
              key="batch-delete-confirm"
              title="确认批量删除"
              description={`确定删除选中的 ${selectedCount} 条记录吗？`}
              okText="确认"
              cancelText="取消"
                onConfirm={() => {
                  void (async () => {
                    try {
                      const keys = (rowsArg?.selectedRowKeys ?? (selectedRowKeys ?? internalSelectedKeys));
                      const keyList: React.Key[] = (keys || []).map(k => String(k))
                      await Promise.all(keyList.map((k) => handleDelete(String(k))));
                      if (!onSelectChange) {
                        setInternalSelectedKeys([]);
                      }
                      messageApi.success('批量删除完成');
                    } catch (e) {
                      console.error('批量删除失败:', e);
                      messageApi.error('批量删除失败');
                    }
                  })();
                }}
            >
              <Button key="batch-delete" danger>
                批量删除
              </Button>
            </Popconfirm>
          );
        }

        items.push(
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => onAdd?.(type)}
          >
            新建{type === 'TEAM' ? '车间' : '工作中心'}
          </Button>
        );

        return items;
      }}
    />
  );
};

export default WorkcenterList;
