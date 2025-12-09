import React, { useState } from 'react';
import { Card, Row, Col } from 'antd';
import { ProForm, ProFormDatePicker, ProFormSelect, ProFormTextArea, ProFormDigit, ProFormList } from '@ant-design/pro-components';
 
import type { FormInstance } from 'antd/es/form';
import type { DefaultOptionType } from 'antd/es/select';
 
import dayjs, { type Dayjs } from 'dayjs';
import type { PurchaseOrderFormData } from '@zyerp/shared';
import { PurchaseOrderStatus } from '@zyerp/shared';
import { useMessage } from '@/shared/hooks';
import { productService } from '@/features/product/services/product.service';
import { useUnitOptions } from '@/shared/hooks/useUnitOptions';
import { useWarehouseOptions } from '@/shared/hooks/useWarehouseOptions';
import { supplierService } from '@/features/supplier-management/services/supplier.service';
import { PURCHASE_ORDER_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/purchase-order';
import { GLOBAL_CURRENCY_OPTIONS } from '@/shared/constants/currency';

type ItemForm = {
  productId?: string;
  unitId?: string;
  warehouseId?: string;
  quantity?: number;
  price?: number;
  specification?: string;
};

interface FormValues {
  supplierId?: string;
  orderDate?: Dayjs;
  expectedDeliveryDate?: Dayjs;
  remark?: string;
  items?: ItemForm[];
  status?: PurchaseOrderStatus;
  currency?: string;
}

interface PurchaseOrderFormProps {
  form: FormInstance;
  initialValues?: Partial<PurchaseOrderFormData>;
  onSubmit: (values: PurchaseOrderFormData) => void | Promise<void>;
  loading?: boolean;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ form, initialValues, onSubmit }) => {
  const message = useMessage();
  const [totalAmount, setTotalAmount] = useState(0);
  const { options: unitOptions } = useUnitOptions({ isActive: true });
  const { options: warehouseOptions } = useWarehouseOptions({ isActive: true });

  const onValuesChange = (_: unknown, all: unknown) => {
    const values = all as FormValues;
    const list: ItemForm[] = Array.isArray(values.items) ? (values.items) : [];
    const total = list.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.price || 0), 0);
    setTotalAmount(Number(total.toFixed(2)));
  };

  const handleFinish = () => {
    const raw = form.getFieldsValue() as FormValues;
    const list: ItemForm[] = Array.isArray(raw.items) ? (raw.items) : [];
    if (list.length === 0) {
      message.error('请至少添加一个产品');
      return;
    }
    const invalid = list.filter((it) => !it?.productId || !Number(it?.quantity || 0));
    if (invalid.length > 0) {
      message.error('请完善产品信息');
      return;
    }
    const formatDate = (v: unknown): string => {
      if (typeof v === 'string' && v) return v;
      const maybe = v as { format?: (f: string) => string } | undefined;
      if (maybe && typeof maybe.format === 'function') return maybe.format('YYYY-MM-DD');
      return dayjs().format('YYYY-MM-DD');
    };
    const formData: PurchaseOrderFormData = {
      supplierId: String(raw.supplierId || ''),
      status: (raw.status as PurchaseOrderStatus) || PurchaseOrderStatus.DRAFT,
      currency: typeof raw.currency === 'string' && raw.currency ? raw.currency : 'CNY',
      orderDate: formatDate(raw.orderDate),
      expectedDeliveryDate: formatDate(raw.expectedDeliveryDate),
      remark: raw.remark,
      items: list.map((it) => ({
        productId: String(it.productId || ''),
        unitId: it.unitId ? String(it.unitId) : undefined,
        warehouseId: it.warehouseId ? String(it.warehouseId) : undefined,
        quantity: Number(it.quantity || 0),
        price: Number(it.price || 0),
      })),
    };
    void onSubmit(formData);
  };

  return (
    <ProForm<FormValues>
      form={form}
      params={{ initialValues }}
      request={async () => {
        await Promise.resolve(); // Satisfy await requirement
        const rawItems = initialValues?.items;
        const items: ItemForm[] = Array.isArray(rawItems) && rawItems.length > 0
          ? rawItems.map((it) => ({
              productId: String(it.productId || ''),
              unitId: it.unitId ? String(it.unitId) : undefined,
              warehouseId: it.warehouseId ? String(it.warehouseId) : undefined,
              quantity: Number(it.quantity || 1),
              price: typeof it.price === 'number' ? it.price : 0,
              specification: (it as unknown as { specification?: string }).specification,
            }))
          : [{}];

        const total = items.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.price || 0), 0);
        setTotalAmount(Number(total.toFixed(2)));

        return {
          orderDate: initialValues?.orderDate ? dayjs(initialValues.orderDate) : dayjs(),
          expectedDeliveryDate: initialValues?.expectedDeliveryDate ? dayjs(initialValues.expectedDeliveryDate) : dayjs().add(30, 'day'),
          supplierId: initialValues?.supplierId || '',
          status: initialValues?.status || PurchaseOrderStatus.DRAFT,
          currency: initialValues?.currency || 'CNY',
          remark: initialValues?.remark,
          items,
        };
      }}
      onFinish={handleFinish}
      onValuesChange={onValuesChange}
      layout="vertical"
      submitter={false}
    >
      <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <ProFormDatePicker name="orderDate" label="订单日期" rules={[{ required: true, message: '请选择订单日期' }]} />
          </Col>
          <Col span={8}>
            <ProFormDatePicker name="expectedDeliveryDate" label="预期交付日期" rules={[{ required: true, message: '请选择预期交付日期' }]} />
          </Col>
          <Col span={8}>
            <ProFormSelect
              name="supplierId"
              label="供应商"
              placeholder="请选择供应商"
              rules={[{ required: true, message: '请选择供应商' }]}
              showSearch
              request={async (params) => {
                const { keyWords } = params as { keyWords?: string };
                const res = await supplierService.getList({ page: 1, pageSize: 20, keyword: keyWords });
                return (res.data || []).map((s) => ({ label: s.name, value: s.id }));
              }}
            />
          </Col>
          
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <ProFormSelect
              name="status"
              label="状态"
              valueEnum={PURCHASE_ORDER_STATUS_VALUE_ENUM_PRO}
              allowClear={false}
              rules={[{ required: true, message: '请选择状态' }]}
            />
          </Col>
          <Col span={8}>
            <ProFormSelect
              name="currency"
              label="币种"
              options={GLOBAL_CURRENCY_OPTIONS}
              rules={[{ required: true, message: '请选择币种' }]}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 2, placeholder: '请输入备注信息' }} />
          </Col>
        </Row>
      </Card>

      <Card title="产品清单" size="small" style={{ marginBottom: 16 }}>
        <Row style={{ fontWeight: 600, marginBottom: 8 }}>
          <Col span={8}>产品</Col>
          <Col span={4}>单价</Col>
          <Col span={4}>数量</Col>
          <Col span={4}>单位</Col>
          <Col span={4}>仓库</Col>
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
                    name={["productId"]}
                    label={false}
                    showSearch
                    rules={[{ required: true, message: '请选择产品' }]}
                    request={async (params) => {
                      const { keyWords } = params as { keyWords?: string };
                      const res = await productService.getProductOptions({});
                      const list = res.data || [];
                      const filtered = keyWords ? list.filter((p) => (p.name || '').includes(keyWords) || (p.code || '').includes(keyWords)) : list;
                      return filtered.map((p) => ({ label: `${p.name}${p.code ? ` (${p.code})` : ''}`, value: p.id, data: p }));
                    }}
                    fieldProps={{
                      filterOption: (input, option) => {
                        const label = (option as DefaultOptionType)?.label;
                        const safeLabel = typeof label === 'string' ? label : '';
                        return safeLabel.toLowerCase().includes(input.toLowerCase());
                      },
                      allowClear: true,
                      onChange: (value, option) => {
                        void (async () => {
                          const all = form.getFieldsValue() as FormValues;
                          const list: ItemForm[] = Array.isArray(all.items) ? ([...(all.items)]) : [];
                          const idx = typeof f.name === 'number' ? f.name : Number(f.name);
                          const current = list[idx] || {};
                          let unitIdFromOption = '';
                          let warehouseIdFromOption = '';
                          let specificationFromOption = '';
                          const optData = (option as unknown as { data?: { unit?: { name: string; symbol: string }; specification?: string } })?.data;
                          if (optData) {
                            specificationFromOption = optData.specification || '';
                          }
                          
                          const valStr = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
                          
                          const detail = await productService.getProductById(valStr);
                          const d = detail.data as unknown as { unitId?: string; defaultWarehouseId?: string; specification?: string };
                          unitIdFromOption = String(d?.unitId || '');
                          warehouseIdFromOption = String(d?.defaultWarehouseId || '');
                          specificationFromOption = specificationFromOption || String(d?.specification || '');
                          list[idx] = { ...current, productId: valStr, unitId: unitIdFromOption || current.unitId, warehouseId: warehouseIdFromOption || current.warehouseId, specification: specificationFromOption || current.specification };
                          form.setFieldsValue({ items: list });
                        })();
                      },
                    }}
                  />
                </Col>
                <Col span={4}>
                  <ProFormDigit name={["price"]} label={false} min={0} fieldProps={{ precision: 2 }} rules={[{ required: true, message: '请输入单价' }]} />
                </Col>
                <Col span={4}>
                  <ProFormDigit name={["quantity"]} label={false} min={1} rules={[{ required: true, message: '请输入数量' }]} />
                </Col>
                <Col span={4}>
                  <ProFormSelect name={["unitId"]} label={false} options={unitOptions} showSearch />
                </Col>
                <Col span={4}>
                  <ProFormSelect name={["warehouseId"]} label={false} options={warehouseOptions} showSearch />
                </Col>
              </Row>
            </>
          )}
        </ProFormList>
        <Row justify="end">
          <Col>
            <span style={{ fontSize: 16, fontWeight: 'bold' }}>订单总金额：¥{totalAmount.toFixed(2)}</span>
          </Col>
        </Row>
      </Card>
    </ProForm>
  );
};

export default PurchaseOrderForm;
