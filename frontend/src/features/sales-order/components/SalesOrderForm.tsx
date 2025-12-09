import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { Card, Row, Col } from 'antd';
import { SALES_ORDER_PAYMENT_METHOD_VALUE_ENUM_PRO } from '@/shared/constants/sales-order';
import { 
  type SalesOrderBase,
  type SalesOrderFormData,
  type SalesOrderFormItem,
  type SalesOrderPaymentMethodType,
} from '@zyerp/shared';
import { ProForm, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea, ProFormList } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import type { DefaultOptionType } from 'antd/es/select';
import { productService } from '@/features/product/services/product.service';
import { customerService } from '@/features/customer-management/services/customer.service';
import { getUsers } from '@/shared/services';

// 1. 定义表单值类型 (Form Model)
// 直接引用 shared 中的泛型领域模型，实现单点维护
// TDate=Dayjs (UI使用), TPaymentMethod=SharedType, TItem=SharedItem
export type SalesOrderFormValues = SalesOrderBase<dayjs.Dayjs, SalesOrderPaymentMethodType, SalesOrderFormItem> & {
  // UI 辅助字段 (不在后端模型中)
  id?: string;
  customerId?: string;
};

interface SalesOrderFormProps {
  formRef?: React.MutableRefObject<ProFormInstance<SalesOrderFormValues> | undefined>;
  onSubmit: (values: SalesOrderFormData) => Promise<void>;
  initialValues?: Partial<SalesOrderFormData>;
  mode?: 'create' | 'edit';
}

// 产品选项类型，与 ProductService.getProductOptions 返回一致
type ProductOptionItem = {
  id: string;
  code: string;
  name: string;
  specification?: string;
  unit?: { name: string; symbol: string };
  primaryImageUrl?: string;
};

type ProductSelectOption = DefaultOptionType & {
  data?: ProductOptionItem;
};

const safeString = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return '';
};

export const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ formRef, onSubmit, initialValues, mode = 'create' }) => {
  
  const transformedInitialValues = useMemo<SalesOrderFormValues>(() => {
    const iv = initialValues || {};
    const contactInfoParts = (safeString(iv.contactInfo)).split(' / ');

    return {
      customerName: iv.customerName ?? '',
      contactInfo: iv.contactInfo ?? '',
      contactPerson: contactInfoParts[0] || iv.contactPerson || '',
      contactPhone: contactInfoParts[1] || iv.contactPhone || '',
      orderDate: iv.orderDate ? dayjs(iv.orderDate) : dayjs(),
      deliveryDate: iv.deliveryDate ? dayjs(iv.deliveryDate) : dayjs().add(30, 'day'),
      salesManager: iv.salesManager ?? '',
      taxRate: iv.taxRate ?? 13,
      paymentMethod: iv.paymentMethod ?? 'cash',
      plannedPaymentDate: iv.plannedPaymentDate ? dayjs(iv.plannedPaymentDate) : dayjs().add(15, 'day'),
      remark: iv.remark ?? '',
      totalPriceWithTax: iv.totalPriceWithTax ?? 0,
      items: Array.isArray(iv.items) && iv.items.length > 0
        ? iv.items.map((item: SalesOrderFormItem) => ({
            productId: item.productId,
            productName: item.productName,
            productCode: item.productCode,
            specification: item.specification,
            unit: item.unit,
            quantity: item.quantity,
            unitPriceWithTax: item.unitPriceWithTax
          }))
        : (mode === 'create' ? [{ productId: '', quantity: 1, unitPriceWithTax: 0 }] : []),
    };
  }, [initialValues, mode]);

  const handleFinish = async (vals: SalesOrderFormValues) => {
    const values = vals;
    const person = safeString(values.contactPerson).trim();
    const phone = safeString(values.contactPhone).trim();
    const contactInfoJoined = [person, phone].filter(Boolean).join(' / ');
    
    const formatDate = (v: dayjs.Dayjs | string | undefined): string => {
      if (!v) return dayjs().format('YYYY-MM-DD');
      return dayjs(v).format('YYYY-MM-DD');
    };
    
    const formData: SalesOrderFormData = {
      customerName: values.customerName || '',
      contactInfo: contactInfoJoined || values.contactInfo || '',
      contactPerson: person,
      contactPhone: phone,
      orderDate: formatDate(values.orderDate),
      deliveryDate: formatDate(values.deliveryDate),
      salesManager: values.salesManager || '',
      items: (values.items || []).map((it) => ({
          productId: String(it.productId || ''),
          productName: it.productName ? String(it.productName) : undefined,
          productCode: it.productCode ? String(it.productCode) : undefined,
          specification: it.specification ? String(it.specification) : undefined,
          unit: it.unit ? String(it.unit) : undefined,
          quantity: Number(it.quantity || 0),
          unitPriceWithTax: Number(it.unitPriceWithTax || 0),
        })),
      taxRate: Number(values.taxRate) || 0,
      paymentMethod: (values.paymentMethod || 'cash'),
      plannedPaymentDate: formatDate(values.plannedPaymentDate),
      remark: values.remark,
      totalPriceWithTax: values.totalPriceWithTax,
    };
    await onSubmit(formData);
    return true;
  };

  const onValuesChange = (changedValues: Partial<SalesOrderFormValues>, allValues: SalesOrderFormValues) => {
    const items = allValues.items || [];
    // 当数量或单价发生变化时，重新计算总价
    if (changedValues.items || changedValues.taxRate !== undefined) {
      const total = items.reduce((sum, it) => {
        const price = Number(it?.unitPriceWithTax || 0);
        const qty = Number(it?.quantity || 0);
        return sum + price * qty;
      }, 0);
      
      const currentTotal = Number(formRef?.current?.getFieldValue('totalPriceWithTax') || 0);
      const newTotal = Number(total.toFixed(2));
      
      if (currentTotal !== newTotal) {
        formRef?.current?.setFieldValue('totalPriceWithTax', newTotal);
      }
    }
  };

  return (
    <ProForm<SalesOrderFormValues>
      formRef={formRef}
      layout="vertical"
      initialValues={transformedInitialValues}
      onFinish={handleFinish}
      onValuesChange={onValuesChange}
      submitter={false}
    >
      <Card size="small" title="客户信息" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          {mode === 'create' ? (
            <Col span={8}>
              <ProFormSelect
                name="customerId"
                label="选择客户"
                showSearch
                rules={[{ required: true, message: '请选择客户' }]}
                request={async (params) => {
                  const { keyWords } = params as { keyWords?: string };
                  const res = await customerService.getCustomerOptions({ keyword: keyWords });
                  return (res.data || []).map((c) => ({ label: c.name, value: c.id }));
                }}
                fieldProps={{
                  onChange: (val: unknown, option: unknown) => {
                    void (async () => {
                      const form = formRef?.current;
                      let label = '';
                      if (option && typeof option === 'object' && 'label' in option) {
                        const l = (option as Record<string, unknown>).label;
                        if (typeof l === 'string') label = l;
                      }
                      form?.setFieldsValue?.({ customerName: label });
                      if (val) {
                        const resp = await customerService.getById(safeString(val));
                        const c = resp.data;
                        form?.setFieldsValue?.({
                          contactPerson: String(c?.contactPerson ?? ''),
                          contactPhone: String(c?.phone ?? ''),
                        });
                      }
                    })();
                  },
                }}
              />
            </Col>
          ) : (
            <Col span={8}>
              <ProFormText name="customerName" label="客户名称" readonly />
            </Col>
          )}
          <Col span={6}>
            <ProFormSelect
              name="salesManager"
              label="销售负责人"
              rules={[{ required: true, message: '请选择销售负责人' }]}
              fieldProps={{
                showSearch: true,
                filterOption: (input, option) => {
                  const label = (option as { label?: unknown } | undefined)?.label;
                  return typeof label === 'string' && label.toLowerCase().includes(input.toLowerCase());
                },
              }}
              request={async () => {
                const res = await getUsers({ page: 1, pageSize: 999 });
                return (res.data || []).map((u) => ({ label: u.username, value: u.username }));
              }}
            />
          </Col>
          {mode === 'create' && (
            <Col span={0}>
              <ProFormText name="customerName" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]} hidden />
            </Col>
          )}
          <Col span={6}>
            <ProFormText
              name="contactPerson"
              label="联系人"
              rules={[{ required: true, message: '请输入联系人' }]}
              readonly={mode === 'edit'}
            />
          </Col>
          <Col span={4}>
            <ProFormText
              name="contactPhone"
              label="联系方式"
              rules={[{ required: true, message: '请输入联系方式' }]}
              readonly={mode === 'edit'}
            />
          </Col>

        </Row>
      </Card>

      <Card size="small" title="产品信息" style={{ marginBottom: 16 }}>
        <Row style={{ fontWeight: 600, marginBottom: 8 }}>
          <Col span={8}>产品</Col>
          <Col span={4}>含税单价</Col>
          <Col span={4}>数量</Col>
          <Col span={4}>单位</Col>
          <Col span={4}>规格</Col>
        </Row>
        <ProFormList
          name="items"
          creatorButtonProps={{ creatorButtonText: '添加产品' }}
          copyIconProps={false}
          deleteIconProps={{ tooltipText: '移除' }}
        >
          {(f) => (
            <>
              <Row gutter={16} style={{ marginBottom: 8 }}>
                <Col span={8}>
                  <ProFormSelect
                    name={['productId']}
                    label={false}
                    showSearch
                    rules={[{ required: true, message: '请选择产品' }]}
                    request={async (params) => {
                    const { keyWords } = params as { keyWords?: string };
                    // 显式处理类型
                    const res = await productService.getProductOptions({ keyword: keyWords });
                    const list = res.data || [];
                    return list.map((p) => ({ label: `${p.name}${p.code ? ` (${p.code})` : ''}`, value: p.id, data: p }));
                  }}
                  fieldProps={{
                    filterOption: (input, option) => {
                      const label = (option as { label?: unknown } | undefined)?.label;
                      return typeof label === 'string' && label.toLowerCase().includes(input.toLowerCase());
                    },
                    allowClear: true,
                    onChange: (value, option) => {
                      void (async () => {
                        const form = formRef?.current;
                        const all = form?.getFieldsValue?.();
                        const items = (all?.items && Array.isArray(all.items)) ? [...all.items] : [];
                        const idx = typeof f.name === 'number' ? f.name : Number(f.name);
                        const current = items[idx] || {};

                        let nameFromOption = '';
                        let codeFromOption = '';
                        let specFromOption = '';
                        let unitSymbolFromOption = '';
                        
                        if (option && typeof option === 'object' && 'label' in option) {
                            const l = (option as Record<string, unknown>).label;
                            if (typeof l === 'string') nameFromOption = l;
                        }

                        if (!value) {
                          items[idx] = { ...current, productId: '', productName: '', productCode: '', specification: '', unit: '' };
                          form?.setFieldsValue?.({ items });
                          return;
                        }

                        const valStr = safeString(value);

                        const optData = (option as ProductSelectOption)?.data;
                        if (optData) {
                          nameFromOption = optData.name ?? nameFromOption;
                          codeFromOption = optData.code ?? '';
                          specFromOption = optData.specification ?? '';
                          unitSymbolFromOption = optData.unit?.name ?? '';
                          if (!specFromOption || !unitSymbolFromOption) {
                            const detail = await productService.getProductById(valStr);
                            const d = detail.data;
                            specFromOption = specFromOption || String(d?.specification ?? '');
                            unitSymbolFromOption = unitSymbolFromOption || String(d?.unit?.name ?? '');
                          }
                        } else {
                          const detail = await productService.getProductById(valStr);
                          const d = detail.data;
                          nameFromOption = String(d?.name ?? nameFromOption ?? '');
                          codeFromOption = String(d?.code ?? '');
                          specFromOption = String(d?.specification ?? '');
                          unitSymbolFromOption = String(d?.unit?.name ?? '');
                        }

                        items[idx] = {
                          ...current,
                          productId: valStr,
                          productName: nameFromOption,
                          productCode: codeFromOption,
                          specification: specFromOption,
                          unit: unitSymbolFromOption,
                          quantity: current.quantity || 1,
                          unitPriceWithTax: current.unitPriceWithTax || 0
                        };
                        form?.setFieldsValue?.({ items });
                      })();
                    },
                  }}
                />
                </Col>
                <Col span={4}>
                  <ProFormDigit name={['unitPriceWithTax']} label={false} min={0} fieldProps={{ precision: 2 }} rules={[{ required: true, message: '请输入含税单价' }]} />
                </Col>
                <Col span={4}>
                  <ProFormDigit name={['quantity']} label={false} min={1} rules={[{ required: true, message: '请输入数量' }]} />
                </Col>
                <Col span={4}>
                  <ProFormText name={['unit']} label={false} disabled/>
                </Col>
                 <Col span={4}>
                  <ProFormText name={['specification']} label={false} disabled/>
                </Col>
                
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <ProFormText name={['productName']} label={false} fieldProps={{ readOnly: true, placeholder: '产品名称' }} hidden/>
                </Col>
                <Col span={12}>
                  <ProFormText name={['productCode']} label={false} fieldProps={{ readOnly: true, placeholder: '产品编码' }} hidden/>
                </Col>
              </Row>
            </>
          )}
        </ProFormList>
      </Card>

      <Card size="small" title="价格与税" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <ProFormDigit name="taxRate" label="税率(%)" min={0} max={100} fieldProps={{ precision: 2 }} rules={[{ required: true, message: '请输入税率' }]} />
          </Col>
          <Col span={8}>
            <ProFormDigit name="unitPriceWithoutTax" label="销售单价-不含税" fieldProps={{ precision: 2, disabled: true }} />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <ProFormDigit name="totalPriceWithTax" label="销售总价-含税" fieldProps={{ precision: 2, disabled: true }} />
          </Col>
        </Row>
      </Card>

      <Card size="small" title="其他信息" style={{ marginBottom: 16 }}>
         <Row gutter={16}>
          <Col span={8}>
            <ProFormDatePicker name="orderDate" label="订单签订日期" rules={[{ required: true, message: '请选择订单签订日期' }]} />
          </Col>
          <Col span={8}>
            <ProFormDatePicker name="deliveryDate" label="订单交付日期" rules={[{ required: true, message: '请选择订单交付日期' }]} />
          </Col>
        
          <Col span={8}>
            <ProFormSelect
              name="paymentMethod"
              label="收款方式"
              rules={[{ required: true, message: '请选择收款方式' }]}
              valueEnum={SALES_ORDER_PAYMENT_METHOD_VALUE_ENUM_PRO}
            />
          </Col>
          
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} />
          </Col>
        </Row>
      </Card>
    </ProForm>
  );
};
