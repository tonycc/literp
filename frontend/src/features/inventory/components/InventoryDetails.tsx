import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Descriptions,
  Tag,
  Row,
  Col,
  Statistic,
  Timeline,
  Button,
  Space,
  Typography,
  Divider,
  Progress,
  Alert
} from 'antd';
import {
  ArrowLeftOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type {
  ProductInventory,
  InventoryTransaction
} from '../types';
import {
  ProductType,
  InventoryStatus,
  InventoryTransactionType,
  PRODUCT_TYPE_CONFIG,
  INVENTORY_STATUS_CONFIG,
  INVENTORY_TRANSACTION_TYPE_CONFIG
} from '../types';
import BatchInventoryTable from './BatchInventoryTable';

const { Title, Text } = Typography;

interface InventoryDetailsProps {
  productId: string;
  onBack?: () => void;
}

const InventoryDetails: React.FC<InventoryDetailsProps> = ({ productId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState<ProductInventory | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);

  // 模拟数据
  const mockInventoryData: ProductInventory = {
    id: productId,
    productId: productId,
    productCode: 'RAW001',
    productName: '优质钢材',
    productType: ProductType.RAW_MATERIAL,
    specification: '规格: 10mm*20mm*100mm',
    unit: '吨',
    currentStock: 150.5,
    availableStock: 120.0,
    reservedStock: 30.5,
    safetyStock: 50.0,
    maxStock: 500.0,
    minStock: 20.0,
    reorderPoint: 30.0,
    averageCost: 5200.00,
    totalValue: 782600.00,
    warehouseId: 'WH001',
    warehouseName: '主仓库',
    locationId: 'LOC001',
    locationName: 'A区1排1号',
    lastInDate: '2024-01-15',
    lastOutDate: '2024-01-20',
    status: InventoryStatus.NORMAL,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20'
  };

  const mockTransactions: InventoryTransaction[] = [
    {
      id: 'TXN001',
      transactionNumber: 'TXN202401001',
      productId: productId,
      productCode: 'RAW001',
      productName: '优质钢材',
      type: InventoryTransactionType.PURCHASE_IN,
      quantity: 50.0,
      unitPrice: 5200.00,
      totalAmount: 260000.00,
      beforeStock: 100.5,
      afterStock: 150.5,
      warehouseId: 'WH001',
      warehouseName: '主仓库',
      locationId: 'LOC001',
      locationName: 'A区1排1号',
      relatedOrderId: 'PR202401001',
      relatedOrderNumber: 'PR202401001',
      operator: '张三',
      operatorId: 'USER001',
      remark: '采购入库',
      transactionDate: '2024-01-20',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    },
    {
      id: 'TXN002',
      transactionNumber: 'TXN202401002',
      productId: productId,
      productCode: 'RAW001',
      productName: '优质钢材',
      type: InventoryTransactionType.PRODUCTION_OUT,
      quantity: -20.0,
      unitPrice: 5200.00,
      totalAmount: -104000.00,
      beforeStock: 150.5,
      afterStock: 130.5,
      warehouseId: 'WH001',
      warehouseName: '主仓库',
      locationId: 'LOC001',
      locationName: 'A区1排1号',
      relatedOrderId: 'PO202401001',
      relatedOrderNumber: 'PO202401001',
      operator: '李四',
      operatorId: 'USER002',
      remark: '生产领料',
      transactionDate: '2024-01-18',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18'
    }
  ];

  useEffect(() => {
    const fetchInventoryDetails = async () => {
      setLoading(true);
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        setInventoryData(mockInventoryData);
        setTransactions(mockTransactions);
      } catch {
        // 处理错误
      } finally {
        setLoading(false);
      }
    };

    void fetchInventoryDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const getStockStatus = (current: number, min: number, max: number, safety: number) => {
    if (current <= min) {
      return { status: 'error', text: '库存不足', color: '#ff4d4f' };
    } else if (current <= safety) {
      return { status: 'warning', text: '库存预警', color: '#faad14' };
    } else if (current >= max) {
      return { status: 'warning', text: '库存过量', color: '#faad14' };
    } else {
      return { status: 'success', text: '库存正常', color: '#52c41a' };
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const transactionColumns = [
    {
      title: '变动类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: InventoryTransactionType) => {
        const config = INVENTORY_TRANSACTION_TYPE_CONFIG[type];
        return <Tag color={config?.color}>{config?.label}</Tag>;
      }
    },
    {
      title: '变动数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => (
        <Text style={{ color: quantity > 0 ? '#52c41a' : '#ff4d4f' }}>
          {quantity > 0 ? '+' : ''}{quantity}
        </Text>
      )
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (cost: number) => `¥${cost.toLocaleString()}`
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (cost: number) => (
        <Text style={{ color: cost > 0 ? '#52c41a' : '#ff4d4f' }}>
          ¥{Math.abs(cost).toLocaleString()}
        </Text>
      )
    },
    {
      title: '关联单据',
      dataIndex: 'relatedOrderNumber',
      key: 'relatedOrderNumber'
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator'
    },
    {
      title: '变动时间',
      dataIndex: 'transactionDate',
      key: 'transactionDate'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark'
    }
  ];

  if (!inventoryData) {
    return <Card loading={loading} />;
  }

  const stockStatus = getStockStatus(
    inventoryData.currentStock,
    inventoryData.minStock,
    inventoryData.maxStock,
    inventoryData.safetyStock
  );

  const stockPercentage = getStockPercentage(inventoryData.currentStock, inventoryData.maxStock);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
            返回
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            库存详情 - {inventoryData.productName}
          </Title>
        </Space>
      </div>

      {/* 库存状态警告 */}
      {stockStatus.status !== 'success' && (
        <Alert
          message={stockStatus.text}
          type={stockStatus.status as 'warning' | 'error'}
          icon={stockStatus.status === 'error' ? <ExclamationCircleOutlined /> : <WarningOutlined />}
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Row gutter={[24, 24]}>
        {/* 基本信息 */}
        <Col span={24}>
          <Card title="基本信息">
            <Descriptions column={3} bordered>
              <Descriptions.Item label="产品编码">{inventoryData.productCode}</Descriptions.Item>
              <Descriptions.Item label="产品名称">{inventoryData.productName}</Descriptions.Item>
              <Descriptions.Item label="产品属性">
                <Tag color={PRODUCT_TYPE_CONFIG[inventoryData.productType]?.color}>
                  {PRODUCT_TYPE_CONFIG[inventoryData.productType]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="规格型号">{inventoryData.specification}</Descriptions.Item>
              <Descriptions.Item label="计量单位">{inventoryData.unit}</Descriptions.Item>
              <Descriptions.Item label="库存状态">
                <Tag color={INVENTORY_STATUS_CONFIG[inventoryData.status]?.color}>
                  {INVENTORY_STATUS_CONFIG[inventoryData.status]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="所在仓库">{inventoryData.warehouseName}</Descriptions.Item>
              <Descriptions.Item label="库位编码">{inventoryData.locationId}</Descriptions.Item>
              <Descriptions.Item label="库位名称">{inventoryData.locationName}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* 库存统计 */}
        <Col span={24}>
          <Card title="库存统计">
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="当前库存"
                  value={inventoryData.currentStock}
                  suffix={inventoryData.unit}
                  valueStyle={{ color: stockStatus.color }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="可用库存"
                  value={inventoryData.availableStock}
                  suffix={inventoryData.unit}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="预留库存"
                  value={inventoryData.reservedStock}
                  suffix={inventoryData.unit}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="库存总值"
                  value={inventoryData.totalValue}
                  prefix="¥"
                  precision={2}
                />
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>库存水位</Text>
                  <Progress
                    percent={stockPercentage}
                    status={stockStatus.status as 'success' | 'exception' | 'active'}
                    strokeColor={stockStatus.color}
                    style={{ marginTop: '8px' }}
                  />
                </div>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="最小库存"
                      value={inventoryData.minStock}
                      suffix={inventoryData.unit}
                      valueStyle={{ fontSize: '14px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="安全库存"
                      value={inventoryData.safetyStock}
                      suffix={inventoryData.unit}
                      valueStyle={{ fontSize: '14px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="最大库存"
                      value={inventoryData.maxStock}
                      suffix={inventoryData.unit}
                      valueStyle={{ fontSize: '14px' }}
                    />
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                <Timeline>
                  <Timeline.Item
                    dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    color="green"
                  >
                    <Text strong>最近入库</Text>
                    <br />
                    <Text type="secondary">{inventoryData.lastInDate}</Text>
                  </Timeline.Item>
                  <Timeline.Item
                    dot={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                    color="blue"
                  >
                    <Text strong>最近出库</Text>
                    <br />
                    <Text type="secondary">{inventoryData.lastOutDate}</Text>
                  </Timeline.Item>
                </Timeline>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* 批次库存信息 */}
        <Col span={24}>
          <BatchInventoryTable 
            productId={productId} 
            productName={inventoryData.productName}
          />
        </Col>

        {/* 库存变动记录 */}
        <Col span={24}>
          <Card title="库存变动记录">
            <Table
              columns={transactionColumns}
              dataSource={transactions}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InventoryDetails;