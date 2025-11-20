import React from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ProTableProps } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import { Button, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { RoutingInfo, RoutingWorkcenterInfo, WorkcenterOption } from '@zyerp/shared';
import type { OperationOption } from '@zyerp/shared';
import { operationService } from '../../operation/services/operation.service';
import { routingService } from '../services/routing.service';
import { useMessage } from '@/shared/hooks';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';

interface RoutingListProps {
  onEdit?: (record: RoutingInfo) => void;
  onCreate?: () => void;
}
export interface RoutingListRef {
  reload: () => void;
}

const RoutingList = React.forwardRef<RoutingListRef, RoutingListProps>(({ onEdit, onCreate }, ref) => {
  const actionRef = React.useRef<ActionType | undefined>(undefined);
  const messageApi = useMessage();
  const [workcenterOptions, setWorkcenterOptions] = React.useState<WorkcenterOption[]>([]);
  const [operationOptions, setOperationOptions] = React.useState<OperationOption[]>([]);

  // 暴露给父组件用于触发表格刷新
  React.useImperativeHandle(ref, () => ({
    reload: () => {
      actionRef.current?.reload();
    }
  }));

  // 加载工作中心选项，用于在工序子列表中显示工作中心名称
  React.useEffect(() => {
    (async () => {
      try {
        const res = await routingService.getWorkcenterOptions({ _active: true });
        setWorkcenterOptions(res.data || []);
      } catch (error) {
        console.error('加载工作中心选项失败:', error);
        messageApi.error('加载工作中心选项失败');
      }
    })();
  }, [messageApi]);

  // 加载工序选项，用于在工序子列表中统一映射编码与名称
  React.useEffect(() => {
    (async () => {
      try {
        const res = await operationService.getOptions({ _isActive: true });
        setOperationOptions(res.data || []);
      } catch (error) {
        console.error('加载工序选项失败:', error);
        messageApi.error('加载工序选项失败');
      }
    })();
  }, [messageApi]);

  // 删除工艺路线
  const handleDelete = async (id: string) => {
    try {
      const response = await routingService.delete(id);
      if (response.success) {
        messageApi.success('删除成功');
        actionRef.current?.reload();
      } else {
        messageApi.error(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除工艺路线失败:', error);
      messageApi.error('删除失败');
    }
  };

  // 表格列定义
  const columns: ProColumns<RoutingInfo>[] = [
    {
      title: '编码',
      dataIndex: 'code',
      width: 120,
      fixed: 'left',
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
      fixed: 'left',
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
      filters: [
        { text: '启用', value: 'true' },
        { text: '停用', value: 'false' },
      ],
      filterMultiple: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      width: 150,
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
            description="确定要删除这个工艺路线吗？"
            onConfirm={() => handleDelete(record.id)}
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

  // 请求工艺路线列表数据
  const fetchData: ProTableProps<RoutingInfo, { current?: number; pageSize?: number; keyword?: string; active?: string }>['request'] = async (params) => {
    try {
      const base = normalizeTableParams(params as unknown as import('@/shared/utils/normalizeTableParams').TableParams)
      const response = await routingService.getList({
        page: base.page,
        pageSize: base.pageSize,
        keyword: params.keyword as string,
        active: params.active !== undefined ? params.active === 'true' : undefined,
      });
      
      return {
        data: response.data,
        success: response.success,
        total: response.pagination?.total || 0,
      };
    } catch (error) {
      console.error('获取工艺路线列表失败:', error);
      messageApi.error('获取数据失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  return (
    <ProTable<RoutingInfo>
      columns={columns}
      actionRef={actionRef}
      request={fetchData}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      pagination={{
        pageSize: 10,
      }}
      headerTitle="工艺路线列表"
      dateFormatter="string"
      toolBarRender={() => [
        <Button
          key="button"
          icon={<PlusOutlined />}
          type="primary"
          onClick={onCreate}
        >
          新建工艺路线
        </Button>,
      ]}
      expandable={{
        expandedRowRender: (record) => {
          const opColumns: ProColumns<RoutingWorkcenterInfo>[] = [
            {
              title: '序号',
              dataIndex: 'sequence',
              width: 80,
            },
            {
              title: '工序编码',
              dataIndex: 'operationId',
              width: 120,
              render: (_, r) => {
                const code = operationOptions.find((o) => o.value === r.operationId)?.code;
                return code || '—';
              }
            },
            {
              title: '工序名称',
              dataIndex: 'operationId',
              width: 200,
              render: (_, r) => {
                const label = operationOptions.find((o) => o.value === r.operationId)?.label;
                return label || '—';
              }
            },
             {
              title: '工作中心',
              dataIndex: 'workcenterId',
              width: 160,
              render: (_, r) => {
                const label = workcenterOptions.find((o) => o.value === r.workcenterId)?.label;
                return label || r.workcenterId || '—';
              }
            },
            {
              title: '标准工时',
              dataIndex: 'timeCycleManual',
              width: 120,
              render: (_, r) => `${r.timeCycleManual} 分钟`,
            },
            {
              title: '工价',
              dataIndex: 'wageRate',
              width: 120,
              valueType: 'digit',
              renderText: (text) =>
                typeof text === 'number' ? text.toFixed(2) : '0.00',
            },
          ];

          const requestOps = async (): Promise<{ data: RoutingWorkcenterInfo[]; success: boolean; total: number }> => {
            try {
              const response = await routingService.getOperations(record.id);
              return {
                data: response.data || [],
                success: response.success,
                total: (response.data || []).length,
              };
            } catch (error) {
              console.error('获取工序列表失败:', error);
              messageApi.error('获取工序列表失败');
              return { data: [], success: false, total: 0 };
            }
          };

          return (
            <ProTable<RoutingWorkcenterInfo>
              columns={opColumns}
              request={requestOps}
              rowKey="id"
              search={false}
              pagination={false}
              options={false}
              size="small"
            />
          );
        }
      }}
    />
  );
});

export default RoutingList;
