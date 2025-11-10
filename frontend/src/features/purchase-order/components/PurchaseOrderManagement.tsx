import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Row,
  Col,
  Tag,
  Typography,
  Tooltip,
  message,
  Modal,
  Popconfirm
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PurchaseOrderStatus } from '../types';
import type { PurchaseOrder, PurchaseOrderQueryParams } from '../types';
import AddPurchaseOrderModal from './AddPurchaseOrderModal';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 模拟数据
const mockData: PurchaseOrder[] = [
  {
    id: '1',
    orderNumber: 'PO202401001',
    supplierId: 'SUP001',
    supplierName: '上海精密机械有限公司',
    items: [
      {
        id: '1-1',
        productCode: 'FP002',
        productName: '精密齿轮',
        specification: '模数2.5，齿数40，材质45#钢',
        quantity: 100,
        unit: '件',
        unitPrice: 85.00,
        subtotal: 8500.00,
        batchNumber: 'BATCH20240101'
      }
    ],
    orderAmount: 8500.00,
    orderDate: '2024-01-15',
    expectedDeliveryDate: '2024-02-15',
    status: PurchaseOrderStatus.ORDERED,
    createdAt: '2024-01-15 09:30:00',
    updatedAt: '2024-01-15 09:30:00',
    createdBy: '张三',
    remark: '紧急订单，请优先处理'
  },
  {
    id: '2',
    orderNumber: 'PO202401002',
    supplierId: 'SUP002',
    supplierName: '北京液压设备厂',
    items: [
      {
        id: '2-1',
        productCode: 'FP003',
        productName: '液压缸体',
        specification: '缸径100mm，行程200mm，工作压力16MPa',
        quantity: 50,
        unit: '台',
        unitPrice: 1200.00,
        subtotal: 60000.00,
        batchNumber: 'BATCH20240102'
      }
    ],
    orderAmount: 60000.00,
    orderDate: '2024-01-16',
    expectedDeliveryDate: '2024-02-20',
    status: PurchaseOrderStatus.PARTIAL_RECEIVED,
    createdAt: '2024-01-16 14:20:00',
    updatedAt: '2024-01-20 10:15:00',
    createdBy: '李四',
    remark: '已收货30台，剩余20台预计下周到货'
  },
  {
    id: '3',
    orderNumber: 'PO202401003',
    supplierId: 'SUP003',
    supplierName: '深圳电机制造有限公司',
    items: [
      {
        id: '3-1',
        productCode: 'FP004',
        productName: '电机外壳',
        specification: '铝合金材质，防护等级IP65，尺寸200×150×100mm',
        quantity: 200,
        unit: '个',
        unitPrice: 45.00,
        subtotal: 9000.00,
        batchNumber: 'BATCH20240103'
      }
    ],
    orderAmount: 9000.00,
    orderDate: '2024-01-18',
    expectedDeliveryDate: '2024-02-25',
    status: PurchaseOrderStatus.RECEIVED,
    createdAt: '2024-01-18 11:45:00',
    updatedAt: '2024-02-22 16:30:00',
    createdBy: '王五',
    remark: '质量检验合格，已入库'
  },
  {
    id: '4',
    orderNumber: 'PO202401004',
    supplierId: 'SUP004',
    supplierName: '天津传动设备公司',
    items: [
      {
        id: '4-1',
        productCode: 'FP005',
        productName: '传动轴',
        specification: '直径50mm，长度500mm，材质40Cr',
        quantity: 80,
        unit: '根',
        unitPrice: 150.00,
        subtotal: 12000.00,
        batchNumber: 'BATCH20240104'
      }
    ],
    orderAmount: 12000.00,
    orderDate: '2024-01-20',
    expectedDeliveryDate: '2024-03-01',
    status: PurchaseOrderStatus.PENDING,
    createdAt: '2024-01-20 08:15:00',
    updatedAt: '2024-01-20 08:15:00',
    createdBy: '赵六',
    remark: '等待供应商确认交期'
  },
  {
    id: '5',
    orderNumber: 'PO202401005',
    supplierId: 'SUP005',
    supplierName: '广州轴承制造厂',
    items: [
      {
        id: '5-1',
        productCode: 'FP006',
        productName: '精密轴承',
        specification: '内径30mm，外径62mm，宽度16mm，精度P5',
        quantity: 300,
        unit: '套',
        unitPrice: 25.00,
        subtotal: 7500.00,
        batchNumber: 'BATCH20240105'
      }
    ],
    orderAmount: 7500.00,
    orderDate: '2024-01-22',
    expectedDeliveryDate: '2024-02-28',
    status: PurchaseOrderStatus.COMPLETED,
    createdAt: '2024-01-22 13:20:00',
    updatedAt: '2024-02-25 09:45:00',
    createdBy: '孙七',
    remark: '订单已完成，质量优良'
  }
];

// 状态标签配置
const statusConfig = {
  [PurchaseOrderStatus.DRAFT]: { color: 'default', text: '草稿' },
  [PurchaseOrderStatus.PENDING]: { color: 'orange', text: '待审核' },
  [PurchaseOrderStatus.APPROVED]: { color: 'blue', text: '已审核' },
  [PurchaseOrderStatus.ORDERED]: { color: 'cyan', text: '已下单' },
  [PurchaseOrderStatus.PARTIAL_RECEIVED]: { color: 'purple', text: '部分收货' },
  [PurchaseOrderStatus.RECEIVED]: { color: 'green', text: '已收货' },
  [PurchaseOrderStatus.COMPLETED]: { color: 'success', text: '已完成' },
  [PurchaseOrderStatus.CANCELLED]: { color: 'red', text: '已取消' }
};

const PurchaseOrderManagement: React.FC = () => {
  const [data, setData] = useState<PurchaseOrder[]>(mockData);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState<PurchaseOrderQueryParams>({
    page: 1,
    pageSize: 10
  });

  // 搜索和筛选状态
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PurchaseOrderStatus | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  
  // 弹窗状态
  const [addModalVisible, setAddModalVisible] = useState(false);

  // 表格列定义
  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
      fixed: 'left',
      render: (text: string) => (
        <Button type="link" size="small">
          {text}
        </Button>
      )
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 150,
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '产品信息',
      key: 'productInfo',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (_, record: PurchaseOrder) => {
        const firstItem = record.items[0];
        const itemCount = record.items.length;
        const displayText = firstItem ? 
          `${firstItem.productName} (${firstItem.productCode})` : 
          '暂无产品';
        const tooltipText = itemCount > 1 ? 
          `${displayText}\n共${itemCount}个产品` : 
          displayText;
        
        return (
          <Tooltip title={tooltipText}>
            <div>
              {displayText}
              {itemCount > 1 && (
                 <Tag color="blue" style={{ marginLeft: 4, fontSize: '12px' }}>
                   +{itemCount - 1}
                 </Tag>
               )}
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: '规格',
      key: 'specification',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (_, record: PurchaseOrder) => {
        const firstItem = record.items[0];
        const text = firstItem?.specification || '-';
        return (
          <Tooltip title={text}>
            {text}
          </Tooltip>
        );
      }
    },
    {
      title: '产品数量',
      key: 'itemCount',
      width: 100,
      align: 'center',
      render: (_, record: PurchaseOrder) => {
        const itemCount = record.items.length;
        const totalQuantity = record.items.reduce((sum, item) => sum + item.quantity, 0);
        return (
          <Tooltip title={`共${itemCount}种产品，总数量${totalQuantity}`}>
            <Tag color="green">{itemCount}种</Tag>
          </Tooltip>
        );
      }
    },
    {
      title: '订单金额',
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      width: 120,
      align: 'right',
      render: (value: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          ¥{value.toFixed(2)}
        </span>
      )
    },
    {
      title: '订单日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 110
    },
    {
      title: '预期交付日期',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 130
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PurchaseOrderStatus) => {
        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 150
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record: PurchaseOrder) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个采购订单吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  // 处理搜索
  const handleSearch = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      let filteredData = mockData;

      if (searchText) {
        filteredData = filteredData.filter(item =>
          item.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
          item.supplierName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.items.some(product => 
            product.productName.toLowerCase().includes(searchText.toLowerCase()) ||
            product.productCode.toLowerCase().includes(searchText.toLowerCase())
          )
        );
      }

      if (selectedStatus) {
        filteredData = filteredData.filter(item => item.status === selectedStatus);
      }

      if (dateRange) {
        filteredData = filteredData.filter(item => {
          const orderDate = new Date(item.orderDate);
          const startDate = new Date(dateRange[0]);
          const endDate = new Date(dateRange[1]);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      setData(filteredData);
      setLoading(false);
    }, 500);
  };

  // 重置筛选
  const handleReset = () => {
    setSearchText('');
    setSelectedStatus(undefined);
    setDateRange(null);
    setData(mockData);
  };

  // 查看详情
  const handleView = (record: PurchaseOrder) => {
    Modal.info({
      title: `采购订单详情 - ${record.orderNumber}`,
      width: 1000,
      content: (
        <div style={{ marginTop: 16 }}>
          <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
            <Col span={12}><strong>供应商：</strong>{record.supplierName}</Col>
            <Col span={12}><strong>订单金额：</strong>¥{record.orderAmount.toFixed(2)}</Col>
            <Col span={12}><strong>订单日期：</strong>{record.orderDate}</Col>
            <Col span={12}><strong>预期交付：</strong>{record.expectedDeliveryDate}</Col>
            <Col span={12}><strong>创建人：</strong>{record.createdBy}</Col>
            <Col span={12}><strong>状态：</strong>
              <Tag color={statusConfig[record.status].color}>
                {statusConfig[record.status].text}
              </Tag>
            </Col>
            {record.remark && (
              <Col span={24}><strong>备注：</strong>{record.remark}</Col>
            )}
          </Row>
          
          <div style={{ marginBottom: 8 }}>
            <strong>产品清单：</strong>
          </div>
          <Table
            dataSource={record.items}
            pagination={false}
            size="small"
            rowKey="id"
            columns={[
              { title: '产品编码', dataIndex: 'productCode', width: 100 },
              { title: '产品名称', dataIndex: 'productName', width: 150 },
              { title: '规格', dataIndex: 'specification', ellipsis: true },
              { 
                title: '数量', 
                dataIndex: 'quantity', 
                width: 80,
                render: (value: number, item) => `${value} ${item.unit}`
              },
              { 
                title: '单价', 
                dataIndex: 'unitPrice', 
                width: 100,
                render: (value: number) => `¥${value.toFixed(2)}`
              },
              { 
                title: '小计', 
                dataIndex: 'subtotal', 
                width: 100,
                render: (value: number) => `¥${value.toFixed(2)}`
              },
              { title: '批次号', dataIndex: 'batchNumber', width: 120 }
            ]}
          />
        </div>
      )
    });
  };

  // 编辑订单
  const handleEdit = (record: PurchaseOrder) => {
    message.info(`编辑采购订单：${record.orderNumber}`);
  };

  // 删除订单
  const handleDelete = (id: string) => {
    setData(data.filter(item => item.id !== id));
    message.success('删除成功');
  };

  // 新增订单
  const handleAdd = () => {
    setAddModalVisible(true);
  };

  // 处理新增成功
  const handleAddSuccess = () => {
    setAddModalVisible(false);
    handleSearch(); // 刷新列表
  };

  // 处理取消新增
  const handleAddCancel = () => {
    setAddModalVisible(false);
  };

  // 导出数据
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            采购订单管理
          </Title>
        </div>

        {/* 搜索筛选区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Input
              placeholder="搜索订单号、供应商、产品名称或编码"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={8} md={4} lg={2}>
            <Select
              placeholder="状态"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              style={{ width: '100%' }}
            >
              {Object.entries(statusConfig).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.text}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <RangePicker
              placeholder={['订单开始日期', '订单结束日期']}
              onChange={(dates) => {
                if (dates) {
                  setDateRange([dates[0]!.format('YYYY-MM-DD'), dates[1]!.format('YYYY-MM-DD')]);
                } else {
                  setDateRange(null);
                }
              }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
              >
                搜索
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置筛选
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                新增订单
              </Button>
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 2000, y: 600 }}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              setQueryParams({ ...queryParams, page, pageSize });
            }
          }}
        />
      </Card>

      {/* 新增采购订单弹窗 */}
      <AddPurchaseOrderModal
        visible={addModalVisible}
        onCancel={handleAddCancel}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default PurchaseOrderManagement;