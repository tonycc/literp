import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Table,
  Space,
  Card,
  Row,
  Col,
  Divider,
  message,
  Popconfirm
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import type { PurchaseOrderFormData, PurchaseOrderItem } from '../types';

const { Option } = Select;
const { TextArea } = Input;

// 表单内部使用的接口，日期字段为 Dayjs 对象
interface FormValues {
  supplierId: string;
  orderDate: Dayjs;
  expectedDeliveryDate: Dayjs;
  remark?: string;
}

interface PurchaseOrderFormProps {
  form: FormInstance;
  onSubmit: (values: PurchaseOrderFormData) => void;
  loading?: boolean;
}

// 模拟供应商数据
const mockSuppliers = [
  { id: 'SUP001', name: '上海精密机械有限公司', code: 'SHJM001' },
  { id: 'SUP002', name: '北京液压设备厂', code: 'BJYY002' },
  { id: 'SUP003', name: '深圳电机制造有限公司', code: 'SZDJ003' },
  { id: 'SUP004', name: '天津传动设备公司', code: 'TJCD004' },
  { id: 'SUP005', name: '广州轴承制造厂', code: 'GZZC005' }
];

// 模拟产品数据
const mockProducts = [
  { value: 'FP001', label: '精密齿轮', code: 'FP001', specification: '模数2.5，齿数40，材质45#钢', unit: '件' },
  { value: 'FP002', label: '液压缸体', code: 'FP002', specification: '缸径100mm，行程200mm，工作压力16MPa', unit: '台' },
  { value: 'FP003', label: '电机外壳', code: 'FP003', specification: '铝合金材质，防护等级IP65，尺寸200×150×100mm', unit: '个' },
  { value: 'FP004', label: '传动轴', code: 'FP004', specification: '直径50mm，长度500mm，材质40Cr', unit: '根' },
  { value: 'FP005', label: '精密轴承', code: 'FP005', specification: '内径30mm，外径62mm，宽度16mm，精度P5', unit: '套' }
];

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  form,
  onSubmit
}) => {
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // 添加产品项
  const addItem = () => {
    const newItem: PurchaseOrderItem = {
      id: `temp_${Date.now()}`,
      productCode: '',
      productName: '',
      brand: '',
      specification: '',
      quantity: 1,
      unit: '',
      unitPrice: 0,
      subtotal: 0,
      batchNumber: ''
    };
    setItems([...items, newItem]);
  };

  // 删除产品项
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // 更新产品项
  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // 如果是产品选择，自动填充相关信息
    if (field === 'productCode') {
      const product = mockProducts.find(p => p.code === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productName: product.label,
          specification: product.specification,
          unit: product.unit
        };
      }
    }

    // 自动计算小计
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].subtotal = newItems[index].quantity * newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  // 计算总金额
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    setTotalAmount(total);
  }, [items]);

  // 处理表单提交
  const handleFinish = (values: FormValues) => {
    if (items.length === 0) {
      message.error('请至少添加一个产品');
      return;
    }

    // 验证所有产品项是否完整
    const invalidItems = items.filter(item => 
      !item.productCode || !item.quantity || !item.unitPrice || !item.batchNumber
    );

    if (invalidItems.length > 0) {
      message.error('请完善所有产品信息');
      return;
    }

    const formData: PurchaseOrderFormData = {
      supplierId: values.supplierId,
      items: items,
      orderDate: values.orderDate.format('YYYY-MM-DD'),
      expectedDeliveryDate: values.expectedDeliveryDate.format('YYYY-MM-DD'),
      remark: values.remark
    };

    onSubmit(formData);
  };

  // 产品表格列定义
  const columns: ColumnsType<PurchaseOrderItem> = [
    {
      title: '产品编码',
      dataIndex: 'productCode',
      width: 150,
      render: (value, record, index) => (
        <Select
          value={value}
          placeholder="选择产品"
          style={{ width: '100%' }}
          showSearch
          filterOption={(input, option) =>
            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
          }
          onChange={(val) => updateItem(index, 'productCode', val)}
        >
          {mockProducts.map(product => (
            <Option key={product.code} value={product.code}>
              {product.code} - {product.label}
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      width: 120,
      render: (value) => value || '-'
    },
    {
      title: '规格',
      dataIndex: 'specification',
      width: 200,
      ellipsis: true,
      render: (value) => value || '-'
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 100,
      render: (value, record, index) => (
        <InputNumber
          value={value}
          min={1}
          precision={0}
          style={{ width: '100%' }}
          onChange={(val) => updateItem(index, 'quantity', val || 1)}
        />
      )
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 60,
      render: (value) => value || '-'
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      width: 100,
      render: (value, record, index) => (
        <InputNumber
          value={value}
          min={0}
          precision={2}
          style={{ width: '100%' }}
          onChange={(val) => updateItem(index, 'unitPrice', val || 0)}
        />
      )
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      width: 100,
      render: (value) => `¥${value.toFixed(2)}`
    },
    {
      title: '操作',
      width: 80,
      render: (_, record, index) => (
        <Popconfirm
          title="确定删除这个产品吗？"
          onConfirm={() => removeItem(index)}
          okText="确定"
          cancelText="取消"
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      )
    }
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        orderDate: dayjs(),
        expectedDeliveryDate: dayjs().add(30, 'day')
      }}
    >
      <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="订单日期"
              name="orderDate"
              rules={[{ required: true, message: '请选择订单日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="预期交付日期"
              name="expectedDeliveryDate"
              rules={[{ required: true, message: '请选择预期交付日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="供应商"
              name="supplierId"
              rules={[{ required: true, message: '请选择供应商' }]}
            >
              <Select
                placeholder="请选择供应商"
                showSearch
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {mockSuppliers.map(supplier => (
                  <Option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item label="备注" name="remark">
              <TextArea rows={2} placeholder="请输入备注信息" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card 
        title="产品清单" 
        size="small"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addItem}
          >
            添加产品
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          pagination={false}
          scroll={{ x: '100%' }}
          locale={{ emptyText: '暂无产品，请点击"添加产品"按钮添加' }}
        />
        
        <Divider />
        
        <Row justify="end">
          <Col>
            <Space size="large">
              <span>产品总数：{items.length} 项</span>
              <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                订单总金额：¥{totalAmount.toFixed(2)}
              </span>
            </Space>
          </Col>
        </Row>
      </Card>
    </Form>
  );
};

export default PurchaseOrderForm;