import React, { useMemo, useCallback, useState } from 'react';
import {
  Tag,
  Button,
  Space,
  Tooltip,
  Image,
  Dropdown,
} from 'antd';
import { useModal } from '@/shared/hooks';
import type { MenuProps } from 'antd';
import {
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import type { ProColumns, ActionType, ProTableProps } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { PRODUCT_TYPE_OPTIONS, PRODUCT_STATUS_OPTIONS, PRODUCT_TYPE_MAP } from '@zyerp/shared';
import type { ProductInfo, ProductQueryParams } from '@zyerp/shared';
import { productService } from '../services/product.service';
import StatusTag from '@/shared/components/StatusTag';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';
import { formatDate, formatCurrency } from '@/shared/utils/format';
import ProductVariantsModal from './ProductVariantsModal';

interface ProductListProps {
  onAdd: () => void;
  onEdit: (product: ProductInfo) => void;
  onView: (product: ProductInfo) => void;
  onDelete: (id: string) => Promise<void>;
  onCopy?: (id: string) => Promise<void>;
  onRefresh: () => void;
  actionRef?: React.Ref<ActionType>;
}

const ProductList: React.FC<ProductListProps> = React.memo(({
  onAdd,
  onEdit,
  onView,
  onDelete,
  onRefresh,
  actionRef,
}) => {
  const modal = useModal();
  
  const [variantsModalVisible, setVariantsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);

  const handleOpenVariantsModal = (product: ProductInfo) => {
    setSelectedProduct(product);
    setVariantsModalVisible(true);
  };

  const handleCloseVariantsModal = () => {
    setVariantsModalVisible(false);
    setSelectedProduct(null);
  };

  // 删除产品
  const handleDelete = useCallback(async (record: ProductInfo) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除产品 "${record.name}" 吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        await onDelete(record.id);
      }
    });
  }, [modal, onDelete]);

  // 更多操作菜单
  const getMoreActions = useCallback((record: ProductInfo): MenuProps['items'] => [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: () => onEdit?.(record)
    },
    {
      key: 'variants',
      label: '变体管理',
      icon: <ApartmentOutlined />,
      onClick: () => handleOpenVariantsModal(record)
    },
    
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record)
    }
  ], [onEdit, handleDelete]);

  // ProTable请求函数 - 使用useCallback优化
  const handleRequest = useCallback<NonNullable<ProTableProps<ProductInfo, ProductQueryParams>['request']>>(async (params, sort, filter) => {
    void sort;
    void filter;
    try {
      const base = normalizeTableParams(params as import('@/shared/utils/normalizeTableParams').TableParams)
      // 构建查询参数
      const queryParams: ProductQueryParams = {
        page: base.page,
        pageSize: base.pageSize,
        keyword: params.keyword,
        code: params.code,
        name: params.name,
        type: params.type,
        categoryId: params.categoryId,
        unitId: params.unitId,
        defaultWarehouseId: params.defaultWarehouseId,
        status: params.status,
        acquisitionMethod: params.acquisitionMethod,
        isActive: params.isActive !== undefined ? params.isActive : undefined,
        sortField: base.sortField || params.sortField,
        sortOrder: base.sortOrder || params.sortOrder
      };

      // 移除undefined的参数
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof ProductQueryParams] === undefined) {
          delete queryParams[key as keyof ProductQueryParams];
        }
      });

      const response = await productService.getProducts(queryParams);

      return {
        data: response.data,
        success: response.success,
        total: response.pagination?.total,
      };
    } catch (error) {
      console.error('获取产品列表失败:', error);
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  }, []);

  // 搜索防抖 - 使用useDebounce（如果可用）
  // const debouncedKeyword = useDebounce(keyword, 500);

  // 表格列定义 - 使用useMemo优化
  const columns: ProColumns<ProductInfo>[] = useMemo(() => [
    {
      title: '产品编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      fixed: 'left',
      render: (_, record: ProductInfo) => (
        <Tooltip title={record.code}>
          {record.code}
        </Tooltip>
      ),
      search: true
    },

    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: {
        showTitle: false
      },
      render: (_, record: ProductInfo) => (
        <Tooltip title={record.name}>
          <Space>
            {record.images && record.images.length > 0 && (
              <Image
                width={24}
                height={24}
                src={record.images[0].url}
                fallback=""
                preview={false}
                style={{ borderRadius: 4 }}
              />
            )}
            <span>{record.name}</span>
          </Space>
        </Tooltip>
      ),
      search: true
    },
    {
      title: '产品属性',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (_, record: ProductInfo) => {
        const typeInfo = PRODUCT_TYPE_MAP[record.type];
        return (
          <Tag color={typeInfo?.color}>
            {typeInfo?.label || '-'}
          </Tag>
        );
      },
      valueType: 'select',
      valueEnum: PRODUCT_TYPE_OPTIONS.reduce((acc, cur) => {
        acc[cur.value] = { text: cur.label };
        return acc;
      }, {} as Record<string, { text: string }>),
      search: true
    },
    {
      title:'产品类目',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (_, record: ProductInfo) => record.category?.name || '-',
      search: true
    },
    {
      title: '变体数量',
      dataIndex: 'variantCount',
      key: 'variantCount',
      width: 100,
      align: 'right',
      render: (_, record: ProductInfo) => record.variantCount ?? 0,
      hideInSearch: true
    },
    {
      title: '获取方式',
      dataIndex: 'acquisitionMethod',
      key: 'acquisitionMethod',
      width: 80,
      render: (_, record: ProductInfo) => (
        <StatusTag value={record.acquisitionMethod} type="acquisitionMethod" />
      )
    },
    {
      title: '规格说明',
      dataIndex: 'specification',
      key: 'specification',
      width: 150,
      ellipsis: {
        showTitle: false
      },
      render: (_, record: ProductInfo) => (
        <Tooltip title={record.specification}>
          {record.specification || '-'}
        </Tooltip>
      ),
      search: true
    },
    {
      title: '计量单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (_, record: ProductInfo) => record.unit?.name || '-'
    },
    {
      title: '默认仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
      width: 120,
      ellipsis: true,
      render: (_, record: ProductInfo) => record.warehouse?.name || '-'
    },
    {
      title: '标准成本',
      dataIndex: 'standardCost',
      key: 'standardCost',
      width: 100,
      align: 'right',
      render: (_, record: ProductInfo) => formatCurrency(record.standardCost)
    },
    {
      title: '安全库存下限',
      dataIndex: 'safetyStockMin',
      key: 'safetyStockMin',
      width: 120,
      align: 'right',
      render: (_, record: ProductInfo) => record.safetyStockMin ?? '-'
    },
    {
      title: '安全库存上限',
      dataIndex: 'safetyStockMax',
      key: 'safetyStockMax',
      width: 120,
      align: 'right',
      render: (_, record: ProductInfo) => record.safetyStockMax ?? '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (_, record: ProductInfo) => (
        <StatusTag value={record.status} type="status" />
      ),
      valueType: 'select',
      valueEnum: PRODUCT_STATUS_OPTIONS.reduce((acc, cur) => {
        acc[cur.value] = { text: cur.label };
        return acc;
      }, {} as Record<string, { text: string }>),
      search: true
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (_, record: ProductInfo) => formatDate(record.updatedAt, 'date')
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      valueType: 'option',
      render: (_, record: ProductInfo) => {
        // 根据产品状态显示不同的操作按钮
        const getActionButtons = () => {
          const buttons: React.ReactNode[] = [];

          // 详情按钮
          buttons.push(
            <Button key="view" type="link" onClick={() => onView?.(record)}>
              详情
            </Button>
          );
          // 更多操作下拉菜单
          buttons.push(
            <Dropdown
              key="more"
              overlayClassName="product-dropdown-menu"
              menu={{ items: getMoreActions(record) }}
              placement="bottomRight"
            >
              <Button
                type="link"
                icon={<MoreOutlined />}
              />
            </Dropdown>
          );

          return buttons;
        };

        return getActionButtons();
      }
    }
  ], [onView, onEdit, onDelete, getMoreActions, handleDelete]);


  return (
    <>
      <ProTable<ProductInfo>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={handleRequest}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
        search={{
          labelWidth: 'auto',
          searchText: '查询',
          resetText: '重置',
        }}
        headerTitle="产品清单"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
          >
            新增产品
          </Button>,
          
          
          <Button
            key="import"
            icon={<ImportOutlined />}
          >
            导入
          </Button>,
          <Button
            key="export"
            icon={<ExportOutlined />}
          >
            导出
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
            listsHeight: 400
          },
          fullScreen: false,
          reload: true,
          density: false
        }}
        scroll={{ x: 1400 }}
      />
      {selectedProduct && (
        <ProductVariantsModal
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          visible={variantsModalVisible}
          onClose={handleCloseVariantsModal}
        />
      )}
    </>
  );
});

ProductList.displayName = 'ProductList';

export default ProductList;
