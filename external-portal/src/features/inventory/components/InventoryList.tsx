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
  Modal,
  message,
  Progress
} from 'antd'
import { 
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import type { ProductInventory, InventorySearchParams } from '../types'

const InventoryList: React.FC = () => {
  const [inventory, setInventory] = useState<ProductInventory[]>([])
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<InventorySearchParams>({})
  const [selectedProduct, setSelectedProduct] = useState<ProductInventory | null>(null)
  const [viewModalVisible, setViewModalVisible] = useState(false)
 
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // 模拟库存数据
  const mockInventory: ProductInventory[] = [
    {
      id: 'INV-001',
      productCode: 'ST-001',
      productName: '钢材原料',
      category: '原材料',
      specification: 'Q235B 厚度10mm',
      unit: '吨',
      currentStock: 150,
      availableStock: 120,
      reservedStock: 30,
      minStockLevel: 50,
      maxStockLevel: 500,
      location: '仓库A-01',
      lastUpdated: '2024-01-15 14:30:00',
      supplier: '钢铁供应商A',
      unitPrice: 4500,
      totalValue: 675000,
      status: 'in_stock'
    },
    {
      id: 'INV-002',
      productCode: 'EC-001',
      productName: '电子元件',
      category: '电子器件',
      specification: '电阻器 1KΩ ±5%',
      unit: '件',
      currentStock: 25,
      availableStock: 20,
      reservedStock: 5,
      minStockLevel: 100,
      maxStockLevel: 1000,
      location: '仓库B-02',
      lastUpdated: '2024-01-14 16:20:00',
      supplier: '电子供应商B',
      unitPrice: 2.5,
      totalValue: 62.5,
      status: 'low_stock'
    },
    {
      id: 'INV-003',
      productCode: 'PK-001',
      productName: '包装材料',
      category: '包装用品',
      specification: '纸箱 40x30x20cm',
      unit: '个',
      currentStock: 800,
      availableStock: 750,
      reservedStock: 50,
      minStockLevel: 200,
      maxStockLevel: 2000,
      location: '仓库C-03',
      lastUpdated: '2024-01-13 10:15:00',
      supplier: '包装供应商C',
      unitPrice: 8,
      totalValue: 6400,
      status: 'in_stock'
    },
    {
      id: 'INV-004',
      productCode: 'PL-001',
      productName: '塑料制品',
      category: '塑料原料',
      specification: 'PVC管 直径50mm',
      unit: '米',
      currentStock: 0,
      availableStock: 0,
      reservedStock: 0,
      minStockLevel: 100,
      maxStockLevel: 1000,
      location: '仓库D-04',
      lastUpdated: '2024-01-12 09:45:00',
      supplier: '塑料供应商D',
      unitPrice: 25,
      totalValue: 0,
      status: 'out_of_stock'
    },
    {
      id: 'INV-005',
      productCode: 'CH-001',
      productName: '化工原料',
      category: '化学品',
      specification: '工业酒精 99.5%',
      unit: '升',
      currentStock: 300,
      availableStock: 280,
      reservedStock: 20,
      minStockLevel: 50,
      maxStockLevel: 500,
      location: '仓库E-05',
      lastUpdated: '2024-01-11 13:20:00',
      supplier: '化工供应商E',
      unitPrice: 15,
      totalValue: 4500,
      status: 'in_stock'
    }
  ]

  // 获取库存数据
  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredData = [...mockInventory]
      
      // 应用搜索过滤
      if (searchParams.search) {
        const searchTerm = searchParams.search.toLowerCase()
        filteredData = filteredData.filter(item => 
          item.productName.toLowerCase().includes(searchTerm) ||
          item.productCode.toLowerCase().includes(searchTerm) ||
          item.specification.toLowerCase().includes(searchTerm)
        )
      }
      
      if (searchParams.category) {
        filteredData = filteredData.filter(item => item.category === searchParams.category)
      }
      
      if (searchParams.status) {
        filteredData = filteredData.filter(item => item.status === searchParams.status)
      }
      
      if (searchParams.location) {
        filteredData = filteredData.filter(item => item.location === searchParams.location)
      }
      
      if (searchParams.supplier) {
        filteredData = filteredData.filter(item => item.supplier === searchParams.supplier)
      }
      
      setInventory(filteredData)
      setPagination(prev => ({ ...prev, total: filteredData.length }))
     
    } catch {
       message.error('获取库存数据失败')
     } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  // 获取状态标签
  const getStatusTag = (status: ProductInventory['status']) => {
    const statusConfig = {
      in_stock: { color: 'green', text: '正常库存' },
      low_stock: { color: 'orange', text: '库存不足' },
      out_of_stock: { color: 'red', text: '缺货' },
      discontinued: { color: 'gray', text: '停产' }
    }
    const config = statusConfig[status]
    return <Tag color={config.color}>{config.text}</Tag>
  }

  // 计算库存百分比
  const getStockPercentage = (current: number, max: number) => {
    if (max === 0) return 0
    return Math.round((current / max) * 100)
  }

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchParams(prev => ({ ...prev, search: value }))
  }

  const handleCategoryChange = (value: string) => {
    setSearchParams(prev => ({ ...prev, category: value }))
  }

 

  // 操作处理
  const handleView = (record: ProductInventory) => {
    setSelectedProduct(record)
    setViewModalVisible(true)
  }


  // 表格列定义
  const columns = [
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 200,
    },
    {
      title: '当前库存',
      key: 'currentStock',
      width: 120,
      render: (record: ProductInventory) => (
        <div>
          <div>{record.currentStock} {record.unit}</div>
          <Progress 
            percent={getStockPercentage(record.currentStock, record.maxStockLevel)}
            size="small"
            status={record.status === 'low_stock' ? 'exception' : record.status === 'out_of_stock' ? 'exception' : 'normal'}
          />
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price: number) => `¥${price.toLocaleString()}`,
      width: 100,
    },
   
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      render: (record: ProductInventory) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleView(record)}
          >
            查看
          </Button>
        </Space>
      ),
      width: 80,
    },
  ]

  return (
    <div style={{ padding: '12px' }}>


      {/* 搜索区域 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="搜索产品名称、编码或规格"
              prefix={<SearchOutlined />}
              value={searchParams.search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="选择分类"
              value={searchParams.category}
              onChange={handleCategoryChange}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="原材料">原材料</Select.Option>
              <Select.Option value="电子器件">电子器件</Select.Option>
              <Select.Option value="包装用品">包装用品</Select.Option>
              <Select.Option value="塑料原料">塑料原料</Select.Option>
              <Select.Option value="化学品">化学品</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* 库存表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={inventory}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 查看详情模态框 */}
      <Modal
        title="产品库存详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedProduct && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>产品编码:</strong> {selectedProduct.productCode}</p>
                <p><strong>产品名称:</strong> {selectedProduct.productName}</p>
                <p><strong>分类:</strong> {selectedProduct.category}</p>
                <p><strong>规格:</strong> {selectedProduct.specification}</p>
                <p><strong>单位:</strong> {selectedProduct.unit}</p>
                <p><strong>供应商:</strong> {selectedProduct.supplier}</p>
              </Col>
              <Col span={12}>
                <p><strong>当前库存:</strong> {selectedProduct.currentStock} {selectedProduct.unit}</p>
                <p><strong>可用库存:</strong> {selectedProduct.availableStock} {selectedProduct.unit}</p>
                <p><strong>预留库存:</strong> {selectedProduct.reservedStock} {selectedProduct.unit}</p>
                <p><strong>最小库存:</strong> {selectedProduct.minStockLevel} {selectedProduct.unit}</p>
                <p><strong>最大库存:</strong> {selectedProduct.maxStockLevel} {selectedProduct.unit}</p>
                <p><strong>存储位置:</strong> {selectedProduct.location}</p>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>单价:</strong> ¥{selectedProduct.unitPrice.toLocaleString()}</p>
                <p><strong>总价值:</strong> ¥{selectedProduct.totalValue.toLocaleString()}</p>
              </Col>
              <Col span={12}>
                <p><strong>状态:</strong> {getStatusTag(selectedProduct.status)}</p>
                <p><strong>最后更新:</strong> {selectedProduct.lastUpdated}</p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default InventoryList