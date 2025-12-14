import React from 'react';
import { 
  Button, 
  Tag, 
  Dropdown,
} from 'antd';
import type { ProColumns, ProTableProps } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  DownloadOutlined, 
  UploadOutlined,
  ReloadOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import type { OperationInfo, OperationQueryParams } from '@zyerp/shared';
import operationService from '../services/operation.service';
import { useMessage, useModal } from '@/shared/hooks';
import { normalizeTableParams, type TableParams } from '@/shared/utils/normalizeTableParams';

interface OperationListProps {
  operations: OperationInfo[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onAdd?: () => void;
  onEdit?: (operation: OperationInfo) => void;
  onView?: (operation: OperationInfo) => void;
  onDelete?: (id: string) => Promise<void>;
  onPageChange?: (page: number, pageSize: number) => void;
  onRefresh?: () => void;
}

const OperationList: React.FC<OperationListProps> = ({
  operations,
  loading,
  total,
  page,
  pageSize,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onPageChange,
  onRefresh
}) => {
  // 共享hooks
  const modal = useModal();
  const message = useMessage();

  // 表格列定义
  const columns: ProColumns<OperationInfo>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
      search: false,
    },
    {
      title: '工序编码',
      dataIndex: 'code',
      width: 120,
      ellipsis: true,
      search: true,
    },
    {
      title: '工序名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
      search: true,
    },
    {
      title: '标准工时(分钟)',
      dataIndex: 'standardTime',
      width: 120,
      search: false,
      render: (_, record) => record.standardTime ? record.standardTime.toFixed(2) : '-',
    },
    {
      title: '工价',
      dataIndex: 'wageRate',
      width: 120,
      search: false,
      render: (_, record) => record.wageRate ? record.wageRate.toFixed(2) : '0.0',
    },
    {
      title: '不良品项',
      dataIndex: 'defects',
      width: 200,
      search: false,
      render: (_, record: OperationInfo) => {
        const defects = (record.defects || []) as { id: string; name: string }[];
        return (
          <>
            {defects.slice(0, 3).map((defect) => (
              <Tag key={defect.id}>{defect.name}</Tag>
            ))}
            {defects.length > 3 && (
              <Tag>+{defects.length - 3}...</Tag>
            )}
          </>
        );
      },
    },
    
    {
      title: '描述',
      dataIndex: 'description',
      width: 200,
      ellipsis: true,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      width: 80,
      search: false,
      render: (_, record) => (
        <Tag color={record.isActive ? 'success' : 'default'}>
          {record.isActive ? '启用' : '停用'}
        </Tag>
      ),
      valueType: 'select',
      valueEnum: {
        true: { text: '启用' },
        false: { text: '停用' }
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      search: false,
      render: (_, record) => new Date(record.createdAt).toLocaleString(),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="view"
          onClick={() => onView?.(record)}
        >
          查看
        </a>,
        <a
          key="edit"
          onClick={() => onEdit?.(record)}
        >
          编辑
        </a>,
        <Dropdown
          key="more"
          menu={{
            items: [
              {
                label: '删除',
                key: 'delete',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => {
                  modal.confirm({
                    title: '确认删除',
                    content: `确定要删除工序 "${record.name}" 吗？`,
                    onOk: async () => {
                      try {
                        await onDelete?.(record.id);
                        onRefresh?.();
                      } catch (error) {
                        console.error('删除失败:', error);
                        message.error('删除失败');
                      }
                    }
                  });
                }
              }
            ]
          }}
        >
          <a>
            更多 <EllipsisOutlined />
          </a>
        </Dropdown>
      ]
    }
  ];

  // 处理表格请求
  const handleRequest: ProTableProps<OperationInfo, OperationQueryParams>['request'] = async (params) => {
    try {
      const base = normalizeTableParams(params as TableParams);
      const queryParams: OperationQueryParams = {
        page: base.page,
        pageSize: base.pageSize,
        keyword: params.keyword,
        isActive: params.isActive,
      };

      // 清理空值参数
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof OperationQueryParams] === undefined) {
          delete queryParams[key as keyof OperationQueryParams];
        }
      });

      const response = await operationService.getList(queryParams);
      
      return {
        data: response.data || [],
        success: response.success,
        total: response.pagination?.total || 0,
      };
    } catch (error) {
      console.error('获取工序数据失败:', error);
      message.error('获取工序数据失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 工具栏渲染
  const toolBarRender = () => [
    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={onAdd}>
      新增工序
    </Button>,
    <Button key="import" icon={<UploadOutlined />}>
      导入
    </Button>,
    <Button key="export" icon={<DownloadOutlined />}>
      导出
    </Button>,
    <Button key="refresh" icon={<ReloadOutlined />} onClick={onRefresh}>
      刷新
    </Button>
  ];

  return (
    <ProTable<OperationInfo>
      columns={columns}
      dataSource={operations}
      loading={loading}
      rowKey="id"
      pagination={{
        current: page,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
        onChange: onPageChange
      }}
      search={{
        labelWidth: 'auto',
      }}
      toolBarRender={toolBarRender}
      options={{
        setting: {
          listsHeight: 400,
        },
        fullScreen: false,
        reload: false, // 使用自定义刷新按钮
        density: false,
      }}
      scroll={{ x: 1400 }}
      request={handleRequest}
    />
  );
};

export default OperationList;
