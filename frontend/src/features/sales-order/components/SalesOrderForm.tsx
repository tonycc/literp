import React from 'react';
import dayjs from 'dayjs';
import { Card, Row, Col } from 'antd';
import type { SalesOrderFormData } from '../types';
import { PaymentMethod } from '../types';
import { SALES_ORDER_PAYMENT_METHOD_VALUE_ENUM_PRO } from '@/shared/constants/sales-order';
import { ProForm, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea, ProFormList } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { productService } from '@/features/product/services/product.service';
import { customerService } from '@/features/customer-management/services/customer.service';
import { getUsers } from '@/shared/services';
import type { ProductInfo } from '@zyerp/shared';

interface SalesOrderFormProps {
  formRef?: React.MutableRefObject<ProFormInstance<SalesOrderFormData> | undefined>;
  onSubmit: (values: SalesOrderFormData) => Promise<void>;
  initialValues?: Partial<SalesOrderFormData>;
}

type SalesOrderItemForm = NonNullable<SalesOrderFormData['items']>[number];

export const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ formRef, onSubmit, initialValues }) => {
  const handleFinish = async (values: SalesOrderFormData) => {
    const person = String(values?.contactPerson ?? '').trim();
    const phone = String(values?.contactPhone ?? '').trim();
    const contactInfoJoined = [person, phone].filter(Boolean).join(' / ');
    const formatDate = (v: unknown): string => {
      if (typeof v === 'string' && v) return v;
      const maybe = v as { format?: (f: string) => string } | undefined;
      if (maybe && typeof maybe.format === 'function') return maybe.format('YYYY-MM-DD');
      return dayjs().format('YYYY-MM-DD');
    };
    const formData: SalesOrderFormData = {
      customerName: values.customerName as string,
      contactInfo: contactInfoJoined || '',
      orderDate: formatDate(values.orderDate as unknown),
      deliveryDate: formatDate(values.deliveryDate as unknown),
      salesManager: (values.salesManager as string) || undefined,
      items: Array.isArray(values.items)
        ? (values.items as SalesOrderItemForm[]).map((it) => ({
            productId: String(it.productId || ''),
            productName: it.productName ? String(it.productName) : undefined,
            productCode: it.productCode ? String(it.productCode) : undefined,
            specification: it.specification ? String(it.specification) : undefined,
            unit: it.unit ? String(it.unit) : undefined,
            quantity: Number(it.quantity || 0),
            unitPriceWithTax: Number(it.unitPriceWithTax || 0),
          }))
        : undefined,
      taxRate: Number(values.taxRate) || 0,
      paymentMethod: values.paymentMethod as unknown as PaymentMethod,
      plannedPaymentDate: formatDate(values.plannedPaymentDate as unknown),
      remark: values.remark as string,
    };
    await onSubmit(formData);
    return true;
  };

  const onValuesChange = (changed: unknown, all: unknown) => {
    const form = formRef?.current;
    if (!form) return;
    const values = all as Partial<SalesOrderFormData>;
    const items: SalesOrderItemForm[] = Array.isArray(values.items) ? (values.items as SalesOrderItemForm[]) : [];
    const total = items.reduce((sum, it) => sum + Number(it.unitPriceWithTax || 0) * Number(it.quantity || 0), 0);
    form.setFieldsValue({ totalPriceWithTax: Number(total.toFixed(2)) });
  };

  return (
    <ProForm<SalesOrderFormData>
      formRef={formRef}
      layout="vertical"
      request={async () => {
        const iv = initialValues ?? {};
        const data = {
          customerName: iv.customerName ?? '',
          contactInfo: iv.contactInfo ?? '',
          contactPerson: (iv.contactInfo ?? '').split(' / ')[0] ?? '',
          contactPhone: (iv.contactInfo ?? '').split(' / ')[1] ?? '',
          orderDate: iv.orderDate ? dayjs(iv.orderDate) : dayjs(),
          deliveryDate: iv.deliveryDate ? dayjs(iv.deliveryDate) : dayjs().add(30, 'day'),
          salesManager: iv.salesManager ?? '',
          taxRate: iv.taxRate ?? 13,
          paymentMethod: (iv.paymentMethod ?? PaymentMethod.CASH) as PaymentMethod,
          plannedPaymentDate: iv.plannedPaymentDate ? dayjs(iv.plannedPaymentDate) : dayjs().add(15, 'day'),
          remark: iv.remark ?? '',
          totalPriceWithTax: iv.totalPriceWithTax ?? 0,
        };
        return data as unknown as SalesOrderFormData;
      }}
      params={{ ivKey: JSON.stringify(initialValues ?? {}) }}
      onFinish={handleFinish}
      onValuesChange={onValuesChange}
      submitter={false}
    >
      <Card size="small" title="客户信息" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <ProFormSelect
              name="customerId"
              label="选择客户"
              showSearch
              rules={[{ required: true, message: '请选择客户' }]}
              request={async ({ keyWords }) => {
                const res = await customerService.getCustomerOptions({ keyword: keyWords });
                return (res.data || []).map((c) => ({ label: c.name, value: c.id }));
              }}
              fieldProps={{
                onChange: async (val: string, option) => {
                  const form = formRef?.current;
                  let label = '';
                  if (typeof option === 'object' && option && Object.prototype.hasOwnProperty.call(option, 'label')) {
                    label = String((option as Record<string, unknown>).label ?? '');
                  }
                  form?.setFieldsValue?.({ customerName: label });
                  if (val) {
                    const resp = await customerService.getById(val);
                    const c = resp.data;
                    form?.setFieldsValue?.({
                      contactPerson: String(c?.contactPerson ?? ''),
                      contactPhone: String(c?.phone ?? ''),
                    });
                  }
                },
              }}
            />
          </Col>
           <Col span={6}>
            <ProFormSelect
              name="salesManager"
              label="销售负责人"
              rules={[{ required: true, message: '请选择销售负责人' }]}
              fieldProps={{
                showSearch: true,
                filterOption: (input, option) => String(option?.label || '').toLowerCase().includes(input.toLowerCase()),
              }}
              request={async () => {
                const res = await getUsers({ page: 1, pageSize: 999 });
                return (res.data || []).map((u) => ({ label: u.username, value: u.username }));
              }}
            />
          </Col>
          <Col span={0}>
            <ProFormText name="customerName" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]} hidden/>
          </Col>
          <Col span={6}>
            <ProFormText name="contactPerson" label="联系人" rules={[{ required: true, message: '请输入联系人' }]} disabled/>
          </Col>
          <Col span={4}>
            <ProFormText name="contactPhone" label="联系方式" rules={[{ required: true, message: '请输入联系方式' }]} disabled/>
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
          initialValue={[{}]}
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
                    request={async ({ keyWords }) => {
                    const res = await productService.getProductOptions({});
                    const list = res.data || [];
                    const filtered = keyWords ? list.filter((p) => (p.name || '').includes(keyWords) || (p.code || '').includes(keyWords)) : list;
                    return filtered.map((p) => ({ label: `${p.name}${p.code ? ` (${p.code})` : ''}`, value: p.id, data: p }));
                  }}
                  fieldProps={{
                    filterOption: (input, option) => String(option?.label || '').toLowerCase().includes(input.toLowerCase()),
                    allowClear: true,
                    onChange: async (value, option) => {
                      const form = formRef?.current;
                      const all = form?.getFieldsValue?.() as SalesOrderFormData | undefined;
                      const items: SalesOrderItemForm[] = Array.isArray(all?.items) ? ([...(all?.items as SalesOrderItemForm[])]) : [];
                      const idx = typeof f.name === 'number' ? f.name : Number(f.name);
                      const current = items[idx] || {};

                        let nameFromOption = (option as { label?: string })?.label ?? '';
                        let codeFromOption = '';
                        let specFromOption = '';
                        let unitSymbolFromOption = '';

                      if (!value) {
                        items[idx] = { ...current, productId: '', productName: '', productCode: '', specification: '', unit: '' };
                        form?.setFieldsValue?.({ items });
                        return;
                      }

                      const optData = (option as unknown as { data?: { name?: string; code?: string; specification?: string; unit?: { name: string; symbol: string } } })?.data;
                      if (optData) {
                        nameFromOption = optData.name ?? nameFromOption;
                        codeFromOption = optData.code ?? '';
                        specFromOption = optData.specification ?? '';
                        unitSymbolFromOption = optData.unit?.name ?? '';
                        if (!specFromOption || !unitSymbolFromOption) {
                          const detail = await productService.getProductById(String(value));
                          const d = detail.data as ProductInfo | undefined;
                          specFromOption = specFromOption || String(d?.specification ?? '');
                          unitSymbolFromOption = unitSymbolFromOption || String(d?.unit?.name ?? '');
                        }
                      } else {
                        const detail = await productService.getProductById(String(value));
                        const d = detail.data as ProductInfo | undefined;
                        nameFromOption = String(d?.name ?? nameFromOption ?? '');
                        codeFromOption = String(d?.code ?? '');
                        specFromOption = String(d?.specification ?? '');
                        unitSymbolFromOption = String(d?.unit?.name ?? '');
                      }

                      items[idx] = {
                        ...current,
                        productId: String(value ?? ''),
                        productName: nameFromOption,
                        productCode: codeFromOption,
                        specification: specFromOption,
                        unit: unitSymbolFromOption,
                      };
                      form?.setFieldsValue?.({ items });
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