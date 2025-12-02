import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Avatar, Image, Row, Col } from 'antd';
import { ProForm, ProFormText, ProFormSelect, ProCard, ProFormDigit } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import type { VariantInfo, ProductInfo } from '@zyerp/shared';
import { ProductStatus } from '@zyerp/shared';
import { useMessage } from '@/shared/hooks';
import { ProductVariantsService } from '../services/product-variants.service';
import productService from '@/features/product/services/product.service';
import { useProductAttributeLines } from '../hooks/useProductAttributeLines';

interface VariantFormProps {
  productId?: string;
  variant?: VariantInfo;
  visible: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  productName?: string;
  productImage?: string;
}

type VariantFormValues = {
  productId?: string;
  name?: string;
  sku?: string;
  status?: ProductStatus;
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
  attributes?: Record<string, string | string[]>;
};

const VariantForm: React.FC<VariantFormProps> = ({ productId, variant, visible, onClose, onUpdated, productName, productImage }) => {
  const message = useMessage();
  const [internalProductId, setInternalProductId] = useState<string | undefined>(productId);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  
  const effectiveProductId = internalProductId || '';
  
  const { attributes: attributeLinesRaw } = useProductAttributeLines(effectiveProductId);
  const attributeLines: Array<{ attributeName: string; values: string[]; source?: 'product' | 'global' }> = (attributeLinesRaw || []) as Array<{ attributeName: string; values: string[]; source?: 'product' | 'global' }>;
  const formRef = useRef<ProFormInstance<VariantFormValues> | undefined>(undefined);

  // Reset internal ID when visible changes or prop changes
  useEffect(() => {
    if (visible) {
      if (productId) {
        setInternalProductId(productId);
      } else if (!variant?.id) {
        // If creating new and no productId prop, start empty
        setInternalProductId(undefined);
      } else if (variant?.parentId) {
        // If editing, use variant's parentId
        setInternalProductId(variant.parentId);
      }
    }
  }, [visible, productId, variant]);

  useEffect(() => {
    const load = async () => {
      if (!effectiveProductId) {
        setProduct(null);
        return;
      }
      // Use props if available and matching
      if (productName && productImage && productId === effectiveProductId) return;
      
      try {
        const resp = await productService.getProductById(effectiveProductId);
        if (resp.success) setProduct(resp.data || null);
      } catch {
        // ignore
      }
    };
    if (visible) { void load(); }
  }, [visible, effectiveProductId, productId, productName, productImage]);

  const initialAttrs = useMemo(() => {
    const map: Record<string, string> = {};
    (variant?.variantAttributes || []).forEach((a) => {
      if (a?.name) map[a.name] = a.value || '';
    });
    return map;
  }, [variant]);

  const initialValues = useMemo(() => ({
    productId: effectiveProductId,
    name: variant?.name,
    sku: variant?.sku,
    status: (variant?.status as ProductStatus) || ProductStatus.ACTIVE,
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
  }), [variant, initialAttrs, effectiveProductId]);
  
  // Update form values when effectiveProductId changes (for initial load mainly)
  useEffect(() => {
     if (formRef.current && !variant?.id) {
         // When switching product in create mode, we might want to clear attributes
         formRef.current.setFieldsValue({ attributes: {} });
     }
  }, [effectiveProductId, variant]);

  // Helper to generate cartesian product
  const generateCombinations = (attrs: Record<string, string[]>): Array<Array<{name: string, value: string}>> => {
    const keys = Object.keys(attrs).filter(k => attrs[k] && attrs[k].length > 0);
    if (keys.length === 0) return [];

    let results: Array<Array<{name: string, value: string}>> = [[]];

    for (const key of keys) {
      const values = attrs[key];
      const nextResults = [];
      for (const prev of results) {
        for (const val of values) {
          nextResults.push([...prev, { name: key, value: val }]);
        }
      }
      results = nextResults;
    }
    return results;
  };

  // Helper to generate independent SKU
  const generateSku = (attributes: Array<{name: string, value: string}>, index: number) => {
     const random = Math.random().toString(36).substring(2, 6).toUpperCase();
     if (!attributes || attributes.length === 0) return `SKU-${random}-${index + 1}`;

     const attrStr = attributes.map(a => `${a.name}:${a.value}`).sort().join('|');
     let hash = 0;
     for (let i = 0; i < attrStr.length; i++) {
       const char = attrStr.charCodeAt(i);
       hash = ((hash << 5) - hash) + char;
       hash = hash & hash;
     }
     const suffix = Math.abs(hash).toString(36).toUpperCase().slice(0, 6);
     return `S${suffix}-${random}-${index + 1}`;
  };

  const onFinish = async (values: VariantFormValues) => {
    if (!effectiveProductId) {
      message.error('请先选择产品');
      return false;
    }

    try {
      if (!variant?.id) {
        // Create mode - support multiple selection and cartesian product
        const rawAttrs = values?.attributes || {};
        const normalizedAttrs: Record<string, string[]> = {};
        
        Object.keys(rawAttrs).forEach(key => {
          const val = rawAttrs[key];
          if (Array.isArray(val)) {
            normalizedAttrs[key] = val;
          } else if (val) {
            normalizedAttrs[key] = [val];
          }
        });

        // Generate combinations
        let combinations = generateCombinations(normalizedAttrs);
        
        // Handle case where no attributes are selected but attribute lines exist
        if (combinations.length === 0 && attributeLines.length > 0) {
           // Check if any required attribute is missing
           const missingRequired = attributeLines.some(l => l.source === 'product' && (!normalizedAttrs[l.attributeName] || normalizedAttrs[l.attributeName].length === 0));
           if (missingRequired) {
             message.error('请选择产品属性');
             return false;
           }
        }
        
        if (combinations.length === 0) {
            combinations = [[]];
        }

        const itemsToCreate = combinations.map((variantAttributes, index) => {
          const suffixCode = variantAttributes.map((x) => x.value).filter(Boolean).join('-');
          const suffixName = variantAttributes.map((x) => x.value).filter(Boolean).join(' ');
          const autoCode = headerCode ? `${headerCode}-${suffixCode || 'BASE'}`.toUpperCase() : (suffixCode ? suffixCode.toUpperCase() : 'BASE');
          
          // If user provided a name, append attributes to it. If not, use headerName + attributes
          const baseName = (values.name && values.name.trim()) ? values.name : (headerName && headerName !== '-' ? headerName : '新变体');
          const variantName = suffixName ? `${baseName} ${suffixName}` : baseName;
          
          // Generate independent SKU
          let finalSku = values.sku;
          if (!finalSku) {
             finalSku = generateSku(variantAttributes, index);
          } else if (combinations.length > 1) {
             // If manual SKU provided for batch, append suffix to ensure uniqueness
             finalSku = `${finalSku}-${index + 1}`; 
          }

          return { 
            name: variantName, 
            code: autoCode, 
            variantAttributes,
            sku: finalSku, 
            barcode: values.barcode,
            standardPrice: values.standardPrice,
            salePrice: values.salePrice,
            purchasePrice: values.purchasePrice,
            minStock: values.minStock,
            maxStock: values.maxStock,
            safetyStock: values.safetyStock
          };
        });
        
        const resp = await ProductVariantsService.batchCreate(effectiveProductId, itemsToCreate);
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
        // Edit mode - single variant
        const attrsObj = values?.attributes || {};
        const variantAttributes = Object.keys(attrsObj).map((k) => {
           const val = attrsObj[k];
           // Edit mode should be single value
           const strVal = Array.isArray(val) ? val[0] : val;
           return { name: k, value: String(strVal || '') };
        }).filter((x) => x.name && x.value);

        const data = await ProductVariantsService.updateVariant(effectiveProductId, variant.id, {
          name: values.name,
          sku: values.sku,
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
          variantAttributes: variantAttributes,
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

  const headerName = (productName && productId === effectiveProductId) ? productName : (product?.name || '-');
  const headerCode = product?.code || '';
  
  type ProductWithImage = ProductInfo & { primaryImageUrl?: string; images?: Array<{ url: string; isPrimary?: boolean; sortOrder?: number }> };
  const pImg = (product as ProductWithImage | null);
  const headerImage = (productImage && productId === effectiveProductId) ? productImage : (pImg?.primaryImageUrl || pImg?.images?.find(i => i.isPrimary)?.url || pImg?.images?.[0]?.url);

  useEffect(() => {
    if (!visible) return;
    if (variant?.id) return; // 编辑模式不覆盖
    
    // 当产品信息加载后，如果名称是空的，自动填充
    const defaultName = headerName && headerName !== '-' ? headerName : undefined;
    const current = formRef.current?.getFieldValue?.('name') as string | undefined;
    
    // 只有当还没有输入时才自动填充
    if ((!current || current === '-') && defaultName) {
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
        key={variant?.id || 'new'}
        formRef={formRef}
        layout="vertical" 
        initialValues={initialValues} 
        submitter={{ searchConfig: { submitText: '保存' } }} 
        onFinish={onFinish}
      >
        {!productId && !variant?.id && (
          <ProCard title="选择产品" bordered style={{ marginBottom: 12 }}>
            <ProFormSelect
              name="productId"
              showSearch
              placeholder="请输入产品名称或编码搜索"
              request={async (params: Record<string, unknown>) => {
                const keyWords = typeof params.keyWords === 'string' ? params.keyWords : undefined;
                const res = await productService.getProducts({ keyword: keyWords, page: 1, pageSize: 50 });
                const products = res.data || [];
                return products.map((item) => ({ label: `${item.name} [${item.code}]`, value: item.id }));
              }}
              fieldProps={{
                onChange: (val) => setInternalProductId(val as string | undefined),
                allowClear: true,
              }}
              rules={[{ required: true, message: '请先选择产品' }]}
            />
          </ProCard>
        )}

        {effectiveProductId && (
          <>
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
                <Col xs={24} sm={12} md={8}>
                  <ProFormText name="name" label="名称" rules={[{ required: true, message: '请输入变体名称' }]} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <ProFormText name="sku" label="SKU" placeholder="为空时默认使用Code" />
                </Col>
                </Row>
                <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <ProFormDigit name="standardPrice" label="标准价格" min={0} fieldProps={{ precision: 2, addonAfter: '元' }} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <ProFormDigit name="salePrice" label="销售价格" min={0} fieldProps={{ precision: 2, addonAfter: '元' }} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <ProFormDigit name="purchasePrice" label="采购价格" min={0} fieldProps={{ precision: 2, addonAfter: '元' }} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <ProFormDigit name="minStock" label="最小库存" min={0} fieldProps={{ precision: 0 }} />
                </Col>
                <Col xs={24} sm={12} md={8}>  
                  <ProFormDigit name="maxStock" label="最大库存" min={0} fieldProps={{ precision: 0 }} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <ProFormDigit name="safetyStock" label="安全库存" min={0} fieldProps={{ precision: 0 }} />
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
                          fieldProps={{ 
                            allowClear: true, 
                            showSearch: true,
                            mode: !variant?.id ? 'multiple' : undefined, // Multiple selection for creation
                          }}
                        />
                      </Col>
                    </Row>
                  ))}
                </>
              )}
            </ProCard>
          </>
        )}
      </ProForm>
    </Modal>
  );
};

export default VariantForm;
