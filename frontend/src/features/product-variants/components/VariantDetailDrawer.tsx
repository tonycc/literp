import React, { useEffect, useState } from 'react';
import { Drawer, Image, Space, Divider } from 'antd';
import { ProDescriptions } from '@ant-design/pro-components';
import type { VariantInfo, ProductInfo } from '@zyerp/shared';
import { ProductVariantsService } from '../services/product-variants.service';
import { ProductService } from '../../product/services/product.service';

interface VariantDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  variant?: VariantInfo;
  productId?: string;
}

const VariantDetailDrawer: React.FC<VariantDetailDrawerProps> = ({ open, onClose, variant, productId }) => {
  const [images, setImages] = useState<Array<{ id: string; url: string }>>([]);
  const [product, setProduct] = useState<ProductInfo | null>(null);

  useEffect(() => {
    if (open && productId) {
      // Load variant images
      if (variant?.id) {
        ProductVariantsService.listVariantImages(productId, variant.id)
          .then(res => {
              if (res.success) setImages(res.data || []);
          })
          .catch(() => {
              // console.error('Load images failed');
          });
      }

      // Load product info
      const productService = new ProductService();
      productService.getProductById(productId)
        .then(res => {
          if (res.success && res.data) {
            setProduct(res.data);
          }
        })
        .catch(() => {
          // console.error('Load product failed');
        });
    } else {
        setImages([]);
        setProduct(null);
    }
  }, [open, productId, variant]);

  if (!variant) return null;

  return (
    <Drawer
      title="产品详情"
      width={600}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
        {product && (
          <>
            <ProDescriptions column={2} title="所属产品信息" dataSource={product}>
              <ProDescriptions.Item dataIndex="name" label="产品名称" span={2} />
              <ProDescriptions.Item dataIndex="code" label="产品编码" />
              <ProDescriptions.Item label="产品分类">
                {product.category?.name || '-'}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="基本单位">
                {product.unit?.name || '-'}
              </ProDescriptions.Item>
              <ProDescriptions.Item dataIndex="type" label="产品类型" valueEnum={{
                standard: { text: '标准产品', status: 'Default' },
                service: { text: '服务产品', status: 'Processing' },
                digital: { text: '数字产品', status: 'Success' },
              }} />
              <ProDescriptions.Item dataIndex="status" label="状态" valueEnum={{
                active: { text: '启用', status: 'Success' },
                inactive: { text: '停用', status: 'Error' },
                draft: { text: '草稿', status: 'Default' },
              }} />
            </ProDescriptions>
            <Divider />
          </>
        )}

        <ProDescriptions column={2} title="变体基础信息" dataSource={variant}>
             <ProDescriptions.Item dataIndex="name" label="变体名称" span={2} />
             <ProDescriptions.Item dataIndex="productName" label="所属产品" span={2} />
             <ProDescriptions.Item dataIndex="code" label="变体编码" />
             <ProDescriptions.Item dataIndex="sku" label="SKU" />
             <ProDescriptions.Item dataIndex="barcode" label="条形码" />
             <ProDescriptions.Item dataIndex="qrCode" label="二维码" />
        </ProDescriptions>
        <Divider />
        <ProDescriptions column={2} title="价格与库存设定" dataSource={variant}>
             <ProDescriptions.Item dataIndex="standardPrice" label="标准价" valueType="money" />
             <ProDescriptions.Item dataIndex="salePrice" label="销售价" valueType="money" />
             <ProDescriptions.Item dataIndex="purchasePrice" label="采购价" valueType="money" />
             <ProDescriptions.Item dataIndex="currency" label="币种" />
             <ProDescriptions.Item dataIndex="minStock" label="最小库存" />
             <ProDescriptions.Item dataIndex="maxStock" label="最大库存" />
             <ProDescriptions.Item dataIndex="safetyStock" label="安全库存" />
             <ProDescriptions.Item dataIndex="reorderPoint" label="重订货点" />
        </ProDescriptions>
        <Divider />
        <ProDescriptions title="属性信息" column={1}>
             <ProDescriptions.Item>
                {variant.variantAttributes?.length ? (
                    <Space direction="vertical">
                        {variant.variantAttributes.map((a, idx) => (
                            <span key={idx}>
                                <strong>{a.name}:</strong> {a.value}
                            </span>
                        ))}
                    </Space>
                ) : '无属性信息'}
             </ProDescriptions.Item>
        </ProDescriptions>
        <Divider />
        <div style={{ marginBottom: 16, fontWeight: 'bold' }}>图片信息</div>
        <Space wrap size="large">
            {images.length > 0 ? images.map(img => (
                <Image key={img.id} width={120} src={img.url} />
            )) : <span style={{ color: '#999' }}>暂无图片</span>}
        </Space>
    </Drawer>
  );
};

export default VariantDetailDrawer;
