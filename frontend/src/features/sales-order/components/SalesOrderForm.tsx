import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  message
} from 'antd';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';
import type { SalesOrderFormData } from '../types';
import { PaymentMethod, PAYMENT_METHOD_CONFIG } from '../types';

const { Option } = Select;
const { TextArea } = Input;

interface SalesOrderFormProps {
  form: FormInstance;
  onSubmit: (values: SalesOrderFormData) => Promise<void>;
  initialValues?: Partial<SalesOrderFormData>;
}

// 模拟数据
const mockCustomers = [
  { id: '1', name: '北京科技有限公司', contact: '张经理 13800138001' },
  { id: '2', name: '上海制造有限公司', contact: '王总监 13900139002' },
  { id: '3', name: '深圳电子有限公司', contact: '刘主管 13700137003' },
  { id: '4', name: '广州贸易有限公司', contact: '陈总 13600136004' }
];

const mockProducts = [
  { id: 'P001', name: '智能传感器', code: 'P001', specification: 'HW-S100', unit: '个' },
  { id: 'P002', name: '工业控制器', code: 'P002', specification: 'S7-1200', unit: '台' },
  { id: 'P003', name: '电路板', code: 'P003', specification: 'PCB-A100', unit: '片' },
  { id: 'P004', name: '电机', code: 'P004', specification: 'M2BA-100', unit: '台' }
];

const mockSalesManagers = [
  { id: '1', name: '李明' },
  { id: '2', name: '陈华' },
  { id: '3', name: '王强' },
  { id: '4', name: '张伟' }
];

export const SalesOrderForm: React.FC<SalesOrderFormProps> = ({
  form,
  onSubmit,
  initialValues
}) => {
  // 计算不含税单价和总价
  const calculatePrices = () => {
    const unitPriceWithTax = form.getFieldValue('unitPriceWithTax');
    const taxRate = form.getFieldValue('taxRate');
    const quantity = form.getFieldValue('quantity');

    if (unitPriceWithTax && taxRate !== undefined) {
      const unitPriceWithoutTax = unitPriceWithTax / (1 + taxRate / 100);
      form.setFieldsValue({
        unitPriceWithoutTax: Number(unitPriceWithoutTax.toFixed(2))
      });
    }

    if (unitPriceWithTax && quantity) {
      const totalPriceWithTax = unitPriceWithTax * quantity;
      form.setFieldsValue({
        totalPriceWithTax
      });
    }
  };

  // 产品选择处理
  const handleProductSelect = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      form.setFieldsValue({
        productName: product.name,
        productCode: product.code,
        specification: product.specification,
        unit: product.unit
      });
    }
  };

  // 客户选择处理
  const handleCustomerSelect = (customerId: string) => {
    const customer = mockCustomers.find(c => c.id === customerId);
    if (customer) {
      form.setFieldsValue({
        customerName: customer.name,
        contactInfo: customer.contact
      });
    }
  };

  // 表单提交处理
  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const formData: SalesOrderFormData = {
        customerName: values.customerName as string,
        contactInfo: values.contactInfo as string,
        orderDate: (values.orderDate as { format: (format: string) => string }).format('YYYY-MM-DD'),
        deliveryDate: (values.deliveryDate as { format: (format: string) => string }).format('YYYY-MM-DD'),
        salesManager: values.salesManager as string,
        productName: values.productName as string,
        productCode: values.productCode as string,
        customerProductCode: values.customerProductCode as string,
        specification: values.specification as string,
        unit: values.unit as string,
        quantity: values.quantity as number,
        unitPriceWithTax: values.unitPriceWithTax as number,
        taxRate: values.taxRate as number,
        paymentMethod: values.paymentMethod as PaymentMethod,
        plannedPaymentDate: (values.plannedPaymentDate as { format: (format: string) => string }).format('YYYY-MM-DD'),
        remark: values.remark as string
      };

      await onSubmit(formData);
    } catch {
      message.error('提交失败');
    }
  };

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        orderDate: initialValues.orderDate ? dayjs(initialValues.orderDate) : undefined,
        deliveryDate: initialValues.deliveryDate ? dayjs(initialValues.deliveryDate) : undefined,
        plannedPaymentDate: initialValues.plannedPaymentDate ? dayjs(initialValues.plannedPaymentDate) : undefined
      });
    }
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        taxRate: 13,
        orderDate: dayjs(),
        deliveryDate: dayjs().add(30, 'day'),
        plannedPaymentDate: dayjs().add(15, 'day')
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="客户选择"
            name="customerId"
            rules={[{ required: true, message: '请选择客户' }]}
          >
            <Select
              placeholder="请选择客户"
              onChange={handleCustomerSelect}
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {mockCustomers.map(customer => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="客户名称"
            name="customerName"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="请输入客户名称" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="联系人信息"
            name="contactInfo"
            rules={[{ required: true, message: '请输入联系人信息' }]}
          >
            <Input placeholder="请输入联系人信息" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="销售负责人"
            name="salesManager"
            rules={[{ required: true, message: '请选择销售负责人' }]}
          >
            <Select placeholder="请选择销售负责人">
              {mockSalesManagers.map(manager => (
                <Option key={manager.id} value={manager.name}>
                  {manager.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="订单签订日期"
            name="orderDate"
            rules={[{ required: true, message: '请选择订单签订日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="订单交付日期"
            name="deliveryDate"
            rules={[{ required: true, message: '请选择订单交付日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="产品选择"
            name="productId"
            rules={[{ required: true, message: '请选择产品' }]}
          >
            <Select
              placeholder="请选择产品"
              onChange={handleProductSelect}
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {mockProducts.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name} ({product.code})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="产品名称"
            name="productName"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="产品编码"
            name="productCode"
            rules={[{ required: true, message: '请输入产品编码' }]}
          >
            <Input placeholder="请输入产品编码" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="客户产品编码"
            name="customerProductCode"
          >
            <Input placeholder="请输入客户产品编码" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="规格型号"
            name="specification"
            rules={[{ required: true, message: '请输入规格型号' }]}
          >
            <Input placeholder="请输入规格型号" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="单位"
            name="unit"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input placeholder="请输入单位" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="销售数量"
            name="quantity"
            rules={[{ required: true, message: '请输入销售数量' }]}
          >
            <InputNumber
              placeholder="请输入销售数量"
              min={1}
              style={{ width: '100%' }}
              onChange={calculatePrices}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="销售单价-含税"
            name="unitPriceWithTax"
            rules={[{ required: true, message: '请输入销售单价' }]}
          >
            <InputNumber
              placeholder="请输入销售单价"
              min={0}
              precision={2}
              style={{ width: '100%' }}
              onChange={calculatePrices}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="税率(%)"
            name="taxRate"
            rules={[{ required: true, message: '请输入税率' }]}
          >
            <InputNumber
              placeholder="请输入税率"
              min={0}
              max={100}
              precision={2}
              style={{ width: '100%' }}
              onChange={calculatePrices}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="销售单价-不含税"
            name="unitPriceWithoutTax"
          >
            <InputNumber
              placeholder="自动计算"
              disabled
              precision={2}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="销售总价-含税"
            name="totalPriceWithTax"
          >
            <InputNumber
              placeholder="自动计算"
              disabled
              precision={2}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="收款方式"
            name="paymentMethod"
            rules={[{ required: true, message: '请选择收款方式' }]}
          >
            <Select placeholder="请选择收款方式">
              {Object.entries(PAYMENT_METHOD_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.text}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="计划收款日期"
            name="plannedPaymentDate"
            rules={[{ required: true, message: '请选择计划收款日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="备注"
            name="remark"
          >
            <TextArea
              placeholder="请输入备注信息"
              rows={3}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};