import React, { useEffect, useState } from 'react';
import {
  Modal,
  Descriptions,
  Card,
  Row,
  Col,
  Image,
  Tag,
  Table,
  Spin,
  Typography,
  Space,
  Badge,
  Button
} from 'antd';
import type { ProductInfo } from '@zyerp/shared';
import { PRODUCT_TYPE_MAP, PRODUCT_STATUS_MAP, ACQUISITION_METHOD_MAP } from '@/shared/constants/product';
import { productService } from '../services/product.service';
import { useMessage } from '@/shared/hooks';

const { Title } = Typography;

interface ProductDetailProps {
  productId?: string;
  visible: boolean;
  onClose: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  productId,
  visible,
  onClose,
}) => {
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const message = useMessage();

  const fetchProductDetail = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const response = await productService.getProductById(productId);
      if (response.success) {
        setProduct(response.data || null);
      } else {
        message.error(response.message || '获取产品详情失败');
      }
    } catch (error) {
      console.error('获取产品详情失败:', error);
      message.error('获取产品详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && productId) {
      void fetchProductDetail();
    }
  }, [visible, productId]);

  // 规格参数表格列
  const specColumns = [
    {
      title: '参数名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '参数值',
      dataIndex: 'value',
      key: 'value',
      width: 150
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 100
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          'text': '文本',
          'number': '数字',
          'select': '选择',
          'boolean': '布尔'
        };
        return typeMap[type] || type;
      }
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (required: boolean) => (
        <Badge status={required ? 'success' : 'default'} text={required ? '是' : '否'} />
      )
    }
  ];

  return (
    <Modal
      title="产品详情"
      open={visible}
      onCancel={onClose}
      width={1200}
      destroyOnClose
      footer={<Button onClick={onClose}>关闭</Button>}
    >
      <Spin spinning={loading}>
        {product && (
          <div>
            {/* 基本信息 */}
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={16}>
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="产品编码">
                      {product.code}
                    </Descriptions.Item>
                    <Descriptions.Item label="产品名称">
                      {product.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="产品属性">
                      <Tag color={PRODUCT_TYPE_MAP[product.type]?.color}>
                        {PRODUCT_TYPE_MAP[product.type]?.label}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="计量单位">
                      {product.unit?.name} ({product.unit?.symbol})
                    </Descriptions.Item>
                    <Descriptions.Item label="获取方式">
                      {product.acquisitionMethod ? (
                        <Tag color={ACQUISITION_METHOD_MAP[product.acquisitionMethod]?.color}>
                          {ACQUISITION_METHOD_MAP[product.acquisitionMethod]?.label}
                        </Tag>
                      ) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                        <Badge
                        status={PRODUCT_STATUS_MAP[product.status]?.status}
                        text={PRODUCT_STATUS_MAP[product.status]?.label}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label="型号" span={2}>
                      {product.model || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="产品描述" span={2}>
                      {product.description || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="备注" span={2}>
                      {product.remark || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={8}>
                  {/* 产品图片 */}
                  <div style={{ textAlign: 'center' }}>
                    <Title level={5}>产品图片</Title>
                    {product.images && product.images.length > 0 ? (
                      <Image.PreviewGroup>
                        <Space wrap>
                          {product.images.map((image, index) => (
                            <Image
                              key={index}
                              width={80}
                              height={80}
                              src={image.url}
                              style={{ objectFit: 'cover', borderRadius: 4 }}
                            />
                          ))}
                        </Space>
                      </Image.PreviewGroup>
                    ) : (
                      <div style={{ 
                        width: 80, 
                        height: 80, 
                        border: '1px dashed #d9d9d9', 
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        margin: '0 auto'
                      }}>
                        暂无图片
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 成本与库存信息 */}
            <Card title="成本与库存" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={3} bordered size="small">
                <Descriptions.Item label="标准成本">
                  ¥{product.standardCost?.toFixed(2) || '0.00'}
                </Descriptions.Item>
                <Descriptions.Item label="最新成本">
                  ¥{product.latestCost?.toFixed(2) || '0.00'}
                </Descriptions.Item>
                <Descriptions.Item label="平均成本">
                  ¥{product.averageCost?.toFixed(2) || '0.00'}
                </Descriptions.Item>
                <Descriptions.Item label="安全库存下限">
                  {product.safetyStockMin || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="安全库存上限">
                  {product.safetyStockMax || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="再订货点">
                  {product.reorderPoint || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 规格参数 */}
            {product.specifications && product.specifications.length > 0 && (
              <Card title="规格参数" size="small" style={{ marginBottom: 16 }}>
                <Table
                  columns={specColumns}
                  dataSource={product.specifications}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </Card>
            )}

            {/* 其他信息 */}
            <Card title="其他信息" size="small">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="创建时间">
                  {product.createdAt ? new Date(product.createdAt).toLocaleString() : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="创建人">
                  {product.createdBy || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="更新人">
                  {product.updatedBy || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default ProductDetail;