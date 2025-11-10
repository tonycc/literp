import React, { useState, useCallback } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Table,
  Card,
  Row,
  Col,
  Typography,
  Tag
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { 
  SalesReturnFormData, 
  ReturnReason, 
  ReturnProduct, 
  OriginalSalesOrder 
} from '../types';
import { 
  ReturnReason as ReturnReasonEnum, 
  RETURN_REASON_CONFIG 
} from '../types';

const { Option } = Select;
const { TextArea } = Input;

interface SalesReturnFormProps {
  form: FormInstance;
  editData?: Partial<SalesReturnFormData>;
}

// 模拟原销售订单数据
const mockSalesOrders: OriginalSalesOrder[] = [
  {
    id: '1',
    salesNumber: 'SO202401001',
    customerId: 'C001',
    customerName: '北京科技有限公司',
    customerContact: '13800138001',
    salesDate: '2024-01-10',
    totalAmount: 75000,
    products: [
      {
        id: '1',
        productId: 'P001',
        productName: '笔记本电脑',
        productCode: 'NB001',
        specification: '15.6英寸 i7 16G 512G',
        unit: '台',
        quantity: 10,
        unitPrice: 7500,
        totalAmount: 75000
      }
    ]
  },
  {
    id: '2',
    salesNumber: 'SO202401002',
    customerId: 'C002',
    customerName: '上海贸易公司',
    customerContact: '13900139002',
    salesDate: '2024-01-12',
    totalAmount: 40000,
    products: [
      {
        id: '2',
        productId: 'P002',
        productName: '打印机',
        productCode: 'PR001',
        specification: '激光打印机 A4',
        unit: '台',
        quantity: 5,
        unitPrice: 8000,
        totalAmount: 40000
      }
    ]
  }
];

const SalesReturnForm: React.FC<SalesReturnFormProps> = ({ form, editData }) => {
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<OriginalSalesOrder | null>(null);
  const [returnProducts, setReturnProducts] = useState<Omit<ReturnProduct, 'id'>[]>([]);

  // 生成退货单号
  const generateReturnNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RT${year}${month}${day}${random}`;
  };

  // 处理销售订单选择
  const handleSalesOrderChange = useCallback((salesNumber: string) => {
    const salesOrder = mockSalesOrders.find(order => order.salesNumber === salesNumber);
    if (salesOrder) {
      setSelectedSalesOrder(salesOrder);
      
      // 自动填充客户信息
      form.setFieldsValue({
        customerId: salesOrder.customerId,
        customerName: salesOrder.customerName,
        customerContact: salesOrder.customerContact
      });

      // 初始化退货产品列表
      const initialProducts = salesOrder.products.map(product => ({
        productId: product.productId,
        productName: product.productName,
        productCode: product.productCode,
        specification: product.specification,
        unit: product.unit,
        originalQuantity: product.quantity,
        returnQuantity: 0,
        unitPrice: product.unitPrice,
        totalAmount: 0,
        reason: ReturnReasonEnum.OTHER,
        remark: ''
      }));
      
      setReturnProducts(initialProducts);
    } else {
      setSelectedSalesOrder(null);
      setReturnProducts([]);
      form.setFieldsValue({
        customerId: '',
        customerName: '',
        customerContact: ''
      });
    }
  }, [form]);

  // 处理退货数量变化
  const handleReturnQuantityChange = (index: number, quantity: number) => {
    const newProducts = [...returnProducts];
    newProducts[index] = {
      ...newProducts[index],
      returnQuantity: quantity,
      totalAmount: quantity * newProducts[index].unitPrice
    };
    setReturnProducts(newProducts);
  };

  // 处理退货原因变化
  const handleReasonChange = (index: number, reason: ReturnReason) => {
    const newProducts = [...returnProducts];
    newProducts[index] = {
      ...newProducts[index],
      reason
    };
    setReturnProducts(newProducts);
  };

  // 处理备注变化
  const handleRemarkChange = (index: number, remark: string) => {
    const newProducts = [...returnProducts];
    newProducts[index] = {
      ...newProducts[index],
      remark
    };
    setReturnProducts(newProducts);
  };

  // 删除退货产品
  const handleDeleteProduct = (index: number) => {
    const newProducts = returnProducts.filter((_, i) => i !== index);
    setReturnProducts(newProducts);
  };

  // 退货产品表格列定义
  const productColumns: ColumnsType<Omit<ReturnProduct, 'id'>> = [
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
      render: (text: string, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.productCode}
          </div>
        </div>
      )
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 150
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
      align: 'center'
    },
    {
      title: '原销售数量',
      dataIndex: 'originalQuantity',
      key: 'originalQuantity',
      width: 100,
      align: 'center',
      render: (quantity: number) => (
        <Typography.Text strong>{quantity}</Typography.Text>
      )
    },
    {
      title: '退货数量',
      dataIndex: 'returnQuantity',
      key: 'returnQuantity',
      width: 120,
      align: 'center',
      render: (quantity: number, record, index) => (
        <InputNumber
          min={0}
          max={record.originalQuantity}
          value={quantity}
          onChange={(value) => handleReturnQuantityChange(index, value || 0)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right',
      render: (price: number) => `¥${price.toLocaleString()}`
    },
    {
      title: '退货金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <Typography.Text strong style={{ color: '#f50' }}>
          ¥{amount.toLocaleString()}
        </Typography.Text>
      )
    },
    {
      title: '退货原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      render: (reason: ReturnReason, record, index) => (
        <Select
          value={reason}
          onChange={(value) => handleReasonChange(index, value)}
          style={{ width: '100%' }}
          size="small"
        >
          {Object.entries(RETURN_REASON_CONFIG).map(([value, config]) => (
            <Option key={value} value={value}>
              <Tag color={config.color} style={{ margin: 0 }}>
                {config.label}
              </Tag>
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      render: (remark: string, record, index) => (
        <Input
          value={remark}
          onChange={(e) => handleRemarkChange(index, e.target.value)}
          placeholder="备注"
          size="small"
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteProduct(index)}
          size="small"
        />
      )
    }
  ];

  // 初始化表单数据
  React.useEffect(() => {
    if (editData) {
      const formValues = {
        ...editData,
        returnDate: editData.returnDate ? dayjs(editData.returnDate) : dayjs()
      };
      form.setFieldsValue(formValues);
      if (editData.products) {
        setReturnProducts(editData.products);
      }
    } else {
      form.setFieldsValue({
        returnNumber: generateReturnNumber(),
        returnDate: dayjs()
      });
    }
  }, [editData, form]);

  // 获取表单数据（包含退货产品）
  const getFormData = (): SalesReturnFormData => {
    const formValues = form.getFieldsValue();
    return {
      ...formValues,
      returnDate: formValues.returnDate?.format('YYYY-MM-DD') || '',
      products: returnProducts
    };
  };

  // 暴露给父组件的方法
  const extendedForm = form as typeof form & { getFormData: () => SalesReturnFormData };
  extendedForm.getFormData = getFormData;

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          returnNumber: generateReturnNumber(),
          returnDate: dayjs(),
          reason: ReturnReasonEnum.OTHER
        }}
      >
        <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="退货单号"
                name="returnNumber"
                rules={[{ required: true, message: '请输入退货单号' }]}
              >
                <Input placeholder="自动生成" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="原销售单号"
                name="originalSalesNumber"
                rules={[{ required: true, message: '请选择原销售单号' }]}
              >
                <Select
                  placeholder="请选择原销售单号"
                  onChange={handleSalesOrderChange}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {mockSalesOrders.map(order => (
                    <Option key={order.id} value={order.salesNumber}>
                      {order.salesNumber} - {order.customerName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="退货日期"
                name="returnDate"
                rules={[{ required: true, message: '请选择退货日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="客户信息" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="客户ID"
                name="customerId"
              >
                <Input placeholder="自动填充" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="客户名称"
                name="customerName"
                rules={[{ required: true, message: '请输入客户名称' }]}
              >
                <Input placeholder="自动填充" disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="联系方式"
                name="customerContact"
              >
                <Input placeholder="自动填充" disabled />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="退货信息" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="主要退货原因"
                name="reason"
                rules={[{ required: true, message: '请选择退货原因' }]}
              >
                <Select placeholder="请选择退货原因">
                  {Object.entries(RETURN_REASON_CONFIG).map(([value, config]) => (
                    <Option key={value} value={value}>
                      <Tag color={config.color} style={{ margin: 0 }}>
                        {config.label}
                      </Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="退货说明"
                name="description"
              >
                <TextArea
                  placeholder="请输入退货说明"
                  rows={3}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 退货产品列表 */}
        {selectedSalesOrder && (
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>退货产品明细</span>
                <Typography.Text type="secondary">
                  原销售单：{selectedSalesOrder.salesNumber}
                </Typography.Text>
              </div>
            } 
            size="small" 
            style={{ marginBottom: 16 }}
          >
            <Table
              columns={productColumns}
              dataSource={returnProducts}
              rowKey="productId"
              pagination={false}
              scroll={{ x: 1200 }}
              size="small"
              summary={(pageData) => {
                const totalAmount = pageData.reduce((sum, record) => sum + record.totalAmount, 0);
                const totalQuantity = pageData.reduce((sum, record) => sum + record.returnQuantity, 0);
                
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <Typography.Text strong>合计</Typography.Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="center">
                      <Typography.Text strong>{totalQuantity}</Typography.Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <Typography.Text strong style={{ color: '#f50' }}>
                        ¥{totalAmount.toLocaleString()}
                      </Typography.Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} colSpan={3}></Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>
        )}

        <Card title="其他信息" size="small">
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
        </Card>
      </Form>
    </div>
  );
};

export default SalesReturnForm;