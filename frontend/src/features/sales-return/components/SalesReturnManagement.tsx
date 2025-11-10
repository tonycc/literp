import React, { useState, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Typography,
  Tooltip,
  Modal
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { SalesReturn, SalesReturnQueryParams, ReturnStatus, ReturnReason } from '../types';
import { RETURN_STATUS_CONFIG, RETURN_REASON_CONFIG, ReturnStatus as ReturnStatusEnum, ReturnReason as ReturnReasonEnum } from '../types';
import AddSalesReturnModal from './AddSalesReturnModal';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 模拟数据
const mockData: SalesReturn[] = [
  {
    id: '1',
    returnNumber: 'RT202401001',
    originalSalesNumber: 'SO202401001',
    customerId: 'C001',
    customerName: '北京科技有限公司',
    customerContact: '13800138001',
    returnDate: '2024-01-15',
    status: ReturnStatusEnum.PENDING,
    totalAmount: 15000,
    products: [
      {
        id: '1',
        productId: 'P001',
        productName: '笔记本电脑',
        productCode: 'NB001',
        specification: '15.6英寸 i7 16G 512G',
        unit: '台',
        originalQuantity: 10,
        returnQuantity: 2,
        unitPrice: 7500,
        totalAmount: 15000,
        reason: ReturnReasonEnum.QUALITY_ISSUE,
        remark: '屏幕有亮点'
      }
    ],
    reason: ReturnReasonEnum.QUALITY_ISSUE,
    description: '产品质量问题，需要退货处理',
    createdAt: '2024-01-15 09:00:00',
    updatedAt: '2024-01-15 09:00:00'
  },
  {
    id: '2',
    returnNumber: 'RT202401002',
    originalSalesNumber: 'SO202401002',
    customerId: 'C002',
    customerName: '上海贸易公司',
    customerContact: '13900139002',
    returnDate: '2024-01-16',
    status: ReturnStatusEnum.APPROVED,
    totalAmount: 8000,
    products: [
      {
        id: '2',
        productId: 'P002',
        productName: '打印机',
        productCode: 'PR001',
        specification: '激光打印机 A4',
        unit: '台',
        originalQuantity: 5,
        returnQuantity: 1,
        unitPrice: 8000,
        totalAmount: 8000,
        reason: ReturnReasonEnum.WRONG_PRODUCT,
        remark: '发错型号'
      }
    ],
    reason: ReturnReasonEnum.WRONG_PRODUCT,
    description: '发错产品型号',
    approvedBy: '张经理',
    approvedAt: '2024-01-16 14:30:00',
    createdAt: '2024-01-16 10:00:00',
    updatedAt: '2024-01-16 14:30:00'
  },
  {
    id: '3',
    returnNumber: 'RT202401003',
    originalSalesNumber: 'SO202401003',
    customerId: 'C003',
    customerName: '深圳电子有限公司',
    customerContact: '13700137003',
    returnDate: '2024-01-17',
    status: ReturnStatusEnum.COMPLETED,
    totalAmount: 12000,
    products: [
      {
        id: '3',
        productId: 'P003',
        productName: '显示器',
        productCode: 'MN001',
        specification: '27英寸 4K',
        unit: '台',
        originalQuantity: 8,
        returnQuantity: 3,
        unitPrice: 4000,
        totalAmount: 12000,
        reason: ReturnReasonEnum.CUSTOMER_CHANGE,
        remark: '客户需求变更'
      }
    ],
    reason: ReturnReasonEnum.CUSTOMER_CHANGE,
    description: '客户需求变更，不需要这么多数量',
    approvedBy: '李主管',
    approvedAt: '2024-01-17 11:00:00',
    processedBy: '王仓管',
    processedAt: '2024-01-17 16:00:00',
    createdAt: '2024-01-17 09:30:00',
    updatedAt: '2024-01-17 16:00:00'
  }
];

export const SalesReturnManagement: React.FC = () => {
  const [data, setData] = useState<SalesReturn[]>(mockData);
  const [loading, setLoading] = useState(false);
  const [queryParams, setQueryParams] = useState<SalesReturnQueryParams>({
    page: 1,
    pageSize: 10
  });
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalesReturn | null>(null);

  // 表格列定义
  const columns: ColumnsType<SalesReturn> = [
    {
      title: '退货单号',
      dataIndex: 'returnNumber',
      key: 'returnNumber',
      width: 140,
      fixed: 'left',
      render: (text: string) => (
        <Typography.Text strong style={{ color: '#1890ff' }}>
          {text}
        </Typography.Text>
      )
    },
    {
      title: '原销售单号',
      dataIndex: 'originalSalesNumber',
      key: 'originalSalesNumber',
      width: 140,
      render: (text: string) => (
        <Typography.Text code>{text}</Typography.Text>
      )
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 180,
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: '退货日期',
      dataIndex: 'returnDate',
      key: 'returnDate',
      width: 120,
      sorter: (a, b) => new Date(a.returnDate).getTime() - new Date(b.returnDate).getTime()
    },
    {
      title: '退货状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ReturnStatus) => {
        const config = RETURN_STATUS_CONFIG[status];
        return (
          <Tag
            color={config.color}
            style={{
              backgroundColor: config.bgColor,
              borderColor: config.borderColor,
              color: config.color === 'default' ? '#666' : undefined
            }}
          >
            {config.label}
          </Tag>
        );
      },
      filters: Object.entries(RETURN_STATUS_CONFIG).map(([value, config]) => ({
        text: config.label,
        value
      })),
      onFilter: (value, record) => record.status === value
    },
    {
      title: '退货原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 120,
      render: (reason: ReturnReason) => {
        const config = RETURN_REASON_CONFIG[reason];
        return (
          <Tag color={config.color}>
            {config.label}
          </Tag>
        );
      },
      filters: Object.entries(RETURN_REASON_CONFIG).map(([value, config]) => ({
        text: config.label,
        value
      })),
      onFilter: (value, record) => record.reason === value
    },
    {
      title: '退货金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <Typography.Text strong style={{ color: '#f50' }}>
          ¥{amount.toLocaleString()}
        </Typography.Text>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: '审批人',
      dataIndex: 'approvedBy',
      key: 'approvedBy',
      width: 100,
      render: (text: string) => text || '-'
    },
    {
      title: '处理人',
      dataIndex: 'processedBy',
      key: 'processedBy',
      width: 100,
      render: (text: string) => text || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          {record.status === ReturnStatusEnum.PENDING && (
            <>
              <Tooltip title="审批通过">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => handleApprove(record)}
                />
              </Tooltip>
              <Tooltip title="拒绝">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  style={{ color: '#ff4d4f' }}
                  onClick={() => handleReject(record)}
                />
              </Tooltip>
            </>
          )}
          {record.status === ReturnStatusEnum.APPROVED && (
            <Tooltip title="处理完成">
              <Button
                type="text"
                icon={<CheckOutlined />}
                style={{ color: '#1890ff' }}
                onClick={() => handleComplete(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={record.status === ReturnStatusEnum.COMPLETED}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这条退货记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={record.status === ReturnStatusEnum.COMPLETED}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      // 这里应该调用实际的API
      setData(mockData);
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 搜索处理
  const handleSearch = () => {
    loadData();
  };

  // 重置搜索
  const handleReset = () => {
    setQueryParams({
      page: 1,
      pageSize: 10
    });
    loadData();
  };

  // 查看详情
  const handleView = (record: SalesReturn) => {
    setSelectedRecord(record);
    Modal.info({
      title: '退货单详情',
      width: 800,
      content: (
        <div style={{ marginTop: 16 }}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <strong>退货单号：</strong>{record.returnNumber}
            </Col>
            <Col span={12}>
              <strong>原销售单号：</strong>{record.originalSalesNumber}
            </Col>
            <Col span={12}>
              <strong>客户名称：</strong>{record.customerName}
            </Col>
            <Col span={12}>
              <strong>联系方式：</strong>{record.customerContact}
            </Col>
            <Col span={12}>
              <strong>退货日期：</strong>{record.returnDate}
            </Col>
            <Col span={12}>
              <strong>退货状态：</strong>
              <Tag color={RETURN_STATUS_CONFIG[record.status].color}>
                {RETURN_STATUS_CONFIG[record.status].label}
              </Tag>
            </Col>
            <Col span={12}>
              <strong>退货原因：</strong>
              <Tag color={RETURN_REASON_CONFIG[record.reason].color}>
                {RETURN_REASON_CONFIG[record.reason].label}
              </Tag>
            </Col>
            <Col span={12}>
              <strong>退货金额：</strong>¥{record.totalAmount.toLocaleString()}
            </Col>
            <Col span={24}>
              <strong>退货说明：</strong>{record.description || '-'}
            </Col>
            <Col span={24}>
              <strong>退货产品：</strong>
              <Table
                size="small"
                dataSource={record.products}
                pagination={false}
                style={{ marginTop: 8 }}
                columns={[
                  { title: '产品名称', dataIndex: 'productName', key: 'productName' },
                  { title: '规格', dataIndex: 'specification', key: 'specification' },
                  { title: '原数量', dataIndex: 'originalQuantity', key: 'originalQuantity' },
                  { title: '退货数量', dataIndex: 'returnQuantity', key: 'returnQuantity' },
                  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', render: (price: number) => `¥${price}` },
                  { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (amount: number) => `¥${amount}` }
                ]}
              />
            </Col>
          </Row>
        </div>
      )
    });
  };

  // 审批通过
  const handleApprove = async (record: SalesReturn) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 更新数据
      setData(prevData => 
        prevData.map(item => 
          item.id === record.id 
            ? { ...item, status: ReturnStatusEnum.APPROVED, approvedBy: '当前用户', approvedAt: new Date().toISOString() }
            : item
        )
      );
      
      message.success('审批通过成功');
    } catch {
      message.error('审批失败');
    }
  };

  // 拒绝
  const handleReject = (record: SalesReturn) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确定要拒绝退货单 ${record.returnNumber} 吗？`,
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 更新数据
          setData(prevData => 
            prevData.map(item => 
              item.id === record.id 
                ? { ...item, status: ReturnStatusEnum.REJECTED }
                : item
            )
          );
          
          message.success('拒绝成功');
        } catch {
          message.error('拒绝失败');
        }
      }
    });
  };

  // 处理完成
  const handleComplete = (record: SalesReturn) => {
    Modal.confirm({
      title: '确认完成',
      content: `确定要完成退货单 ${record.returnNumber} 吗？`,
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 更新数据
          setData(prevData => 
            prevData.map(item => 
              item.id === record.id 
                ? { ...item, status: ReturnStatusEnum.COMPLETED, processedBy: '当前用户', processedAt: new Date().toISOString() }
                : item
            )
          );
          
          message.success('完成成功');
        } catch {
          message.error('完成失败');
        }
      }
    });
  };

  // 编辑
  const handleEdit = (record: SalesReturn) => {
    setSelectedRecord(record);
    setAddModalVisible(true);
  };

  // 删除
  const handleDelete = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新数据
      setData(prevData => prevData.filter(item => item.id !== id));
      
      message.success('删除成功');
    } catch {
      message.error('删除失败');
    }
  };



  // 新增成功回调
  const handleAddSuccess = () => {
    setAddModalVisible(false);
    setSelectedRecord(null);
    loadData();
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>

        {/* 搜索区域 */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={4}>
              <Input
                placeholder="退货单号"
                value={queryParams.returnNumber}
                onChange={(e) => setQueryParams(prev => ({ ...prev, returnNumber: e.target.value }))}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Input
                placeholder="原销售单号"
                value={queryParams.originalSalesNumber}
                onChange={(e) => setQueryParams(prev => ({ ...prev, originalSalesNumber: e.target.value }))}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Input
                placeholder="客户名称"
                value={queryParams.customerName}
                onChange={(e) => setQueryParams(prev => ({ ...prev, customerName: e.target.value }))}
                allowClear
              />
            </Col>
          
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="退货原因"
                value={queryParams.reason}
                onChange={(value) => setQueryParams(prev => ({ ...prev, reason: value }))}
                allowClear
                style={{ width: '100%' }}
              >
                {Object.entries(RETURN_REASON_CONFIG).map(([value, config]) => (
                  <Option key={value} value={value}>
                    {config.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                onChange={(dates) => {
                  setQueryParams(prev => ({
                    ...prev,
                    startDate: dates?.[0]?.format('YYYY-MM-DD'),
                    endDate: dates?.[1]?.format('YYYY-MM-DD')
                  }));
                }}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                >
                  搜索
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                >
                  重置
                </Button>
           
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setAddModalVisible(true)}
                >
                  新增退货
                </Button>
          
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              setQueryParams(prev => ({ ...prev, page, pageSize }));
            }
          }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <AddSalesReturnModal
        open={addModalVisible}
        editData={selectedRecord ? {
          returnNumber: selectedRecord.returnNumber,
          originalSalesNumber: selectedRecord.originalSalesNumber,
          customerId: selectedRecord.customerId,
          customerName: selectedRecord.customerName,
          customerContact: selectedRecord.customerContact,
          returnDate: selectedRecord.returnDate,
          reason: selectedRecord.reason,
          description: selectedRecord.description,
          products: selectedRecord.products.map(p => ({
            productId: p.productId,
            productName: p.productName,
            productCode: p.productCode,
            specification: p.specification,
            unit: p.unit,
            originalQuantity: p.originalQuantity,
            returnQuantity: p.returnQuantity,
            unitPrice: p.unitPrice,
            totalAmount: p.totalAmount,
            reason: p.reason,
            remark: p.remark
          })),
          remark: selectedRecord.description
        } : undefined}
        onSuccess={handleAddSuccess}
        onCancel={() => {
          setAddModalVisible(false);
          setSelectedRecord(null);
        }}
      />
    </div>
  );
};

export default SalesReturnManagement;