import React, { useState, useRef } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProductVariantsService } from '../services/product-variants.service';
import type { VariantInfo } from '@zyerp/shared';
import { useProductAttributeLines } from '../hooks/useProductAttributeLines';
import { Button, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMessage, useModal } from '@/shared/hooks'
import VariantForm from './VariantForm';
import productService from '@/features/product/services/product.service';
import { formatCurrency } from '@/shared/utils/format';
import VariantStockAdjustModal from './VariantStockAdjustModal';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';
import VariantImagePanel from './VariantImagePanel';
import VariantDetailDrawer from './VariantDetailDrawer';

interface ProductVariantsListProps { 
  productId?: string;
  onAddProduct?: () => void;
  actionRef?: React.MutableRefObject<ActionType | undefined>;
}

interface AttributeLine {
  attributeName: string;
  values: string[];
  source?: 'product' | 'global';
}

const ProductVariantsList: React.FC<ProductVariantsListProps> = ({ productId, onAddProduct, actionRef: parentActionRef }) => {
  const navigate = useNavigate();
  const hookData = useProductAttributeLines(productId || '')
  const message = useMessage()
  const modal = useModal()
  const internalActionRef = useRef<ActionType | undefined>(undefined);
  const actionRef = parentActionRef || internalActionRef;
  const [targetProductId, setTargetProductId] = useState<string | undefined>(undefined);
  const deleteVariant = (variantId: string, pId?: string) => {
    const effectiveProductId = productId || pId;
    if (!effectiveProductId) {
      message.error('无法获取产品上下文，删除失败');
      return;
    }

    // Check variant count first
    const checkAndConfirm = async () => {
      try {
        const variantsRes = await ProductVariantsService.getVariants(effectiveProductId, { page: 1, pageSize: 1 });
        const totalVariants = variantsRes.total;

        if (totalVariants <= 1) {
           modal.confirm({
            title: '确认删除？',
            content: '该变体是当前产品的唯一变体。删除该变体将同时删除产品本身，且不可恢复。是否继续？',
            okType: 'danger',
            onOk: async () => {
              const res = await productService.deleteProduct(effectiveProductId);
              if (res?.success) {
                message.success('产品及变体已删除');
                // If we are in product detail page (productId is present), we might want to navigate away or reload
                // But since we just deleted the product, reloading might fail or show empty.
                // Ideally navigate to product list if we are in detail page.
                if (productId) {
                  await navigate('/products');
                } else {
                  await actionRef.current?.reload();
                }
              } else {
                message.error(res?.message || '删除失败');
              }
            }
          });
        } else {
          modal.confirm({
            title: '确认删除该变体？',
            content: '删除后不可恢复，是否继续？',
            onOk: async () => {
              const res = await ProductVariantsService.deleteVariant(effectiveProductId, variantId);
              if (res?.success) {
                message.success('删除成功');
                await actionRef.current?.reload();
              } else {
                message.error(res?.message || '删除失败');
              }
            }
          });
        }
      } catch {
        message.error('获取变体信息失败，请重试');
      }
    };

    void checkAndConfirm();
  }
  const attributes = (hookData?.attributes || []) as AttributeLine[];
  const dynamicFilterColumns: ProColumns<VariantInfo>[] = productId ? attributes.map((a) => ({
    title: a.attributeName,
    dataIndex: `attr_${a.attributeName}`,
    key: `attr_${a.attributeName}`,
    valueType: 'select',
    fieldProps: {
      options: (a.values || []).map((v) => ({ label: v, value: v }))
    },
    hideInTable: true,
  })) : []
  const [editing, setEditing] = useState<VariantInfo | undefined>(undefined);
  const [formVisible, setFormVisible] = useState(false);
  const [stockVariantId, setStockVariantId] = useState<string | undefined>(undefined);
  const [stockVisible, setStockVisible] = useState(false);
  const [imageVariantId, setImageVariantId] = useState<string | undefined>(undefined);
  const [imageVisible, setImageVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [viewingVariant, setViewingVariant] = useState<VariantInfo | undefined>(undefined);
  const columns: ProColumns<VariantInfo>[] = [
    {
      title: '产品SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 180,
      ellipsis: true,
      copyable: true,
      fixed: 'left',
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: '属性名称',
      dataIndex: 'attributeNames',
      key: 'attributeNames',
      render: (_, record) => {
        const text = (record.variantAttributes || []).map((a) => a.name).join(' | ');
        return text ? <Tooltip title={text}>{text}</Tooltip> : '-';
      },
      ellipsis: true,
      width: 150,
    },
    {
      title: '属性值',
      dataIndex: 'attributeValues',
      key: 'attributeValues',
      render: (_, record) => {
        const text = (record.variantAttributes || []).map((a) => a.value).join(' | ');
        return text ? <Tooltip title={text}>{text}</Tooltip> : '-';
      },
      ellipsis: true,
      width: 150,
    },
    
    {
      title: '标准价',
      dataIndex: 'standardPrice',
      key: 'standardPrice',
      render: (_, record) => (record.standardPrice != null ? formatCurrency(record.standardPrice) : '-'),
      align: 'right',
      width: 120,
    },
    {
      title: '销售价',
      dataIndex: 'salePrice',
      key: 'salePrice',
      render: (_, record) => (record.salePrice != null ? formatCurrency(record.salePrice) : '-'),
      align: 'right',
      width: 120,
    },
    {
      title: '采购价',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      render: (_, record) => (record.purchasePrice != null ? formatCurrency(record.purchasePrice) : '-'),
      align: 'right',
      width: 120,
    },
    {
      title: '最小库存',
      dataIndex: 'minStock',
      key: 'minStock',
      render: (_, record) => (record.minStock != null ? record.minStock : '-'),
      align: 'right',
      width: 120,
    },
    {
      title: '最大库存',
      dataIndex: 'maxStock',
      key: 'maxStock',
      render: (_, record) => (record.maxStock != null ? record.maxStock : '-'),
      align: 'right',
      width: 120,
    },
    {
      title: '安全库存',
      dataIndex: 'safetyStock',
      key: 'safetyStock',
      render: (_, record) => (record.safetyStock != null ? record.safetyStock : '-'),
      align: 'right',
      width: 120,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => (
        <div style={{ display: 'inline-flex', columnGap: 2}}>
          <Button type="link" size='small' onClick={() => { setViewingVariant(record); setTargetProductId(productId || record.parentId); setDetailVisible(true); }}>详情</Button>
          <Button type="link" size='small' onClick={() => { setEditing(record); setTargetProductId(productId || record.parentId); setFormVisible(true); }}>编辑</Button>
          <Button type="link" size='small' onClick={() => { deleteVariant(record.id, record.parentId); }}>删除</Button>
          <Button type="link" size='small' onClick={() => { setStockVariantId(record.id); setTargetProductId(productId || record.parentId); setStockVisible(true); }}>库存调整</Button>
        </div>
      ),
      fixed: 'right',
      width: 150,
    },
    ...dynamicFilterColumns,
    // Add other columns as needed
  ];

  return (
    <>
    <ProTable<VariantInfo>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        const listParams = normalizeTableParams(params as Record<string, unknown>)
        const res = await ProductVariantsService.getVariants(productId, listParams)
        return {
          data: res.data,
          success: res.success,
          total: res.total,
        }
      }}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      headerTitle="产品列表"
      options={{ density: true, fullScreen: true, reload: true, setting: { listsHeight: 400 } }}
      scroll={{ x: 1500 }}
      sticky
      toolBarRender={() => [
         <Button key="add-product" type="primary" onClick={() => { 
          if (onAddProduct) {
            onAddProduct();
          } else {
            void navigate('/products/new'); 
          }
        }}>
          新增产品
        </Button>,
        <Button key="add-variant" onClick={() => { setEditing(undefined); setFormVisible(true); }}>
          新增产品变体
        </Button>
       
      ]}
    />
    {formVisible && (
      <VariantForm
        productId={productId || targetProductId || ''}
        variant={editing}
        visible={formVisible}
        onClose={() => { setFormVisible(false); setEditing(undefined); setTargetProductId(undefined); }}
        onUpdated={() => { void actionRef.current?.reload(); }}
      />
    )}
    {stockVariantId && (
      <VariantStockAdjustModal
        productId={productId || targetProductId || ''}
        variantId={stockVariantId}
        visible={stockVisible}
        onClose={() => { setStockVisible(false); setStockVariantId(undefined); setTargetProductId(undefined); }}
        onUpdated={() => { void actionRef.current?.reload(); }}
      />
    )}
    {imageVariantId && (
      <VariantImagePanel
        productId={productId || ''}
        variantId={imageVariantId}
        visible={imageVisible}
        onClose={() => { setImageVisible(false); setImageVariantId(undefined); }}
      />
    )}
    {detailVisible && (
      <VariantDetailDrawer
        open={detailVisible}
        onClose={() => { setDetailVisible(false); setViewingVariant(undefined); setTargetProductId(undefined); }}
        variant={viewingVariant}
        productId={productId || targetProductId || ''}
      />
    )}
  </>
  );
};

export default ProductVariantsList;