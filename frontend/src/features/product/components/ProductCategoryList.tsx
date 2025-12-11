import React from 'react';
import {
  Button,
  Tooltip,
  Switch
} from 'antd';
import { useModal } from '@/shared/hooks/useModal';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ProColumns, ProTableProps } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import type {
  ProductCategoryInfo,
  ProductCategoryQueryParams
} from '@zyerp/shared';
import productCategoryService from '../services/productCategory.service';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';

interface ProductCategoryListProps {
  onAdd?: () => void;
  onEdit?: (category: ProductCategoryInfo) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string, isActive: boolean) => void;
  onRefresh?: () => void;
}

const ProductCategoryList: React.FC<ProductCategoryListProps> = ({
  onAdd,
  onEdit,
  onDelete,
  onToggleStatus,
  onRefresh
}) => {
  const modal = useModal();
  
  // 删除产品类目
  const handleDelete = (id: string) => {
    onDelete?.(id);
  };

  // 切换状态
  const handleToggleStatus = (id: string, isActive: boolean) => {
    onToggleStatus?.(id, isActive);
  };

  // ProTable请求函数
  const handleRequest: ProTableProps<ProductCategoryInfo, ProductCategoryQueryParams>['request'] = async (params) => {
    try {
      const base = normalizeTableParams(params as import('@/shared/utils/normalizeTableParams').TableParams)
      // 构建查询参数
      const queryParams: ProductCategoryQueryParams = {
        page: base.page,
        pageSize: base.pageSize,
        keyword: params.keyword,
        isActive: params.isActive !== undefined ? params.isActive : undefined,
        parentCode: params.parentCode,
        level: params.level,
        sortBy: base.sortField || params.sortBy,
        sortOrder: (base.sortOrder || params.sortOrder) as "asc" | "desc" | undefined
      };
      
      // 移除undefined的参数
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ProductCategoryQueryParams] === undefined) {
          delete queryParams[key as keyof ProductCategoryQueryParams];
        }
      });
      
      const response = await productCategoryService.getList(queryParams);
      
      return {
        data: response.data,
        success: response.success,
        total: response.pagination?.total,
      };
      } catch {
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 表格列定义
  const columns: ProColumns<ProductCategoryInfo>[] = [
    {
      title: '类目编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (_, record: ProductCategoryInfo) => (
        <span style={{ fontFamily: 'monospace' }}>{record.code}</span>
      ),
      search: true
    },
    {
      title: '类目名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (_, record: ProductCategoryInfo) => record.name,
      search: true
    },
    {
      title:'类目等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      align: 'center'
    },
    {
      title:'上级类目编码',
      dataIndex: 'parentCode',
      key: 'parentCode',
      width: 120,
      render: (_, record: ProductCategoryInfo) => record.parentCode || '-',
    },
    {
      title: '上级类目名称',
      dataIndex: 'parentName',
      key: 'parentName',
      width: 120,
      render: (_, record: ProductCategoryInfo) => record.parentName || '-',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (_, record: ProductCategoryInfo) => (
        <Tooltip placement="topLeft" title={record.description}>
          {record.description}
        </Tooltip>
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (_, record: ProductCategoryInfo) => (
        <Switch
          checked={record.isActive}
          onChange={(checked: boolean) => handleToggleStatus(record.id, checked)}
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      ),
      valueType: 'select',
      valueEnum: {
        true: { text: '启用' },
        false: { text: '停用' }
      },
      search: true
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: true,
      render: (_, record: ProductCategoryInfo) => record.createdAt.toLocaleString(),
      search: false
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      valueType: 'option',
      render: (_, record: ProductCategoryInfo) => [
        <Tooltip title="编辑" key="edit">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record)}
          />
        </Tooltip>,
        <Tooltip title="删除" key="delete">
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              modal.confirm({
                title: '确认删除',
                content: `确定要删除产品类目 "${record.name}" 吗？此操作不可恢复。`,
                okText: '确定',
                cancelText: '取消',
                okType: 'danger',
                onOk: () => handleDelete(record.id)
              });
            }}
          />
        </Tooltip>
      ]
    }
  ];

  return (
      <ProTable<ProductCategoryInfo>
        columns={columns}
        request={handleRequest}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range: [number, number]) =>
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          defaultPageSize: 10
        }}
        search={{
          labelWidth: 'auto',
          searchText: '查询',
          resetText: '重置',
        }}
        headerTitle="产品类目清单"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
          >
            新增产品类目
          </Button>,
          <Button 
            key="refresh" 
            icon={<ReloadOutlined />}
            onClick={onRefresh}
          >
            刷新
          </Button>,
        ]}
        options={{
          setting: {
            listsHeight: 400,
          },
          fullScreen: false,
          reload: true,
          density: false,
        }}
        scroll={{ x: 1200 }}
      />
  );
};

export default ProductCategoryList;
