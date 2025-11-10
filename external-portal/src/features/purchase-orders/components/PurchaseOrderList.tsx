import React, { useState, useEffect, useCallback } from 'react'
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Row, 
  Col, 
  Input, 
  Select, 
  DatePicker, 
  Modal,
  message,
} from 'antd'
import { 
  EyeOutlined, 
  TruckOutlined, 
  SearchOutlined,
  ReloadOutlined,
  QrcodeOutlined
} from '@ant-design/icons'

interface PurchaseOrder {
  id: string
  product: string
  quantity: number
  unit: string
  unitPrice: number
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  orderDate: string
  deliveryDate: string
  customer: string
  batchNumber: string
}

interface SearchParams {
  search?: string
  status?: string
  dateRange?: [string, string]
}

const PurchaseOrderList: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // 模拟数据
  const mockOrders: PurchaseOrder[] = [
    {
      id: 'PO-2024-001',
      product: '钢材原料',
      quantity: 500,
      unit: '吨',
      unitPrice: 50,
      totalAmount: 25000,
      status: 'pending',
      orderDate: '2024-01-15',
      deliveryDate: '2024-01-25',
      customer: '制造公司A',
      batchNumber: 'BATCH-ST-240115-001',
    },
    {
      id: 'PO-2024-002',
      product: '电子元件',
      quantity: 200,
      unit: '件',
      unitPrice: 75,
      totalAmount: 15000,
      status: 'shipped',
      orderDate: '2024-01-14',
      deliveryDate: '2024-01-24',
      customer: '电子公司B',
      batchNumber: 'BATCH-EC-240114-002',
    },
    {
      id: 'PO-2024-003',
      product: '包装材料',
      quantity: 1000,
      unit: '个',
      unitPrice: 8,
      totalAmount: 8000,
      status: 'shipped',
      orderDate: '2024-01-13',
      deliveryDate: '2024-01-23',
      customer: '包装公司C',
      batchNumber: 'BATCH-PK-240113-003',
    },
    {
      id: 'PO-2024-004',
      product: '塑料制品',
      quantity: 300,
      unit: '件',
      unitPrice: 25,
      totalAmount: 7500,
      status: 'shipped',
      orderDate: '2024-01-12',
      deliveryDate: '2024-01-22',
      customer: '塑料公司D',
      batchNumber: 'BATCH-PL-240112-004',
    },
    {
      id: 'PO-2024-005',
      product: '化工原料',
      quantity: 150,
      unit: '桶',
      unitPrice: 120,
      totalAmount: 18000,
      status: 'shipped',
      orderDate: '2024-01-11',
      deliveryDate: '2024-01-21',
      customer: '化工公司E',
      batchNumber: 'BATCH-CH-240111-005',
    },
  ]

  // 获取订单列表
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 根据搜索参数过滤数据
      let filteredOrders = [...mockOrders]
      
      if (searchParams.search) {
        filteredOrders = filteredOrders.filter(order => 
          order.id.toLowerCase().includes(searchParams.search!.toLowerCase()) ||
          order.product.toLowerCase().includes(searchParams.search!.toLowerCase()) ||
          order.customer.toLowerCase().includes(searchParams.search!.toLowerCase())
        )
      }
      
      if (searchParams.status) {
        filteredOrders = filteredOrders.filter(order => order.status === searchParams.status)
      }
      
      setOrders(filteredOrders)
      setPagination(prev => ({
        ...prev,
        total: filteredOrders.length
      }))
    } catch {
      message.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  // 初始化加载
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const getStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: 'orange', text: '待处理' },
      shipped: { color: 'green', text: '已发货' },
    }
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchParams(prev => ({ ...prev, search: value }))
  }

  const handleStatusChange = (value: string) => {
    setSearchParams(prev => ({ ...prev, status: value }))
  }

  const handleDateRangeChange = (dates: any) => {
    setSearchParams(prev => ({ 
      ...prev, 
      dateRange: dates ? [dates[0], dates[1]] : undefined 
    }))
  }

  // 操作处理
  const handleView = (record: PurchaseOrder) => {
    setSelectedOrder(record)
    setViewModalVisible(true)
  }

  const handleViewQRCode = (batchNumber: string) => {
    Modal.info({
      title: '批次号二维码',
      content: (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <QrcodeOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
          <p style={{ marginTop: '16px', fontSize: '16px' }}>批次号: {batchNumber}</p>
          <p style={{ color: '#666' }}>扫描二维码查看详细信息</p>
        </div>
      ),
      width: 400,
    })
  }

  const handleShip = (record: PurchaseOrder) => {
    Modal.confirm({
      title: '确认发货',
      content: `确定要将订单 ${record.id} 标记为已发货吗？`,
      onOk: async () => {
        try {
          // 模拟 API 调用
          await new Promise(resolve => setTimeout(resolve, 500))
          
          setOrders(prev => prev.map(order => 
            order.id === record.id 
              ? { ...order, status: 'shipped' }
              : order
          ))
          
          message.success('订单已标记为已发货')
        } catch {
          message.error('操作失败')
        }
      }
    })
  }

  // 表格列定义
  const columns = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'product',
      key: 'product',
      width: 120,
    },
    {
      title: '数量',
      key: 'quantity',
      render: (record: PurchaseOrder) => `${record.quantity} ${record.unit}`,
      width: 100,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price: number) => `¥${price}`,
      width: 100,
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
      width: 120,
    },
    {
      title: '订单日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 110,
    },
    {
      title: '交付日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 110,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
      width: 100,
    },
    {
      title:'批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
      render: (batchNumber: string) => (
        <Button 
          type="link" 
          icon={<QrcodeOutlined />} 
          size="small"
          onClick={() => handleViewQRCode(batchNumber)}
        >
          {batchNumber}
        </Button>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: PurchaseOrder) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <Button 
              type="link" 
              icon={<TruckOutlined />} 
              size="small"
              onClick={() => handleShip(record)}
            >
              发货
            </Button>
          )}
        </Space>
      ),
      width: 120,
    },
  ]

  return (
    <div style={{ padding: '24px' }}>      
      {/* 搜索区域 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="搜索订单编号、产品或客户"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="选择状态"
              allowClear
              style={{ width: '100%' }}
              onChange={handleStatusChange}
            >
              <Select.Option value="pending">待处理</Select.Option>
              <Select.Option value="processing">处理中</Select.Option>
              <Select.Option value="shipped">已发货</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <DatePicker.RangePicker
              placeholder={['开始日期', '结束日期']}
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space>
              <Button 
                icon={<SearchOutlined />}
                onClick={() => fetchOrders()}
              >
                搜索
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearchParams({})
                  fetchOrders()
                }}
              >
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 表格区域 */}
      <Card 
        title="采购订单管理" 
        className="modern-card"
      >
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || 10
              }))
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 查看订单详情模态框 */}
      <Modal
        title="订单详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>订单编号：</strong>{selectedOrder.id}
              </Col>
              <Col span={12}>
                <strong>状态：</strong>{getStatusTag(selectedOrder.status)}
              </Col>
              <Col span={12}>
                <strong>产品名称：</strong>{selectedOrder.product}
              </Col>
              <Col span={12}>
                <strong>客户：</strong>{selectedOrder.customer}
              </Col>
              <Col span={12}>
                <strong>数量：</strong>{selectedOrder.quantity} {selectedOrder.unit}
              </Col>
              <Col span={12}>
                <strong>单价：</strong>¥{selectedOrder.unitPrice}
              </Col>
              <Col span={12}>
                <strong>总金额：</strong>¥{selectedOrder.totalAmount.toLocaleString()}
              </Col>
              <Col span={12}>
                <strong>下单时间：</strong>{selectedOrder.orderDate}
              </Col>
              <Col span={12}>
                <strong>要求交期：</strong>{selectedOrder.deliveryDate}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PurchaseOrderList