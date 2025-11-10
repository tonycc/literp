import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Modal,
  message,
  Row,
  Col,
  Statistic,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type {
  PurchaseReturn,
  PurchaseReturnQueryParams,
  PurchaseReturnStats
} from '../types';
import {
  PurchaseReturnStatus,
  PURCHASE_RETURN_STATUS_CONFIG
} from '../types';
import { AddPurchaseReturnModal } from './AddPurchaseReturnModal';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 模拟数据
const mockData: PurchaseReturn[] = [
  {
    id: 'RT001',
    purchaseOrderId: 'PO001',
    supplierName: '北京科技有限公司',
    supplierContact: '张经理',
    purchaseManager: '李明',
    returnDate: '2024-01-15',
    returnReason: '产品质量不符合要求',
    totalQuantity: 50,
    totalAmount: 25000,
    status: PurchaseReturnStatus.PENDING,
    createdAt: '2024-01-15 09:00:00',
    updatedAt: '2024-01-15 09:00:00',
    remark: '需要重新检验'
  },
  {
    id: 'RT002',
    purchaseOrderId: 'PO002',
    supplierName: '上海制造有限公司',
    supplierContact: '王总监',
    purchaseManager: '陈华',
    returnDate: '2024-01-14',
    returnReason: '规格不匹配',
    totalQuantity: 30,
    totalAmount: 18000,
    status: PurchaseReturnStatus.APPROVED,
    createdAt: '2024-01-14 14:30:00',
    updatedAt: '2024-01-14 16:45:00'
  },
  {
    id: 'RT003',
    purchaseOrderId: 'PO003',
    supplierName: '深圳电子有限公司',
    supplierContact: '刘主管',
    purchaseManager: '王强',
    returnDate: '2024-01-13',
    returnReason: '数量错误',
    totalQuantity: 100,
    totalAmount: 45000,
    status: PurchaseReturnStatus.COMPLETED,
    createdAt: '2024-01-13 10:15:00',
    updatedAt: '2024-01-13 17:20:00'
  }
];

const mockStats: PurchaseReturnStats = {
  totalReturns: 15,
  pendingReturns: 3,
  completedReturns: 8,
  totalReturnAmount: 125000
};

export const PurchaseReturnManagement: React.FC = () => {
  const [data, setData] = useState<PurchaseReturn[]>(mockData);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState<PurchaseReturnQueryParams>({
    page: 1,
    pageSize: 10
  });
  const [stats, setStats] = useState<PurchaseReturnStats>(mockStats);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PurchaseReturn | null>(null);

  // 表格列定义
  const columns: ColumnsType<PurchaseReturn> = [
    {
      title: '退货编号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      fixed: 'left'
    },
    {
      title: '采购订单编号',
      dataIndex: 'purchaseOrderId',
      key: 'purchaseOrderId',
      width: 140
    },
    {
      title: '供应商名称',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 180
    },
    {
      title: '供应商联系人',
      dataIndex: 'supplierContact',
      key: 'supplierContact',
      width: 120
    },
    {
      title: '采购负责人',
      dataIndex: 'purchaseManager',
      key: 'purchaseManager',
      width: 120
    },
    {
      title: '退货申请日期',
      dataIndex: 'returnDate',
      key: 'returnDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '退货原因',
      dataIndex: 'returnReason',
      key: 'returnReason',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (reason: string) => (
        <Tooltip title={reason}>
          {reason}
        </Tooltip>
      )
    },
    {
      title: '退货总数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 120,
      align: 'right',
      render: (quantity: number) => quantity.toLocaleString()
    },
    {
      title: '退货总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => `¥${amount.toLocaleString()}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PurchaseReturnStatus) => {
        const config = PURCHASE_RETURN_STATUS_CONFIG[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
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
              title="确定要删除这条退货记录吗？"
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

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 这里应该调用实际的API
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(mockData);
      setStats(mockStats);
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    setQueryParams(prev => ({
      ...prev,
      keyword: value,
      page: 1
    }));
  };

  // 状态筛选
  const handleStatusFilter = (status: PurchaseReturnStatus | undefined) => {
    setQueryParams(prev => ({
      ...prev,
      status,
      page: 1
    }));
  };

  // 日期范围筛选
  const handleDateRangeFilter = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      setQueryParams(prev => ({
        ...prev,
        startDate: dates[0]!.format('YYYY-MM-DD'),
        endDate: dates[1]!.format('YYYY-MM-DD'),
        page: 1
      }));
    } else {
      setQueryParams(prev => ({
        ...prev,
        startDate: undefined,
        endDate: undefined,
        page: 1
      }));
    }
  };

  // 查看详情
  const handleViewDetail = (record: PurchaseReturn) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: PurchaseReturn) => {
    console.log('编辑记录:', record);
    message.info('编辑功能开发中...');
  };

  // 删除
  const handleDelete = async (id: string) => {
    try {
      // 这里应该调用实际的删除API
      console.log('删除记录ID:', id);
      message.success('删除成功');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  // 导出
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  // 新增退货成功回调
  const handleAddSuccess = () => {
    setAddModalVisible(false);
    loadData();
    message.success('新增退货成功');
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  return (
    <div>

      {/* 主要内容卡片 */}
      <Card>
        {/* 搜索和筛选区域 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input.Search
              placeholder="搜索退货编号、采购订单编号、供应商名称"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择状态"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusFilter}
            >
              {Object.entries(PURCHASE_RETURN_STATUS_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.text}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              style={{ width: '100%' }}
              onChange={handleDateRangeFilter}
            />
          </Col>
          <Col span={8}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                新增退货
              </Button>
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadData}
              >
                刷新
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
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              setQueryParams(prev => ({ ...prev, page, pageSize }));
            }
          }}
        />
      </Card>

      {/* 新增退货弹窗 */}
      <AddPurchaseReturnModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSuccess={handleAddSuccess}
      />

      {/* 详情弹窗 */}
      <Modal
        title="退货详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>退货编号：</strong>{selectedRecord.id}</p>
                <p><strong>采购订单编号：</strong>{selectedRecord.purchaseOrderId}</p>
                <p><strong>供应商名称：</strong>{selectedRecord.supplierName}</p>
                <p><strong>供应商联系人：</strong>{selectedRecord.supplierContact}</p>
                <p><strong>采购负责人：</strong>{selectedRecord.purchaseManager}</p>
              </Col>
              <Col span={12}>
                <p><strong>退货申请日期：</strong>{dayjs(selectedRecord.returnDate).format('YYYY-MM-DD')}</p>
                <p><strong>退货总数量：</strong>{selectedRecord.totalQuantity.toLocaleString()}</p>
                <p><strong>退货总金额：</strong>¥{selectedRecord.totalAmount.toLocaleString()}</p>
                <p><strong>状态：</strong>
                  <Tag color={PURCHASE_RETURN_STATUS_CONFIG[selectedRecord.status].color}>
                    {PURCHASE_RETURN_STATUS_CONFIG[selectedRecord.status].text}
                  </Tag>
                </p>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <p><strong>退货原因：</strong>{selectedRecord.returnReason}</p>
                {selectedRecord.remark && (
                  <p><strong>备注：</strong>{selectedRecord.remark}</p>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};