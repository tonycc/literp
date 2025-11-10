import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import type { SalesReceiptFormData } from '../types';

const { Option } = Select;

interface SalesReceiptFormProps {
  form: FormInstance;
  onValuesChange?: (changedValues: Partial<SalesReceiptFormData>, allValues: SalesReceiptFormData) => void;
}

// 模拟数据
const mockSalesOrders = [
  { id: 'SO-2024-001', customerName: '北京科技有限公司', customerContact: '张经理' },
  { id: 'SO-2024-002', customerName: '上海贸易公司', customerContact: '李总' },
  { id: 'SO-2024-003', customerName: '深圳制造企业', customerContact: '王主管' },
  { id: 'SO-2024-004', customerName: '广州商贸集团', customerContact: '陈经理' },
];

const mockProducts = [
  {
    id: 'P001',
    name: '高精度传感器',
    code: 'SENSOR-001',
    specification: 'S7-1200',
    unit: '个',
    salesQuantity: 100,
    price: 1200.00
  },
  {
    id: 'P002',
    name: '工业控制器',
    code: 'CTRL-002',
    specification: 'TM221CE16R',
    unit: '台',
    salesQuantity: 50,
    price: 3500.00
  },
  {
    id: 'P003',
    name: '变频器',
    code: 'VFD-003',
    specification: 'ACS580-01-038A-4',
    unit: '台',
    salesQuantity: 30,
    price: 8500.00
  },
  {
    id: 'P004',
    name: '伺服电机',
    code: 'SERVO-004',
    specification: 'MSMD012G1U',
    unit: '台',
    salesQuantity: 25,
    price: 4200.00
  },
];

const SalesReceiptForm: React.FC<SalesReceiptFormProps> = ({ form, onValuesChange }) => {
  const [currentReceiptQuantity, setCurrentReceiptQuantity] = useState<number>(0);
  const [totalReceiptQuantity, setTotalReceiptQuantity] = useState<number>(0);

  // 处理销售订单选择
  const handleSalesOrderChange = (value: string) => {
    const order = mockSalesOrders.find(o => o.id === value);
    if (order) {
      form.setFieldsValue({
        customerName: order.customerName,
        customerContact: order.customerContact,
      });
    }
  };

  // 处理产品选择
  const handleProductChange = (value: string) => {
    const product = mockProducts.find(p => p.id === value);
    if (product) {
      form.setFieldsValue({
        productName: product.name,
        productCode: product.code,
        specification: product.specification,
        unit: product.unit,
        salesQuantity: product.salesQuantity,
        totalPrice: product.price * product.salesQuantity,
      });
    }
  };

  // 处理本次出库数量变化
  const handleCurrentReceiptQuantityChange = (value: number | null) => {
    const quantity = value || 0;
    setCurrentReceiptQuantity(quantity);
    
    // 计算出库产品总数（假设之前已出库的数量）
    const previousQuantity = totalReceiptQuantity - currentReceiptQuantity;
    const newTotal = previousQuantity + quantity;
    setTotalReceiptQuantity(newTotal);
    
    form.setFieldsValue({
      totalReceiptQuantity: newTotal,
    });
  };

  // 处理表单值变化
  const handleValuesChange = (changedValues: Partial<SalesReceiptFormData>, allValues: SalesReceiptFormData) => {
    if (onValuesChange) {
      onValuesChange(changedValues, allValues);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
      initialValues={{
        receiptDate: undefined,
        receiptStatus: 'pending',
        currentReceiptQuantity: 0,
        totalReceiptQuantity: 0,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="receiptNumber"
            label="出库单编号"
            rules={[{ required: true, message: '请输入出库单编号' }]}
          >
            <Input placeholder="请输入出库单编号" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="salesOrderNumber"
            label="销售订单编号"
            rules={[{ required: true, message: '请选择销售订单编号' }]}
          >
            <Select
              placeholder="请选择销售订单编号"
              onChange={handleSalesOrderChange}
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {mockSalesOrders.map(order => (
                <Option key={order.id} value={order.id}>
                  {order.id}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="customerName"
            label="客户名称"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="请输入客户名称" disabled />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="customerContact"
            label="客户联系人"
            rules={[{ required: true, message: '请输入客户联系人' }]}
          >
            <Input placeholder="请输入客户联系人" disabled />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="productId"
            label="产品选择"
            rules={[{ required: true, message: '请选择产品' }]}
          >
            <Select
              placeholder="请选择产品"
              onChange={handleProductChange}
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
        <Col span={8}>
          <Form.Item
            name="productName"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" disabled />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="productCode"
            label="产品编码"
            rules={[{ required: true, message: '请输入产品编码' }]}
          >
            <Input placeholder="请输入产品编码" disabled />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="specification"
            label="规格型号"
            rules={[{ required: true, message: '请输入规格型号' }]}
          >
            <Input placeholder="请输入规格型号" disabled />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input placeholder="请输入单位" disabled />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="salesQuantity"
            label="销售数量"
            rules={[{ required: true, message: '请输入销售数量' }]}
          >
            <InputNumber
              placeholder="请输入销售数量"
              min={0}
              style={{ width: '100%' }}
              disabled
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="currentReceiptQuantity"
            label="本次出库数量"
            rules={[
              { required: true, message: '请输入本次出库数量' },
              { type: 'number', min: 1, message: '本次出库数量必须大于0' }
            ]}
          >
            <InputNumber
              placeholder="请输入本次出库数量"
              min={0}
              style={{ width: '100%' }}
              onChange={handleCurrentReceiptQuantityChange}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="totalReceiptQuantity"
            label="出库产品总数"
            rules={[{ required: true, message: '请输入出库产品总数' }]}
          >
            <InputNumber
              placeholder="出库产品总数"
              min={0}
              style={{ width: '100%' }}
              disabled
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="totalPrice"
            label="产品合计售价"
            rules={[{ required: true, message: '请输入产品合计售价' }]}
          >
            <InputNumber
              placeholder="请输入产品合计售价"
              min={0}
              precision={2}
              style={{ width: '100%' }}
              addonBefore="¥"
              disabled
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="receiptStatus"
            label="收货状态"
            rules={[{ required: true, message: '请选择收货状态' }]}
          >
            <Select placeholder="请选择收货状态">
              <Option value="pending">待收货</Option>
              <Option value="partial">部分收货</Option>
              <Option value="completed">已收货</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="receiptDate"
            label="收货确认时间"
          >
            <DatePicker
              placeholder="请选择收货确认时间"
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default SalesReceiptForm;