import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Avatar, Image, Row, Col } from 'antd';
import { ProForm, ProFormText, ProFormSelect, ProCard, ProFormDigit } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import type { VariantInfo, ProductInfo } from '@zyerp/shared';
import { useMessage } from '@/shared/hooks';
import { ProductVariantsService } from '../services/product-variants.service';
import productService from '@/features/product/services/product.service';
import { useProductAttributeLines } from '../hooks/useProductAttributeLines';

interface VariantFormProps {
  productId: string;
  variant?: VariantInfo;
  visible: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  productName?: string;
  productImage?: string;
}

type VariantFormValues = {
  name?: string;
  status?: 'active' | 'inactive';
  barcode?: string;
  qrCode?: string;
  standardPrice?: number;
  salePrice?: number;
  purchasePrice?: number;
  currency?: string;
  minStock?: number;
  safetyStock?: number;
  maxStock?: number;
  reorderPoint?: number;
  attributes?: Record<string, string>;
};

const VariantForm: React.FC<VariantFormProps> = ({ productId, variant, visible, onClose, onUpdated, productName, productImage }) => {
  const message = useMessage();
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const { attributes: attributeLinesRaw } = useProductAttributeLines(productId);
  const attributeLines: Array<{ attributeName: string; values: string[]; source?: 'product' | 'global' }> = (attributeLinesRaw || []) as Array<{ attributeName: string; values: string[]; source?: 'product' | 'global' }>;
  const formRef = useRef<ProFormInstance<VariantFormValues> | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      if (productName && productImage) return;
      try {
        const resp = await productService.getProductById(productId);
        if (resp.success) setProduct(resp.data || null);
      } catch {
        // ignore
      }
    };
    if (visible) { void load(); }
  }, [visible, productId, productName, productImage]);

  const initialAttrs = useMemo(() => {
    const map: Record<string, string> = {};
    (variant?.variantAttributes || []).forEach((a) => {
      if (a?.name) map[a.name] = a.value || '';
    });
    return map;
  }, [variant]);

  const initialValues = useMemo(() => ({
    name: variant?.name,
    status: variant?.status ?? 'active',
    barcode: variant?.barcode,
    qrCode: variant?.qrCode,
    standardPrice: variant?.standardPrice,
    salePrice: variant?.salePrice,
    purchasePrice: variant?.purchasePrice,
    currency: variant?.currency || 'CNY',
    minStock: variant?.minStock,
    safetyStock: variant?.safetyStock,
    maxStock: variant?.maxStock,
    reorderPoint: variant?.reorderPoint,
    attributes: initialAttrs,
  }), [variant, initialAttrs]);

  const onFinish = async (values: VariantFormValues) => {
    try {
      const attrsObj: Record<string, string> = values?.attributes || {};
      const variantAttributes = Object.keys(attrsObj).map((k) => ({ name: k, value: attrsObj[k] })).filter((x) => x.name && x.value);
      if (!variant?.id) {
        if (!variantAttributes.length && attributeLines.length) {
          message.error('请选择产品属性');
          return false;
        }
        const suffixCode = variantAttributes.map((x) => x.value).filter(Boolean).join('-')
        const suffixName = variantAttributes.map((x) => x.value).filter(Boolean).join(' ')
        const autoCode = headerCode ? `${headerCode}-${suffixCode || 'BASE'}`.toUpperCase() : (suffixCode ? suffixCode.toUpperCase() : 'BASE')
        const variantName = (values.name && values.name.trim()) ? values.name : (headerName && headerName !== '-' ? `${headerName} ${suffixName || ''}`.trim() : (suffixName || '新变体'))
        const item: { name: string; code: string; barcode?: string; variantAttributes?: Array<{ name: string; value: string }> } = { name: variantName, code: autoCode, variantAttributes }
        if (values.barcode) item.barcode = values.barcode
        const resp = await ProductVariantsService.batchCreate(productId, [item]);
        const created = Number(resp.data?.success ?? 0);
        const failed = Number(resp.data?.failed ?? 0);
        if (created > 0) {
          const extra = failed > 0 ? `，已存在 ${failed} 条` : '';
          message.success(`变体创建成功 ${created} 条${extra}`);
          onUpdated?.();
          onClose();
          return true;
        }
        message.error(failed > 0 ? '创建失败：同属性变体已存在' : (resp.message || '变体创建失败'));
        return false;
      } else {
        const data = await ProductVariantsService.updateVariant(productId, variant.id, {
          name: values.name,
          status: values.status,
          barcode: values.barcode,
          qrCode: values.qrCode,
          standardPrice: values.standardPrice,
          salePrice: values.salePrice,
          purchasePrice: values.purchasePrice,
          currency: values.currency,
          minStock: values.minStock,
          safetyStock: values.safetyStock,
          maxStock: values.maxStock,
          reorderPoint: values.reorderPoint,
          variantAttributes,
        });
        if (data?.success) {
          message.success('变体更新成功');
          onUpdated?.();
          onClose();
          return true;
        }
        message.error(data?.message || '变体更新失败');
        return false;
      }
    } catch {
      message.error('提交失败，请重试');
      return false;
    }
  };

  const headerName = productName || product?.name || '-';
  const headerCode = product?.code || '';
  type ProductWithImage = ProductInfo & { primaryImageUrl?: string; images?: Array<{ url: string; isPrimary?: boolean; sortOrder?: number }> };
  const pImg = (product as ProductWithImage | null);
  const headerImage = productImage || pImg?.primaryImageUrl || pImg?.images?.find(i => i.isPrimary)?.url || pImg?.images?.[0]?.url;

  useEffect(() => {
    if (!visible) return;
    if (variant?.id) return; // 编辑模式不覆盖
    const defaultName = headerName && headerName !== '-' ? headerName : undefined;
    const current = formRef.current?.getFieldValue?.('name') as string | undefined;
    if (!current && defaultName) {
      formRef.current?.setFieldsValue?.({ name: defaultName });
    }
  }, [visible, variant, headerName]);

  return (
    <Modal 
      title={variant ? '编辑变体' : '新增变体'} 
      open={visible} 
      onCancel={onClose} 
      footer={null} 
      width={1200}
      destroyOnHidden
    >
      <ProForm<VariantFormValues>
        formRef={formRef}
        layout="vertical" 
        initialValues={initialValues} 
        submitter={{ searchConfig: { submitText: '保存' } }} 
        onFinish={onFinish}
      >
        <ProCard title="产品信息" bordered style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {headerImage ? (
              <Image src={headerImage} width={64} height={64} style={{ objectFit: 'cover', borderRadius: 4 }} />
            ) : (
              <Avatar shape="square" size={64} style={{ background: '#f0f0f0' }}>
                {headerName?.[0] || 'P'}
              </Avatar>
            )}
            <div>
              <div style={{ fontWeight: 600 }}>{headerName}</div>
              {headerCode ? <div style={{ color: '#999' }}>{headerCode}</div> : null}
            </div>
          </div>
        </ProCard>

        <ProCard title="变体信息" bordered style={{ marginBottom: 12 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <ProFormText name="name" label="名称" rules={[{ required: true, message: '请输入变体名称' }]} />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ProFormDigit name="standardPrice" label="价格" min={0} fieldProps={{ precision: 2, addonAfter: '元' }} />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ProFormDigit name="minStock" label="最小库存" min={0} fieldProps={{ precision: 0 }} />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <ProFormDigit name="maxStock" label="最大库存" min={0} fieldProps={{ precision: 0 }} />
            </Col>
          </Row>
          {attributeLines && attributeLines.length > 0 && (
            <>
              {attributeLines.map((a) => (
                <Row key={a.attributeName} gutter={16}>
                  <Col xs={24} sm={24} md={8}>
                    <ProFormSelect
                      name={[ 'attributes', a.attributeName ]}
                      label={a.attributeName}
                      options={(a.values || []).map((v) => ({ label: v, value: v }))}
                      rules={variant ? [] : (a.source === 'product' ? [{ required: true, message: `请选择${a.attributeName}` }] : [])}
                      fieldProps={{ allowClear: true, showSearch: true }}
                    />
                  </Col>
                </Row>
              ))}
            </>
          )}
        </ProCard>

        
      </ProForm>
    </Modal>
  );
};

export default VariantForm;
