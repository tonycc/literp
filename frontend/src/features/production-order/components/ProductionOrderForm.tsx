import React, { useState, useCallback, useEffect } from 'react';
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  Space,
  message,
  Modal,
  Table,
  Row,
  Col
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;

// 销售订单接口（扩展版本，包含更多信息）
interface SalesOrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  contactInfo: string;
  orderDate: string;
  deliveryDate: string;
  salesManager: string;
  productName: string;
  productCode: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPriceWithTax: number;
  totalPriceWithTax: number;
  status: string;
}

// 表单数据接口
export interface ProductionOrderFormData {
  orderNumber: string;
  salesOrderId?: string;
  customerName: string;
  productCode: string;
  productName: string;
  specification: string;
  unit: string;
  plannedQuantity: number;
  plannedStartDate: string;
  plannedEndDate: string;
  remark?: string;
}

interface ProductionOrderFormProps {
  form: FormInstance;
  onSubmit: (values: ProductionOrderFormData) => Promise<void>;
  initialValues?: Partial<ProductionOrderFormData>;
}

// 模拟销售订单数据（从销售订单管理中获取）
const mockSalesOrders: SalesOrderDetail[] = [
  {
    id: 'SO001',
    orderNumber: 'SO001',
    customerName: '北京科技有限公司',
    contactInfo: '张经理 13800138001',
    orderDate: '2024-01-15',
    deliveryDate: '2024-02-15',
    salesManager: '李明',
    productName: '智能传感器',
    productCode: 'P001',
    specification: 'HW-S100',
    unit: '个',
    quantity: 100,
    unitPriceWithTax: 500,
    totalPriceWithTax: 50000,
    status: 'confirmed'
  },
  {
    id: 'SO002',
    orderNumber: 'SO002',
    customerName: '上海制造有限公司',
    contactInfo: '王总监 13900139002',
    orderDate: '2024-01-14',
    deliveryDate: '2024-02-20',
    salesManager: '陈华',
    productName: '工业控制器',
    productCode: 'P002',
    specification: 'S7-1200',
    unit: '台',
    quantity: 50,
    unitPriceWithTax: 1200,
    totalPriceWithTax: 60000,
    status: 'confirmed'
  },
  {
    id: 'SO003',
    orderNumber: 'SO003',
    customerName: '深圳电子有限公司',
    contactInfo: '刘主管 13700137003',
    orderDate: '2024-01-13',
    deliveryDate: '2024-02-10',
    salesManager: '王强',
    productName: '电路板',
    productCode: 'P003',
    specification: 'PCB-A100',
    unit: '片',
    quantity: 200,
    unitPriceWithTax: 150,
    totalPriceWithTax: 30000,
    status: 'confirmed'
  },
  {
    id: 'SO004',
    orderNumber: 'SO004',
    customerName: '广州贸易有限公司',
    contactInfo: '陈总 13600136004',
    orderDate: '2024-01-16',
    deliveryDate: '2024-02-25',
    salesManager: '张伟',
    productName: '电机',
    productCode: 'P004',
    specification: 'M2BA-100',
    unit: '台',
    quantity: 30,
    unitPriceWithTax: 2000,
    totalPriceWithTax: 60000,
    status: 'confirmed'
  }
];

// 生成工单号
const generateOrderNumber = (): string => {
  const now = dayjs();
  const timestamp = now.format('YYYYMMDDHHmmss');
  return `PO${timestamp}`;
};

export const ProductionOrderForm: React.FC<ProductionOrderFormProps> = ({
  form,
  onSubmit,
  initialValues
}) => {
  const [salesOrderModalVisible, setSalesOrderModalVisible] = useState(false);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrderDetail | null>(null);
  const [salesOrdersData, setSalesOrdersData] = useState<SalesOrderDetail[]>([]);
  const [salesOrderLoading, setSalesOrderLoading] = useState(false);

  // 初始化表单
  useEffect(() => {
    form.setFieldsValue({
      orderNumber: generateOrderNumber(),
      plannedStartDate: dayjs(),
      plannedEndDate: dayjs().add(7, 'day'),
      ...initialValues
    });
  }, [form, initialValues]);

  // 加载销售订单数据
  const loadSalesOrders = useCallback(async () => {
    setSalesOrderLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      // 只显示已确认的销售订单
      const confirmedOrders = mockSalesOrders.filter(order => order.status === 'confirmed');
      setSalesOrdersData(confirmedOrders);
    } catch {
      message.error('加载销售订单失败');
    } finally {
      setSalesOrderLoading(false);
    }
  }, []);

  // 打开销售订单选择弹窗
  const handleSelectSalesOrder = () => {
    setSalesOrderModalVisible(true);
    loadSalesOrders();
  };

  // 选择销售订单
  const handleSalesOrderSelect = (salesOrder: SalesOrderDetail) => {
    setSelectedSalesOrder(salesOrder);
    
    // 自动填充表单字段
    form.setFieldsValue({
      salesOrderId: salesOrder.id,
      customerName: salesOrder.customerName,
      productCode: salesOrder.productCode,
      productName: salesOrder.productName,
      specification: salesOrder.specification,
      unit: salesOrder.unit,
      plannedQuantity: salesOrder.quantity,
      plannedEndDate: dayjs(salesOrder.deliveryDate)
    });

    setSalesOrderModalVisible(false);
    message.success('已关联销售订单');
  };

  // 清除销售订单关联
  const handleClearSalesOrder = () => {
    setSelectedSalesOrder(null);
    form.setFieldsValue({
      salesOrderId: undefined,
      customerName: '',
      productCode: '',
      productName: '',
      specification: '',
      unit: '',
      plannedQuantity: undefined
    });
    message.success('已清除销售订单关联');
  };

  // 表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: ProductionOrderFormData = {
        ...values,
        plannedStartDate: values.plannedStartDate?.format('YYYY-MM-DD') || '',
        plannedEndDate: values.plannedEndDate?.format('YYYY-MM-DD') || ''
      };
      await onSubmit(formData);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 销售订单表格列定义
  const salesOrderColumns: ColumnsType<SalesOrderDetail> = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150
    },
    {
      title: '产品信息',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <div>{record.productName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.productCode} | {record.specification}
          </div>
        </div>
      )
    },
    {
      title: '数量',
      key: 'quantity',
      width: 100,
      render: (_, record) => `${record.quantity} ${record.unit}`
    },
    {
      title: '交付日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleSalesOrderSelect(record)}
        >
          选择
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* 第一行：关联销售订单 */}
        <Row gutter={[16, 12]}>
          <Col span={12}>
            <Form.Item
              label="关联销售订单"
              name="salesOrderId"
              style={{ marginBottom: 12 }}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Input 
                  placeholder="选择销售订单"
                  value={selectedSalesOrder?.orderNumber || ''}
                  readOnly
                  style={{ flex: 1 }}
                />
                <Button 
                  icon={<SearchOutlined />}
                  onClick={handleSelectSalesOrder}
                >
                  选择
                </Button>
                {selectedSalesOrder && (
                  <Button onClick={handleClearSalesOrder}>
                    清除
                  </Button>
                )}
              </Space.Compact>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={16} lg={16} xl={8}>
            <Form.Item
              label="产品"
              name="productName"
              rules={[{ required: true, message: '请输入产品名称' }]}
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="请输入产品名称" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={8} lg={8} xl={4}>
            <Form.Item
              label="计划数量"
              name="plannedQuantity"
              rules={[{ required: true, message: '请输入计划数量' }]}
              style={{ marginBottom: 12 }}
            >
              <InputNumber
                placeholder="请输入计划数量"
                min={1}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
        {/* 第三行：计划时间 */}
        <Row gutter={[16, 12]}>
          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              label="计划开始时间"
              name="plannedStartDate"
              rules={[{ required: true, message: '请选择计划开始时间' }]}
              style={{ marginBottom: 12 }}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="选择开始日期"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            <Form.Item
              label="计划结束时间"
              name="plannedEndDate"
              rules={[{ required: true, message: '请选择计划结束时间' }]}
              style={{ marginBottom: 12 }}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="选择结束日期"
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* 第四行：所需物料表格 */}
        <Row gutter={[16, 12]}>
          <Col span={24}>
            <Form.Item
              label="所需物料"
              style={{ marginBottom: 12 }}
            >
              <Table
                columns={[
                  {
                    title: '物料编码',
                    dataIndex: 'materialCode',
                    key: 'materialCode',
                    width: 120,
                    align: 'center'
                  },
                  {
                    title: '物料名称',
                    dataIndex: 'materialName',
                    key: 'materialName',
                    width: 150
                  },
                  {
                    title: '需求数量',
                    dataIndex: 'requiredQuantity',
                    key: 'requiredQuantity',
                    width: 100,
                    align: 'right',
                    render: (value, record) => `${value.toLocaleString()} ${record.unit || '个'}`
                  },
                  {
                    title: '实际需求',
                    dataIndex: 'actualRequirement',
                    key: 'actualRequirement',
                    width: 100,
                    align: 'right',
                    render: (value, record) => `${value.toLocaleString()} ${record.unit || '个'}`
                  },
                  {
                    title: '损耗率',
                    dataIndex: 'lossRate',
                    key: 'lossRate',
                    width: 80,
                    align: 'center',
                    render: (value) => `${value}%`
                  }
                ]}
                dataSource={[
                  {
                    key: '1',
                    materialCode: 'PI004',
                    materialName: '电动开关',
                    requiredQuantity: 4000,
                    actualRequirement: 4000.00,
                    lossRate: 1.0,
                    unit: '个'
                  },
                  {
                    key: '2',
                    materialCode: 'PI001',
                    materialName: '开关外壳',
                    requiredQuantity: 2000,
                    actualRequirement: 2000.00,
                    lossRate: 1.0,
                    unit: '个'
                  },
                  {
                    key: '3',
                    materialCode: 'PI005',
                    materialName: '电线',
                    requiredQuantity: 6000,
                    actualRequirement: 6000.00,
                    lossRate: 1.0,
                    unit: '个'
                  }
                ]}
                pagination={false}
                size="small"
                bordered
                scroll={{ x: 'max-content' }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* 第五行：备注 */}
        <Row gutter={[16, 12]}>
          <Col span={24}>
            <Form.Item
              label="备注"
              name="remark"
              style={{ marginBottom: 12 }}
            >
              <TextArea
                placeholder="请输入备注信息（可选）"
                rows={3}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* 隐藏字段 */}
        <Form.Item name="orderNumber" style={{ display: 'none' }}>
          <Input />
        </Form.Item>
        <Form.Item name="priority" style={{ display: 'none' }}>
          <Input />
        </Form.Item>
        <Form.Item name="customerName" style={{ display: 'none' }}>
          <Input />
        </Form.Item>
        <Form.Item name="productCode" style={{ display: 'none' }}>
          <Input />
        </Form.Item>
        <Form.Item name="specification" style={{ display: 'none' }}>
          <Input />
        </Form.Item>
        <Form.Item name="unit" style={{ display: 'none' }}>
          <Input />
        </Form.Item>

        {/* 按钮区域 */}
        <Row gutter={[16, 12]}>
          <Col span={24}>
            <div style={{ 
              textAlign: 'center', 
              paddingTop: 20, 
              marginTop: 16,
              borderTop: '1px solid #f0f0f0' 
            }}>
              <Space size="large">
                <Button size="large" style={{ minWidth: 80 }}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" size="large" style={{ minWidth: 80 }}>
                  创建
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Form>

      {/* 销售订单选择弹窗 */}
      <Modal
        title="选择销售订单"
        open={salesOrderModalVisible}
        onCancel={() => setSalesOrderModalVisible(false)}
        footer={null}
        width={1000}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={loadSalesOrders}
              loading={salesOrderLoading}
            >
              刷新
            </Button>
          </Space>
        </div>
        <Table
          columns={salesOrderColumns}
          dataSource={salesOrdersData}
          rowKey="id"
          loading={salesOrderLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Modal>
    </div>
  );
};