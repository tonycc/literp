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
  Descriptions,
  message,
  Divider,
  Timeline,
} from 'antd'
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  TruckOutlined,
  DollarOutlined,
  UserOutlined,
  ShopOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import {
  Order,
  OrderSearchParams,
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG
} from '../types'

const { RangePicker } = DatePicker
const { Option } = Select

const OrderQuery: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<OrderSearchParams>({})
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // 模拟订单数据
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      product: '钢材原料',
      quantity: 500,
      unit: '吨',
      unitPrice: 5000,
      totalAmount: 2500000,
      status: 'shipped',
      orderDate: '2024-01-15',
      expectedDeliveryDate: '2024-01-25',
      actualDeliveryDate: '2024-01-24',
      customer: '制造公司A',
      customerContact: '张经理 13800138001',
      supplier: '钢铁供应商',
      supplierContact: '李经理 13900139001',
      batchNumber: 'BATCH-ST-240115-001',
      trackingNumber: 'TRK-240115-001',
      notes: '优质钢材，按时交付',
      paymentStatus: 'paid',
      paymentMethod: '银行转账',
      shippingAddress: '北京市朝阳区工业园区1号',
      billingAddress: '北京市朝阳区办公大厦2号'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      product: '电子元件',
      quantity: 200,
      unit: '件',
      unitPrice: 750,
      totalAmount: 150000,
      status: 'processing',
      orderDate: '2024-01-14',
      expectedDeliveryDate: '2024-01-24',
      customer: '电子公司B',
      customerContact: '王经理 13700137001',
      supplier: '电子元件供应商',
      supplierContact: '赵经理 13600136001',
      batchNumber: 'BATCH-EC-240114-002',
      notes: '精密电子元件，需要特殊包装',
      paymentStatus: 'partial',
      paymentMethod: '信用证',
      shippingAddress: '上海市浦东新区科技园5号',
      billingAddress: '上海市浦东新区商务大厦8号'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      product: '包装材料',
      quantity: 1000,
      unit: '个',
      unitPrice: 80,
      totalAmount: 80000,
      status: 'delivered',
      orderDate: '2024-01-13',
      expectedDeliveryDate: '2024-01-23',
      actualDeliveryDate: '2024-01-22',
      customer: '包装公司C',
      customerContact: '刘经理 13500135001',
      supplier: '包装材料供应商',
      supplierContact: '陈经理 13400134001',
      batchNumber: 'BATCH-PK-240113-003',
      trackingNumber: 'TRK-240113-003',
      notes: '环保包装材料',
      paymentStatus: 'paid',
      paymentMethod: '现金',
      shippingAddress: '广州市天河区物流园区3号',
      billingAddress: '广州市天河区商业中心6号'
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-004',
      product: '塑料制品',
      quantity: 300,
      unit: '件',
      unitPrice: 250,
      totalAmount: 75000,
      status: 'confirmed',
      orderDate: '2024-01-12',
      expectedDeliveryDate: '2024-01-22',
      customer: '塑料公司D',
      customerContact: '周经理 13300133001',
      supplier: '塑料制品供应商',
      supplierContact: '吴经理 13200132001',
      batchNumber: 'BATCH-PL-240112-004',
      notes: '高强度塑料制品',
      paymentStatus: 'unpaid',
      paymentMethod: '银行转账',
      shippingAddress: '深圳市南山区工业区7号',
      billingAddress: '深圳市南山区科技大厦9号'
    },
    {
      id: '5',
      orderNumber: 'ORD-2024-005',
      product: '化工原料',
      quantity: 150,
      unit: '桶',
      unitPrice: 1200,
      totalAmount: 180000,
      status: 'pending',
      orderDate: '2024-01-11',
      expectedDeliveryDate: '2024-01-21',
      customer: '化工公司E',
      customerContact: '郑经理 13100131001',
      supplier: '化工原料供应商',
      supplierContact: '孙经理 13000130001',
      batchNumber: 'BATCH-CH-240111-005',
      notes: '危险品，需要特殊运输',
      paymentStatus: 'unpaid',
      paymentMethod: '信用证',
      shippingAddress: '天津市滨海新区化工园区2号',
      billingAddress: '天津市和平区商务楼4号'
    }
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
        const searchTerm = searchParams.search.toLowerCase()
        filteredOrders = filteredOrders.filter(order => 
          order.orderNumber.toLowerCase().includes(searchTerm) ||
          order.product.toLowerCase().includes(searchTerm) ||
          order.customer.toLowerCase().includes(searchTerm) ||
          order.supplier.toLowerCase().includes(searchTerm) ||
          order.batchNumber.toLowerCase().includes(searchTerm)
        )
      }
      
      if (searchParams.status) {
        filteredOrders = filteredOrders.filter(order => order.status === searchParams.status)
      }

      if (searchParams.paymentStatus) {
        filteredOrders = filteredOrders.filter(order => order.paymentStatus === searchParams.paymentStatus)
      }

      if (searchParams.customer) {
        filteredOrders = filteredOrders.filter(order => 
          order.customer.toLowerCase().includes(searchParams.customer!.toLowerCase())
        )
      }

      if (searchParams.supplier) {
        filteredOrders = filteredOrders.filter(order => 
          order.supplier.toLowerCase().includes(searchParams.supplier!.toLowerCase())
        )
      }
      
      if (searchParams.dateRange) {
        const [startDate, endDate] = searchParams.dateRange
        filteredOrders = filteredOrders.filter(order => {
          const orderDate = dayjs(order.orderDate)
          return orderDate.isAfter(dayjs(startDate).subtract(1, 'day')) && 
                 orderDate.isBefore(dayjs(endDate).add(1, 'day'))
        })
      }
      
      setOrders(filteredOrders)
      setPagination(prev => ({
        ...prev,
        total: filteredOrders.length
      }))
    } catch {
      message.error('获取订单数据失败')
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchParams(prev => ({ ...prev, search: value }))
  }

  // 处理状态筛选
  const handleStatusFilter = (value: string) => {
    setSearchParams(prev => ({ ...prev, status: value || undefined }))
  }

  // 处理支付状态筛选
  const handlePaymentStatusFilter = (value: string) => {
    setSearchParams(prev => ({ ...prev, paymentStatus: value || undefined }))
  }

  // 处理日期范围筛选
  const handleDateRangeFilter = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      const startDate = dates[0]
      const endDate = dates[1]
      setSearchParams(prev => ({
        ...prev,
        dateRange: [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')]
      }))
    } else {
      setSearchParams(prev => ({ ...prev, dateRange: undefined }))
    }
  }

  // 查看订单详情
  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order)
    setDetailModalVisible(true)
  }

  // 重置搜索
  const handleReset = () => {
    setSearchParams({})
  }

  // 获取订单状态时间线
  const getOrderTimeline = (order: Order) => {
    const items = [
      {
        color: 'green',
        children: (
          <div>
            <div><strong>订单创建</strong></div>
            <div>{order.orderDate}</div>
          </div>
        )
      }
    ]

    if (['confirmed', 'processing', 'shipped', 'delivered', 'completed'].includes(order.status)) {
      items.push({
        color: 'blue',
        children: (
          <div>
            <div><strong>订单确认</strong></div>
            <div>订单已确认并开始处理</div>
          </div>
        )
      })
    }

    if (['processing', 'shipped', 'delivered', 'completed'].includes(order.status)) {
      items.push({
        color: 'purple',
        children: (
          <div>
            <div><strong>订单处理</strong></div>
            <div>订单正在处理中</div>
          </div>
        )
      })
    }

    if (['shipped', 'delivered', 'completed'].includes(order.status)) {
      items.push({
        color: 'cyan',
        children: (
          <div>
            <div><strong>订单发货</strong></div>
            <div>订单已发货</div>
            {order.trackingNumber && <div>物流单号: {order.trackingNumber}</div>}
          </div>
        )
      })
    }

    if (['delivered', 'completed'].includes(order.status)) {
      items.push({
        color: 'green',
        children: (
          <div>
            <div><strong>订单送达</strong></div>
            <div>{order.actualDeliveryDate || '已送达'}</div>
          </div>
        )
      })
    }

    if (order.status === 'cancelled') {
      items.push({
        color: 'red',
        children: (
          <div>
            <div><strong>订单取消</strong></div>
            <div>订单已取消</div>
          </div>
        )
      })
    }

    return items
  }

  const columns: ColumnsType<Order> = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 140,
      fixed: 'left',
      render: (text: string) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</span>
      )
    },
    {
      title: '产品名称',
      dataIndex: 'product',
      key: 'product',
      width: 120,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity: number, record: Order) => `${quantity} ${record.unit}`
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price: number) => `¥${price.toLocaleString()}`
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => (
        <span style={{ fontWeight: 'bold', color: '#f50' }}>
          ¥{amount.toLocaleString()}
        </span>
      )
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Order['status']) => {
        const config = ORDER_STATUS_CONFIG[status]
        return <Tag color={config.color}>{config.label}</Tag>
      }
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      render: (status: Order['paymentStatus']) => {
        const config = PAYMENT_STATUS_CONFIG[status]
        return <Tag color={config.color}>{config.label}</Tag>
      }
    },
    {
      title: '订单日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 110,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '预计交付',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 110,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record: Order) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            详情
          </Button>
          {record.trackingNumber && (
            <Button
              type="link"
              icon={<TruckOutlined />}
              size="small"
            >
              物流
            </Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="搜索订单号、产品"
              prefix={<SearchOutlined />}
              value={searchParams.search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="订单状态"
              value={searchParams.status}
              onChange={handleStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>{config.label}</Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="支付状态"
              value={searchParams.paymentStatus}
              onChange={handlePaymentStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>{config.label}</Option>
              ))}
            </Select>
          </Col>
           <Col span={6}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={handleDateRangeFilter}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={2}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 订单列表 */}
      <Card title="订单列表">
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Card>

      {/* 订单详情模态框 */}
      <Modal
        title={`订单详情 - ${selectedOrder?.orderNumber}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="订单号">{selectedOrder.orderNumber}</Descriptions.Item>
              <Descriptions.Item label="批次号">{selectedOrder.batchNumber}</Descriptions.Item>
              <Descriptions.Item label="产品名称">{selectedOrder.product}</Descriptions.Item>
              <Descriptions.Item label="数量">{selectedOrder.quantity} {selectedOrder.unit}</Descriptions.Item>
              <Descriptions.Item label="单价">¥{selectedOrder.unitPrice.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="总金额">
                <span style={{ fontWeight: 'bold', color: '#f50' }}>
                  ¥{selectedOrder.totalAmount.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="订单状态">
                <Tag color={ORDER_STATUS_CONFIG[selectedOrder.status].color}>
                  {ORDER_STATUS_CONFIG[selectedOrder.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="支付状态">
                <Tag color={PAYMENT_STATUS_CONFIG[selectedOrder.paymentStatus].color}>
                  {PAYMENT_STATUS_CONFIG[selectedOrder.paymentStatus].label}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="联系信息" bordered column={2}>
              <Descriptions.Item label="客户" span={2}>
                <UserOutlined /> {selectedOrder.customer}
              </Descriptions.Item>
              <Descriptions.Item label="客户联系方式" span={2}>
                {selectedOrder.customerContact}
              </Descriptions.Item>
              <Descriptions.Item label="供应商" span={2}>
                <ShopOutlined /> {selectedOrder.supplier}
              </Descriptions.Item>
              <Descriptions.Item label="供应商联系方式" span={2}>
                {selectedOrder.supplierContact}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="时间信息" bordered column={2}>
              <Descriptions.Item label="订单日期">
                {dayjs(selectedOrder.orderDate).format('YYYY-MM-DD')}
              </Descriptions.Item>
              <Descriptions.Item label="预计交付日期">
                {dayjs(selectedOrder.expectedDeliveryDate).format('YYYY-MM-DD')}
              </Descriptions.Item>
              {selectedOrder.actualDeliveryDate && (
                <Descriptions.Item label="实际交付日期" span={2}>
                  {dayjs(selectedOrder.actualDeliveryDate).format('YYYY-MM-DD')}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Descriptions title="地址信息" bordered column={1}>
              <Descriptions.Item label="收货地址">
                {selectedOrder.shippingAddress}
              </Descriptions.Item>
              <Descriptions.Item label="账单地址">
                {selectedOrder.billingAddress}
              </Descriptions.Item>
            </Descriptions>

            {selectedOrder.trackingNumber && (
              <>
                <Divider />
                <Descriptions title="物流信息" bordered column={2}>
                  <Descriptions.Item label="物流单号" span={2}>
                    <TruckOutlined /> {selectedOrder.trackingNumber}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {selectedOrder.paymentMethod && (
              <>
                <Divider />
                <Descriptions title="支付信息" bordered column={2}>
                  <Descriptions.Item label="支付方式" span={2}>
                    <DollarOutlined /> {selectedOrder.paymentMethod}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {selectedOrder.notes && (
              <>
                <Divider />
                <Descriptions title="备注信息" bordered column={1}>
                  <Descriptions.Item label="备注">
                    {selectedOrder.notes}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            <Divider />

            <div>
              <h4>订单状态跟踪</h4>
              <Timeline items={getOrderTimeline(selectedOrder)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OrderQuery