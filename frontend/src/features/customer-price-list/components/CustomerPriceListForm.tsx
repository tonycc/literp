import React, { useState, useEffect, useRef } from 'react';
import { Button, Row, Col, Space } from 'antd';
import { ProForm, ProFormText, ProFormSelect, ProFormDatePicker, ProFormDigit, ProCard } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import type { CreateCustomerPriceListData, UpdateCustomerPriceListData } from '../types';
import { VATRate, PriceListStatus, Unit } from '../types';
import { VAT_RATE_OPTIONS, UNIT_OPTIONS, PRICE_LIST_STATUS_OPTIONS } from '@/shared/constants/customer-price-list';
import { customerService } from '@/features/customer-management/services/customer.service';
import { productService } from '@/features/product/services/product.service';
import { getUsers } from '@/shared/services';

interface CustomerPriceListFormProps {
  initialValues?: UpdateCustomerPriceListData;
  onSubmit: (values: CreateCustomerPriceListData | UpdateCustomerPriceListData) => Promise<void>;
  loading?: boolean;
}

type CustomerPriceListFormValues = Omit<CreateCustomerPriceListData | UpdateCustomerPriceListData, 'effectiveDate' | 'expiryDate'> & {
  effectiveDate?: string | dayjs.Dayjs;
  expiryDate?: string | dayjs.Dayjs;
  priceExcludingTax?: number;
  taxAmount?: number;
};

const CustomerPriceListForm: React.FC<CustomerPriceListFormProps> = ({
  initialValues,
  onSubmit,
  loading = false,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // 使用自定义接口避免 ProFormInstance 解析为 any 导致的 unsafe call 错误
  interface LocalFormInstance {
    getFieldValue: (name: string) => unknown;
    setFieldsValue: (values: Partial<CustomerPriceListFormValues>) => void;
    resetFields: () => void;
    submit: () => void;
  }
  const formRef = useRef<LocalFormInstance | undefined>(undefined);

  const vatRateOptions = VAT_RATE_OPTIONS;
  const unitOptions = UNIT_OPTIONS;

  // 计算不含税价格和税额
  const calculatePrices = (priceIncludingTax: number, vatRate: VATRate) => {
    const priceExcludingTax = priceIncludingTax / (1 + vatRate / 100);
    const taxAmount = priceIncludingTax - priceExcludingTax;
    return {
      priceExcludingTax: Number(priceExcludingTax.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
    };
  };

  // 处理含税价格变化
  const handlePriceIncludingTaxChange = (value: number | null) => {
    if (value && value > 0) {
      const vatRate = (formRef.current?.getFieldValue('vatRate') as VATRate | undefined) || VATRate.RATE_13;
      const { priceExcludingTax, taxAmount } = calculatePrices(value, vatRate);
      formRef.current?.setFieldsValue({
        priceExcludingTax,
        taxAmount,
      });
    }
  };

  // 处理税率变化
  const handleVatRateChange = (value: VATRate) => {
    const priceIncludingTax = formRef.current?.getFieldValue('priceIncludingTax') as number | undefined;
    if (priceIncludingTax && priceIncludingTax > 0) {
      const { priceExcludingTax, taxAmount } = calculatePrices(priceIncludingTax, value);
      formRef.current?.setFieldsValue({
        priceExcludingTax,
        taxAmount,
      });
    }
  };

  // 表单提交
  const handleSubmit = async (values: CustomerPriceListFormValues) => {
    try {
      const formattedValues = {
        ...values,
        effectiveDate: values.effectiveDate ? dayjs(values.effectiveDate).format('YYYY-MM-DD') : '',
        expiryDate: values.expiryDate ? dayjs(values.expiryDate).format('YYYY-MM-DD') : undefined,
      } as unknown as CreateCustomerPriceListData | UpdateCustomerPriceListData;

      await onSubmit(formattedValues);
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  // 初始化表单值
  useEffect(() => {
    if (initialValues) {
      formRef.current?.setFieldsValue({
        ...initialValues,
        effectiveDate: initialValues.effectiveDate ? dayjs(initialValues.effectiveDate) : undefined,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : undefined,
      });
    } else {
      formRef.current?.resetFields();
    }
  }, [initialValues]);

  return (
    <ProForm<CustomerPriceListFormValues>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      formRef={formRef as any}
      onFinish={handleSubmit}
      layout="vertical"
      submitter={{ render: () => null }}
    >
      <ProCard title="客户信息" style={{ marginBottom: 16,border: '1px solid #e8e8e8' }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <ProFormSelect
              name="customerId"
              label="客户"
              placeholder="请选择客户"
              rules={[{ required: true, message: '请选择客户' }]}
              fieldProps={{
                showSearch: true,
                filterOption: (input: string, option?: { label?: string }) => String(option?.label || '').toLowerCase().includes(input.toLowerCase()),
              }}
              request={async () => {
                const res = await customerService.getCustomerOptions({ activeOnly: true });
                return (res.data || []).map(opt => ({ label: opt.name, value: opt.id }));
              }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <ProFormSelect
              name="salesManager"
              label="销售负责人"
              placeholder="请选择销售负责人"
              rules={[{ required: true, message: '请选择销售负责人' }]}
              fieldProps={{
                showSearch: true,
                filterOption: (input: string, option?: { label?: string }) => String(option?.label || '').toLowerCase().includes(input.toLowerCase()),
              }}
              request={async () => {
                const res = await getUsers({ page: 1, pageSize: 999 });
                return (res.data || []).map(u => ({ label: u.username, value: u.username }));
              }}
            />
          </Col>
        </Row>
      </ProCard>

      <ProCard title="产品信息" style={{ marginBottom: 16,border: '1px solid #e8e8e8' }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <ProFormSelect
              name="productSelect"
              label="产品选择"
              placeholder="请选择产品（可选）"
              allowClear
              fieldProps={{
                onChange: (value, option) => {
                  type ProductOptionData = { name?: string; code?: string; specification?: string; unit?: { name: string; symbol: string }; primaryImageUrl?: string };
                  const opt = option as { data?: ProductOptionData } | undefined;
                  const data = opt?.data;
                  const unitSymbol = data?.unit?.symbol;
                  formRef.current?.setFieldsValue({
                    productName: data?.name,
                    productCode: data?.code,
                    specification: data?.specification,
                    unit: unitSymbol as Unit,
                    productImage: data?.primaryImageUrl,
                  });
                  setSelectedProductId(typeof value === 'string' ? value : String(value));
                }
              }}
              request={async () => {
                const res = await productService.getProductOptions({ activeOnly: true });
                return (res.data || []).map(p => ({ label: `${p.name} (${p.code})`, value: p.id, data: p }));
              }}
            />
          </Col>
          <Col xs={24} sm={0}>
            <ProFormText
              name="productName"
              label="产品名称"
              placeholder="请输入产品名称"
              rules={[{ required: true, message: '请输入产品名称' }, { max: 100, message: '产品名称不能超过100个字符' }]}
              hidden
            />
          </Col>
        
          <Col xs={24} sm={8}>
            <ProFormText
              name="productCode"
              label="产品编码"
              placeholder="请输入产品编码"
              rules={[{ required: true, message: '请输入产品编码' }, { max: 50, message: '产品编码不能超过50个字符' }]}
            />
          </Col>
          <Col xs={24} sm={4}>
            <ProFormText
              name="specification"
              label="规格型号"
              placeholder="请输入规格型号（可选）"
              rules={[{ max: 100, message: '规格型号不能超过100个字符' }]}
            />
          </Col>
          <Col xs={24} sm={4}>
            <ProFormSelect
              name="unit"
              label="单位"
              placeholder="请选择单位"
              rules={[{ required: true, message: '请选择单位' }]}
              params={{ productId: selectedProductId || undefined }}
              request={async (params: { productId?: string }) => {
                if (params?.productId) {
                  const res = await productService.getProductById(String(params.productId));
                  const uName = res.data?.unit?.name;
                  const uSymbol = res.data?.unit?.symbol;
                  if (res.success && uName && uSymbol) {
                    return [{ label: uName, value: uSymbol }];
                  }
                }
                return unitOptions;
              }}
            />
          </Col>
         
        </Row>
        <Row gutter={16}>
           <Col xs={24} sm={8}>
            <ProFormText
              name="customerProductCode"
              label="客户产品编码"
              placeholder="请输入客户产品编码（可选）"
              rules={[{ max: 50, message: '客户产品编码不能超过50个字符' }]}
            />
          </Col>
        </Row>
      </ProCard>

      <ProCard title="其他信息" style={{ marginBottom: 16,border: '1px solid #e8e8e8' }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <ProFormDigit
              name="priceIncludingTax"
              label="销售单价(含税)"
              placeholder="请输入销售单价(含税)"
              rules={[{ required: true, message: '请输入销售单价(含税)' }]}
              min={0.01}
              fieldProps={{ precision: 2, onChange: handlePriceIncludingTaxChange }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <ProFormSelect
              name="vatRate"
              label="增值税税率"
              placeholder="请选择增值税税率"
              rules={[{ required: true, message: '请选择增值税税率' }]}
              fieldProps={{ onChange: handleVatRateChange }}
              options={vatRateOptions}
            />
          </Col>
          <Col xs={24} sm={8}>
            <ProFormDigit
              name="priceExcludingTax"
              label="销售单价(不含税)"
              fieldProps={{ precision: 2, disabled: true }}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <ProFormDigit
              name="taxAmount"
              label="税额"
              fieldProps={{ precision: 2, disabled: true }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <ProFormDatePicker
              name="effectiveDate"
              label="生效日期"
              placeholder="请选择生效日期"
              rules={[{ required: true, message: '请选择生效日期' }]}
            />
          </Col>
          <Col xs={24} sm={8}>
            <ProFormDatePicker
              name="expiryDate"
              label="失效日期"
              placeholder="请选择失效日期（可选）"
            />
          </Col>
          <Col xs={24} sm={8}>
            <ProFormSelect
              name="status"
              label="状态"
              placeholder="请选择状态"
              rules={[{ required: true, message: '请选择状态' }]}
              options={PRICE_LIST_STATUS_OPTIONS}
              initialValue={PriceListStatus.ACTIVE}
            />
          </Col>
        </Row>
      </ProCard>
       <Space>
              <Button type="primary" loading={loading} onClick={() => formRef.current?.submit?.()}>
                {initialValues ? '更新' : '创建'}
              </Button>
              <Button onClick={() => formRef.current?.resetFields?.()}>重置</Button>
            </Space>
    </ProForm>
  );
};

export default CustomerPriceListForm;