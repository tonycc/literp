import React, { useRef } from 'react';
import {
  Button,
  Dropdown,
} from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import {
  PlusOutlined,
  DeleteOutlined,
  HistoryOutlined,
  CalculatorOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import type { ProductBom } from '@zyerp/shared';
import { useBom } from '../hooks/useBom';


interface BomListProps {
  boms?: ProductBom[];
  loading?: boolean;
  onEdit: (bom: ProductBom) => void;
  onView: (bom: ProductBom) => void;
  onAdd: () => void;
  onRefresh: () => void;
  onCopy: (bom: ProductBom) => void;
  onDelete: (bomId: string) => void;
  onShowVersionManager: () => void;
  onShowCostCalculator: () => void;
}

const BomList: React.FC<BomListProps> = ({ 
  boms: propsBoms, 
  loading: propsLoading, 
  onEdit, 
  onView, 
  onAdd, 
  onDelete,
  onShowVersionManager,
  onShowCostCalculator
}) => {
  const { 
    boms: hookBoms, 
    loading: hookLoading
  } = useBom();
  
  // 优先使用从props传递的数据，如果没有则使用hook获取的数据
  const boms = propsBoms ?? hookBoms;
  const loading = propsLoading ?? hookLoading;
  
  // BOM列表列定义
  const bomColumns: ProColumns<ProductBom>[] = [
    {
      title: 'BOM编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left',
    },
    {
      title: 'BOM名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      search: true
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      search: true
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
      search: true
    },
    {
      title: '基准单位',
      dataIndex: 'baseUnitName',
      key: 'baseUnitName',
      width: 100,
      search: false
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      search: false
    },
    
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 120,
      render: (_, record: ProductBom) => record.effectiveDate ? new Date(record.effectiveDate).toLocaleDateString() : '-',
      search: true,
      valueType: 'date'
    },
    {
      title: '失效日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (_, record: ProductBom) => record.expiryDate ? new Date(record.expiryDate).toLocaleDateString() : '-',
      search: true,
      valueType: 'date'
    },
    {
      title: '工艺路线编码',
      dataIndex: 'routingCode',
      key: 'routingCode',
      width: 120,
      search: true
    },
    {
      title: '工艺路线名称',
      dataIndex: 'routingName',
      key: 'routingName',
      width: 150,
      search: true
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 150,
      fixed: 'right',
      render: (text, record) => [
        <a
          key="view"
          onClick={() => onView(record)}
        >
          查看结构
        </a>,
        <a
          key="edit"
          onClick={() => onEdit(record)}
        >
          编辑
        </a>,
       
        <Dropdown
          key="more"
          menu={{
            items: [
              {
                label: '版本管理',
                key: 'version',
                icon: <HistoryOutlined />,
                onClick: () => onShowVersionManager()
              },
              {
                label: '成本计算',
                key: 'cost',
                icon: <CalculatorOutlined />,
                onClick: () => onShowCostCalculator()
              },
              {
                type: 'divider'
              },
              {
                label: '删除',
                key: 'delete',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => {
                  // 使用确认对话框
                  if (window.confirm('确定删除此BOM吗？')) {
                    onDelete(record.id);
                  }
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

  const actionRef = useRef<ActionType>(null);

  return (
      
        <ProTable<ProductBom>
          columns={bomColumns}
          actionRef={actionRef}
          cardBordered
          dataSource={boms}
          loading={loading}
          rowKey="id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          pageSize: 10
        }}
        search={{
          labelWidth: 'auto',
          searchText: '查询',
          resetText: '重置',
          className: 'bom-search-form'
        }}
        headerTitle="BOM清单"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
          >
            新建BOM
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
        scroll={{ x: 1800 }}
        onRow={(record) => ({
          onClick: () => onView(record),
          style: { 
            cursor: 'pointer'
          }
        })}
      />
  );
};

export default BomList;