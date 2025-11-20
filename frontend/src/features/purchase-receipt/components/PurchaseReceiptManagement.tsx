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
import { PurchaseReceiptStatus } from '../types';
import type { PurchaseReceipt } from '../types';
import AddPurchaseReceiptModal from './AddPurchaseReceiptModal';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 模拟数据
const mockData: PurchaseReceipt[] = [
  {
    id: '1',
    receiptNumber: 'PR202401001',
    purchaseOrderNumber: 'PO202401001',
    productName: '精密齿轮',
    productCode: 'FP002',
    specification: '模数2.5，齿数40，材质45#钢',
    batchNumber: 'BATCH20240101',
    purchaseQuantity: 100,
    arrivedQuantity: 100,
    receivedQuantity: 80,
    unit: '件',
    orderDate: '2024-01-15',
    deliveryDate: '2024-02-15',
    receivedBy: '张三',
    registrationTime: '2024-02-10 14:30:00',
    status: PurchaseReceiptStatus.PARTIAL,
    createdAt: '2024-02-10 14:30:00',
    updatedAt: '2024-02-10 14:30:00',
    createdBy: '张三',
    remark: '部分入库，剩余20件待下次入库'
  },
  {
    id: '2',
    receiptNumber: 'PR202401002',
    purchaseOrderNumber: 'PO202401002',
    productName: '液压缸体',
    productCode: 'FP003',
    specification: '缸径100mm，行程200mm，工作压力16MPa',
    batchNumber: 'BATCH20240102',
    purchaseQuantity: 50,
    arrivedQuantity: 50,
    receivedQuantity: 50,
    unit: '台',
    orderDate: '2024-01-16',
    deliveryDate: '2024-02-20',
    receivedBy: '李四',
    registrationTime: '2024-02-18 09:15:00',
    status: PurchaseReceiptStatus.COMPLETED,
    createdAt: '2024-02-18 09:15:00',
    updatedAt: '2024-02-18 09:15:00',
    createdBy: '李四',
    remark: '质量检验合格，全部入库'
  },
  {
    id: '3',
    receiptNumber: 'PR202401003',
    purchaseOrderNumber: 'PO202401003',
    productName: '电机外壳',
    productCode: 'FP004',
    specification: '铝合金材质，防护等级IP65，尺寸200×150×100mm',
    batchNumber: 'BATCH20240103',
    purchaseQuantity: 200,
    arrivedQuantity: 180,
    receivedQuantity: 0,
    unit: '个',
    orderDate: '2024-01-18',
    deliveryDate: '2024-02-25',
    receivedBy: '王五',
    registrationTime: '2024-02-22 16:45:00',
    status: PurchaseReceiptStatus.PENDING,
    createdAt: '2024-02-22 16:45:00',
    updatedAt: '2024-02-22 16:45:00',
    createdBy: '王五',
    remark: '货物已到，待质检后入库'
  }
];

// 状态配置
const statusConfig = {
  [PurchaseReceiptStatus.PENDING]: { color: 'orange', text: '待入库' },
  [PurchaseReceiptStatus.PARTIAL]: { color: 'blue', text: '部分入库' },
  [PurchaseReceiptStatus.COMPLETED]: { color: 'green', text: '已完成' },
  [PurchaseReceiptStatus.CANCELLED]: { color: 'red', text: '已取消' }
};

const PurchaseReceiptManagement: React.FC = () => {
  const [data, setData] = useState<PurchaseReceipt[]>(mockData);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PurchaseReceiptStatus | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // 表格列定义
  const columns: ColumnsType<PurchaseReceipt> = [
    {
      title: '入库单编号',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      width: 130,
      fixed: 'left'
    },
    {
      title: '采购订单编号',
      dataIndex: 'purchaseOrderNumber',
      key: 'purchaseOrderNumber',
      width: 140
    },
    {
      title: '产品信息',
      key: 'productInfo',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (_, record: PurchaseReceipt) => (
        <Tooltip title={`${record.productName} (${record.productCode})`}>
          {record.productName} ({record.productCode})
        </Tooltip>
      )
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 200,
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
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 130
    },
    {
      title: '采购数量',
      dataIndex: 'purchaseQuantity',
      key: 'purchaseQuantity',
      width: 100,
      align: 'right',
      render: (value: number, record: PurchaseReceipt) => `${value} ${record.unit}`
    },
    {
      title: '到货数量',
      dataIndex: 'arrivedQuantity',
      key: 'arrivedQuantity',
      width: 100,
      align: 'right',
      render: (value: number, record: PurchaseReceipt) => `${value} ${record.unit}`
    },
    {
      title: '已入库数量',
      dataIndex: 'receivedQuantity',
      key: 'receivedQuantity',
      width: 110,
      align: 'right',
      render: (value: number, record: PurchaseReceipt) => `${value} ${record.unit}`
    },
    {
      title: '订单签订日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120
    },
    {
      title: '订单交付日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 120
    },
    {
      title: '入库员',
      dataIndex: 'receivedBy',
      key: 'receivedBy',
      width: 100
    },
    {
      title: '登记时间',
      dataIndex: 'registrationTime',
      key: 'registrationTime',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PurchaseReceiptStatus) => (
        <Tag color={statusConfig[status].color}>
          {statusConfig[status].text}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record: PurchaseReceipt) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这条入库记录吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  // 搜索处理
  const handleSearch = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      let filteredData = mockData;

      if (searchText) {
        filteredData = filteredData.filter(item =>
          item.receiptNumber.toLowerCase().includes(searchText.toLowerCase()) ||
          item.purchaseOrderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
          item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.productCode.toLowerCase().includes(searchText.toLowerCase()) ||
          item.batchNumber.toLowerCase().includes(searchText.toLowerCase()) ||
          item.receivedBy.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      if (selectedStatus) {
        filteredData = filteredData.filter(item => item.status === selectedStatus);
      }

      if (dateRange) {
        filteredData = filteredData.filter(item => {
          const registrationDate = new Date(item.registrationTime);
          const startDate = new Date(dateRange[0]);
          const endDate = new Date(dateRange[1]);
          return registrationDate >= startDate && registrationDate <= endDate;
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
  const handleView = (record: PurchaseReceipt) => {
    Modal.info({
      title: `采购入库详情 - ${record.receiptNumber}`,
      width: 800,
      content: (
        <div style={{ marginTop: 16 }}>
          <Row gutter={[16, 8]}>
            <Col span={12}><strong>入库单编号：</strong>{record.receiptNumber}</Col>
            <Col span={12}><strong>采购订单编号：</strong>{record.purchaseOrderNumber}</Col>
            <Col span={12}><strong>产品名称：</strong>{record.productName}</Col>
            <Col span={12}><strong>产品编码：</strong>{record.productCode}</Col>
            <Col span={24}><strong>规格型号：</strong>{record.specification}</Col>
            <Col span={12}><strong>批次号：</strong>{record.batchNumber}</Col>
            <Col span={12}><strong>单位：</strong>{record.unit}</Col>
            <Col span={8}><strong>采购数量：</strong>{record.purchaseQuantity}</Col>
            <Col span={8}><strong>到货数量：</strong>{record.arrivedQuantity}</Col>
            <Col span={8}><strong>已入库数量：</strong>{record.receivedQuantity}</Col>
            <Col span={12}><strong>订单签订日期：</strong>{record.orderDate}</Col>
            <Col span={12}><strong>订单交付日期：</strong>{record.deliveryDate}</Col>
            <Col span={12}><strong>入库员：</strong>{record.receivedBy}</Col>
            <Col span={12}><strong>登记时间：</strong>{record.registrationTime}</Col>
            <Col span={12}><strong>状态：</strong>
              <Tag color={statusConfig[record.status].color}>
                {statusConfig[record.status].text}
              </Tag>
            </Col>
            {record.remark && <Col span={24}><strong>备注：</strong>{record.remark}</Col>}
          </Row>
        </div>
      )
    });
  };

  // 编辑入库记录
  const handleEdit = (record: PurchaseReceipt) => {
    message.info(`编辑采购入库：${record.receiptNumber}`);
  };

  // 删除入库记录
  const handleDelete = (id: string) => {
    setData(data.filter(item => item.id !== id));
    message.success('删除成功');
  };

  // 新增入库记录
  const handleAdd = () => {
    setAddModalVisible(true);
  };

  // 新增成功回调
  const handleAddSuccess = () => {
    setAddModalVisible(false);
    handleSearch(); // 刷新列表
    message.success('新增采购入库成功');
  };

  // 取消新增
  const handleAddCancel = () => {
    setAddModalVisible(false);
  };

  // 导出数据
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  // 初始化数据
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Card>

        {/* 搜索筛选区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input
              placeholder="搜索入库单号、订单号、产品等"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择状态"
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
          <Col span={6}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
              onChange={(dates) => {
                if (dates) {
                  setDateRange([dates[0]?.format('YYYY-MM-DD') || '', dates[1]?.format('YYYY-MM-DD') || '']);
                } else {
                  setDateRange(null);
                }
              }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={8}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增入库
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
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
          scroll={{ x: 1800 }}
          pagination={{
            total: data.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
        />
      </Card>

      {/* 新增入库弹窗 */}
      <AddPurchaseReceiptModal
        visible={addModalVisible}
        onCancel={handleAddCancel}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default PurchaseReceiptManagement;