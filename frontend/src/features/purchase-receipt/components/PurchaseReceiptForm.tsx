import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Row,
  Col,
  message
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import type { PurchaseReceiptFormData } from '../types';

const { Option } = Select;
const { TextArea } = Input;

// 表单值接口
interface FormValues {
  purchaseOrderNumber: string;
  productName: string;
  productCode: string;
  specification: string;
  batchNumber: string;
  purchaseQuantity: number;
  arrivedQuantity: number;
  receivedQuantity: number;
  unit: string;
  orderDate: Dayjs;
  deliveryDate: Dayjs;
  receivedBy: string;
  remark?: string;
}

interface PurchaseReceiptFormProps {
  onSubmit: (values: PurchaseReceiptFormData) => void;
  initialValues?: Partial<PurchaseReceiptFormData>;
}

// 模拟采购订单数据
const mockPurchaseOrders = [
  { 
    orderNumber: 'PO202401001', 
    productName: '精密齿轮',
    productCode: 'FP002',
    specification: '模数2.5，齿数40，材质45#钢',
    unit: '件',
    orderDate: '2024-01-15',
    deliveryDate: '2024-02-15'
  },
  { 
    orderNumber: 'PO202401002', 
    productName: '液压缸体',
    productCode: 'FP003',
    specification: '缸径100mm，行程200mm，工作压力16MPa',
    unit: '台',
    orderDate: '2024-01-16',
    deliveryDate: '2024-02-20'
  },
  { 
    orderNumber: 'PO202401003', 
    productName: '电机外壳',
    productCode: 'FP004',
    specification: '铝合金材质，防护等级IP65，尺寸200×150×100mm',
    unit: '个',
    orderDate: '2024-01-18',
    deliveryDate: '2024-02-25'
  }
];

// 模拟员工数据
const mockEmployees = [
  { id: 'EMP001', name: '张三' },
  { id: 'EMP002', name: '李四' },
  { id: 'EMP003', name: '王五' },
  { id: 'EMP004', name: '赵六' },
  { id: 'EMP005', name: '孙七' }
];

const PurchaseReceiptForm: React.FC<PurchaseReceiptFormProps> = ({
  onSubmit,
  initialValues
}) => {
  const [form] = Form.useForm<FormValues>();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // 处理采购订单选择
  const handleOrderSelect = (orderNumber: string) => {
    const order = mockPurchaseOrders.find(o => o.orderNumber === orderNumber);
    if (order) {
      setSelectedOrder(order);
      form.setFieldsValue({
        productName: order.productName,
        productCode: order.productCode,
        specification: order.specification,
        unit: order.unit,
        orderDate: dayjs(order.orderDate),
        deliveryDate: dayjs(order.deliveryDate)
      });
    }
  };

  // 表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const formData: PurchaseReceiptFormData = {
        purchaseOrderNumber: values.purchaseOrderNumber,
        productName: values.productName,
        productCode: values.productCode,
        specification: values.specification,
        batchNumber: values.batchNumber,
        purchaseQuantity: values.purchaseQuantity,
        arrivedQuantity: values.arrivedQuantity,
        receivedQuantity: values.receivedQuantity,
        unit: values.unit,
        orderDate: values.orderDate.format('YYYY-MM-DD'),
        deliveryDate: values.deliveryDate.format('YYYY-MM-DD'),
        receivedBy: values.receivedBy,
        remark: values.remark
      };

      onSubmit(formData);
    } catch (error) {
      message.error('请检查表单填写是否正确');
    }
  };

  // 初始化表单
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        orderDate: initialValues.orderDate ? dayjs(initialValues.orderDate) : undefined,
        deliveryDate: initialValues.deliveryDate ? dayjs(initialValues.deliveryDate) : undefined
      });
    }
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        purchaseQuantity: 0,
        arrivedQuantity: 0,
        receivedQuantity: 0
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="采购订单编号"
            name="purchaseOrderNumber"
            rules={[{ required: true, message: '请选择采购订单编号' }]}
          >
            <Select
              placeholder="请选择采购订单编号"
              onChange={handleOrderSelect}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {mockPurchaseOrders.map(order => (
                <Option key={order.orderNumber} value={order.orderNumber}>
                  {order.orderNumber}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
         <Col span={12}>
          <Form.Item
            label="订单签订日期"
            name="orderDate"
            rules={[{ required: true, message: '请选择订单签订日期' }]}
          >
            <DatePicker
              placeholder="请选择订单签订日期"
              style={{ width: '100%' }}
              disabled={!!selectedOrder}
            />
          </Form.Item>
        </Col>
      
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="产品名称"
            name="productName"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" disabled={!!selectedOrder} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="产品编码"
            name="productCode"
            rules={[{ required: true, message: '请输入产品编码' }]}
          >
            <Input placeholder="请输入产品编码" disabled={!!selectedOrder} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            label="规格型号"
            name="specification"
            rules={[{ required: true, message: '请输入规格型号' }]}
          >
            <Input placeholder="请输入规格型号" disabled={!!selectedOrder} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            label="采购数量"
            name="purchaseQuantity"
            rules={[
              { required: true, message: '请输入采购数量' },
              { type: 'number', min: 0, message: '采购数量不能小于0' }
            ]}
          >
            <InputNumber
              placeholder="请输入采购数量"
              style={{ width: '100%' }}
              min={0}
              precision={0}
            />
          </Form.Item>
        </Col>
       
        <Col span={6}>
          <Form.Item
            label="已入库数量"
            name="receivedQuantity"
            rules={[
              { required: true, message: '请输入已入库数量' },
              { type: 'number', min: 0, message: '已入库数量不能小于0' }
            ]}
          >
            <InputNumber
              placeholder="请输入已入库数量"
              style={{ width: '100%' }}
              min={0}
              precision={0}
            />
          </Form.Item>
        </Col>
         <Col span={6}>
          <Form.Item
            label="到货数量"
            name="arrivedQuantity"
            rules={[
              { required: true, message: '请输入到货数量' },
              { type: 'number', min: 0, message: '到货数量不能小于0' }
            ]}
          >
            <InputNumber
              placeholder="请输入到货数量"
              style={{ width: '100%' }}
              min={0}
              precision={0}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="单位"
            name="unit"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Input placeholder="请输入单位" disabled={!!selectedOrder} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="入库员"
            name="receivedBy"
            rules={[{ required: true, message: '请选择入库员' }]}
          >
            <Select placeholder="请选择入库员">
              {mockEmployees.map(emp => (
                <Option key={emp.id} value={emp.name}>
                  {emp.name}
                </Option>
              ))}
            </Select>
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
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Col>
      </Row>

      <Row justify="end">
        <Col>
          <Space>
            <Button onClick={() => form.resetFields()}>
              重置
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              提交
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
};

export default PurchaseReceiptForm;