import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Space,
  Card,
  message,
  Tag,
  Image,
  Tooltip,
  Modal
} from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons';
import type { SupplierPrice, SupplierPriceQueryParams } from '../types';

interface SupplierPriceManagementProps {
  className?: string;
}

const SupplierPriceManagement: React.FC<SupplierPriceManagementProps> = () => {
  const [dataSource, setDataSource] = useState<SupplierPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType>(null);

  // 模拟数据
  const mockData: SupplierPrice[] = [
    {
      id: '1',
      supplierId: 'SUP001',
      supplierName: '深圳市科技有限公司',
      productName: '钢材Q235',
      productImage: 'https://via.placeholder.com/60x60',
      productCode: 'RM001',
      specification: '厚度10mm，宽度1000mm',
      model: 'Q235B',
      unit: 'kg',
      taxInclusivePrice: 4.50,
      vatRate: 0.13,
      taxExclusivePrice: 3.98,
      taxAmount: 0.52,
      purchaseManager: '张经理',
      submittedBy: 'admin',
      submittedAt: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '2',
      supplierId: 'SUP001',
      supplierName: '深圳市科技有限公司',
      productName: '钢板半成品',
      productImage: 'https://via.placeholder.com/60x60',
      productCode: 'SF001',
      specification: '已切割成型',
      model: 'SF-001',
      unit: 'pcs',
      taxInclusivePrice: 25.80,
      vatRate: 0.13,
      taxExclusivePrice: 22.83,
      taxAmount: 2.97,
      purchaseManager: '张经理',
      submittedBy: 'admin',
      submittedAt: new Date('2024-01-16'),
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-21'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '3',
      supplierId: 'SUP002',
      supplierName: '上海物流配送有限公司',
      productName: '机械零件A',
      productImage: 'https://via.placeholder.com/60x60',
      productCode: 'FP001',
      specification: '精密加工，表面镀锌',
      model: 'ZJ-A001',
      unit: 'pcs',
      taxInclusivePrice: 128.50,
      vatRate: 0.13,
      taxExclusivePrice: 113.72,
      taxAmount: 14.78,
      purchaseManager: '李主管',
      submittedBy: 'admin',
      submittedAt: new Date('2024-02-01'),
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-05'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '4',
      supplierId: 'SUP001',
      supplierName: '深圳市科技有限公司',
      productName: '电子元器件',
      productImage: 'https://via.placeholder.com/60x60',
      productCode: 'EC001',
      specification: '高精度电阻',
      model: 'EC-R001',
      unit: 'pcs',
      taxInclusivePrice: 0.50,
      vatRate: 0.13,
      taxExclusivePrice: 0.44,
      taxAmount: 0.06,
      purchaseManager: '张经理',
      submittedBy: 'admin',
      submittedAt: new Date('2024-01-10'),
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '5',
      supplierId: 'SUP002',
      supplierName: '上海物流配送有限公司',
      productName: '物流包装材料',
      productImage: 'https://via.placeholder.com/60x60',
      productCode: 'PM001',
      specification: '防震包装盒',
      model: 'PM-BOX001',
      unit: 'pcs',
      taxInclusivePrice: 2.30,
      vatRate: 0.13,
      taxExclusivePrice: 2.04,
      taxAmount: 0.26,
      purchaseManager: '李主管',
      submittedBy: 'admin',
      submittedAt: new Date('2024-01-12'),
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-18'),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ];

  // 表格列定义
  const columns: ProColumns<SupplierPrice>[] = [
    {
      title: '产品信息',
      key: 'product',
      width: 300,
      render: (_, record) => (
        <Space>
          <Image
            width={60}
            height={60}
            src={record.productImage}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            style={{ borderRadius: 4 }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              编码: {record.productCode}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              规格: {record.specification}
            </div>
          </div>
        </Space>
      ),
      search: true
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 150,
      render: (text) => (
        <Tooltip title={text}>
          <div style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            maxWidth: '130px'
          }}>
            {text}
          </div>
        </Tooltip>
      ),
      search: true
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center'
    },
    {
      title: '含税单价',
      dataIndex: 'taxInclusivePrice',
      key: 'taxInclusivePrice',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <span style={{ color: '#f50', fontWeight: 'bold' }}>
          ¥{record.taxInclusivePrice.toFixed(2)}
        </span>
      )
    },
    {
      title: '税率',
      dataIndex: 'vatRate',
      key: 'vatRate',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{(record.vatRate * 100).toFixed(0)}%</Tag>
      ),
      valueType: 'select',
      valueEnum: {
        '0.13': { text: '13%' },
        '0.09': { text: '9%' },
        '0.06': { text: '6%' },
        '0.03': { text: '3%' }
      }
    },
    {
      title: '不含税单价',
      dataIndex: 'taxExclusivePrice',
      key: 'taxExclusivePrice',
      width: 120,
      align: 'right',
      render: (_, record) => `¥${record.taxExclusivePrice.toFixed(2)}`
    },
    {
      title: '税额',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      width: 100,
      align: 'right',
      render: (_, record) => `¥${record.taxAmount.toFixed(2)}`
    },
    {
      title: '采购负责人',
      dataIndex: 'purchaseManager',
      key: 'purchaseManager',
      width: 120,
      render: (_, record) => (
        <Space>
          <UserOutlined />
          {record.purchaseManager}
        </Space>
      ),
      search: true
    },
    {
      title: '提交信息',
      key: 'submit',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px' }}>
            提交人: {record.submittedBy}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {record.submittedAt.toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      valueType: 'option',
      render: (_, record) => [
        <Tooltip title="编辑" key="edit">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>,
        <Tooltip title="删除" key="delete">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Tooltip>
      ]
    }
  ];

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      setTimeout(() => {
        setDataSource(mockData);
        setLoading(false);
      }, 500);
    } catch {
      message.error('加载数据失败');
      setLoading(false);
    }
  };

  // 新增价格
  const handleAdd = () => {
    // 这里应该打开新增表单
    message.info('新增价格功能开发中...');
  };

  // 编辑价格
  const handleEdit = (record: SupplierPrice) => {
    // 这里应该打开编辑表单
    message.info(`编辑价格: ${record.productName}`);
  };

  // 删除价格信息
  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确定要删除这条价格记录吗？',
      content: '删除后无法恢复，请确认操作。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          // TODO: 调用删除API
          console.log('删除价格信息:', id);
          message.success('删除成功');
          loadData();
        } catch {
          message.error('删除失败');
        }
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding:0 }}>
      <ProTable<SupplierPrice>
        headerTitle="供应商价格表"
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        loading={loading}
        actionRef={actionRef}
        scroll={{ x: 1400 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
        }}
        search={{
          labelWidth: 'auto',
          span: 6,
          defaultCollapsed: false,
          collapsed: false,
        }}
        toolBarRender={() => [
          <Button
            key="import"
            icon={<ImportOutlined />}
            onClick={() => message.info('导入功能开发中...')}
          >
            导入价格表
          </Button>,
          <Button
            key="export"
            icon={<ExportOutlined />}
            onClick={() => message.info('导出功能开发中...')}
          >
            导出价格表
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增产品价格
          </Button>
        ]}
        options={{
          setting: {
            listsHeight: 400,
          },
          fullScreen: false,
          reload: true,
          density: false,
        }}
      />
    </div>
  );
};

export default SupplierPriceManagement;