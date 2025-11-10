import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  message,
  Space,
  Divider,
  Alert
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type {
  ProductionInboundFormData,
  ProductionOrderInfo,
  WarehouseInfo,
  LocationInfo,
  EmployeeInfo
} from '../types';

const { Option } = Select;
const { TextArea } = Input;

interface ProductionInboundFormProps {
  onSubmit: (data: ProductionInboundFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ProductionInboundForm: React.FC<ProductionInboundFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [selectedProductionOrder, setSelectedProductionOrder] = useState<ProductionOrderInfo | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [productionOrders, setProductionOrders] = useState<ProductionOrderInfo[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseInfo[]>([]);
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);

  // 模拟数据
  const mockProductionOrders: ProductionOrderInfo[] = [
    {
      id: 'PO001',
      orderNumber: 'PO202401001',
      productId: 'P001',
      productName: '智能手机',
      plannedQuantity: 100,
      completedQuantity: 100,
      status: 'completed'
    },
    {
      id: 'PO002',
      orderNumber: 'PO202401002',
      productId: 'P002',
      productName: '平板电脑',
      plannedQuantity: 50,
      completedQuantity: 50,
      status: 'completed'
    }
  ];

  const mockWarehouses: WarehouseInfo[] = [
    {
      id: 'W001',
      code: 'W001',
      name: '成品仓库',
      type: 'finished_goods',
      status: 'active'
    },
    {
      id: 'W002',
      code: 'W002',
      name: '半成品仓库',
      type: 'semi_finished',
      status: 'active'
    }
  ];

  const mockLocations: LocationInfo[] = [
    {
      id: 'L001',
      code: 'A01',
      name: 'A区-01',
      warehouseId: 'W001',
      status: 'active'
    },
    {
      id: 'L002',
      code: 'A02',
      name: 'A区-02',
      warehouseId: 'W001',
      status: 'active'
    },
    {
      id: 'L003',
      code: 'B01',
      name: 'B区-01',
      warehouseId: 'W002',
      status: 'active'
    }
  ];

  const mockEmployees: EmployeeInfo[] = [
    {
      id: 'E001',
      code: 'E001',
      name: '张三',
      department: '质检部',
      position: '质检员'
    },
    {
      id: 'E002',
      code: 'E002',
      name: '李四',
      department: '质检部',
      position: '质检员'
    },
    {
      id: 'E003',
      code: 'E003',
      name: '王五',
      department: '仓储部',
      position: '仓管员'
    }
  ];

  useEffect(() => {
    // 模拟获取数据
    setProductionOrders(mockProductionOrders);
    setWarehouses(mockWarehouses);
    setLocations(mockLocations);
    setEmployees(mockEmployees);

    // 设置默认值
    form.setFieldsValue({
      inboundDate: dayjs(),
      qualifiedQuantity: 0,
      defectiveQuantity: 0
    });
  }, [form]);

  // 生产订单选择变化
  const handleProductionOrderChange = (value: string) => {
    const order = productionOrders.find(o => o.id === value);
    setSelectedProductionOrder(order || null);
    
    if (order) {
      // 自动设置入库数量为完成数量
      form.setFieldsValue({
        inboundQuantity: order.completedQuantity,
        qualifiedQuantity: order.completedQuantity,
        defectiveQuantity: 0
      });
    }
  };

  // 仓库选择变化
  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value);
    // 清空库位选择
    form.setFieldsValue({ locationId: undefined });
  };

  // 入库数量变化
  const handleInboundQuantityChange = (value: number | null) => {
    if (value !== null) {
      const qualifiedQuantity = form.getFieldValue('qualifiedQuantity') || 0;
      const defectiveQuantity = value - qualifiedQuantity;
      form.setFieldsValue({ defectiveQuantity: Math.max(0, defectiveQuantity) });
    }
  };

  // 合格数量变化
  const handleQualifiedQuantityChange = (value: number | null) => {
    if (value !== null) {
      const inboundQuantity = form.getFieldValue('inboundQuantity') || 0;
      const defectiveQuantity = inboundQuantity - value;
      form.setFieldsValue({ defectiveQuantity: Math.max(0, defectiveQuantity) });
    }
  };

  // 不合格数量变化
  const handleDefectiveQuantityChange = (value: number | null) => {
    if (value !== null) {
      const inboundQuantity = form.getFieldValue('inboundQuantity') || 0;
      const qualifiedQuantity = inboundQuantity - value;
      form.setFieldsValue({ qualifiedQuantity: Math.max(0, qualifiedQuantity) });
    }
  };

  interface FormValues {
    productionOrderId: string;
    inboundQuantity: number;
    qualifiedQuantity: number;
    defectiveQuantity: number;
    batchNumber: string;
    warehouseId: string;
    locationId?: string;
    qualityInspectorId?: string;
    inboundDate: dayjs.Dayjs;
    remarks?: string;
  }

  // 表单提交
  const handleSubmit = async (values: FormValues) => {
    try {
      const formData: ProductionInboundFormData = {
        ...values,
        inboundDate: values.inboundDate.format('YYYY-MM-DD')
      };
      onSubmit(formData);
    } catch {
      message.error('提交失败，请检查表单数据');
    }
  };

  // 获取当前仓库的库位
  const getWarehouseLocations = () => {
    return locations.filter(location => location.warehouseId === selectedWarehouse);
  };

  return (
    <Card title="新增生产入库" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {/* 基本信息 */}
        <Divider orientation="left">基本信息</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="productionOrderId"
              label="生产订单"
              rules={[{ required: true, message: '请选择生产订单' }]}
            >
              <Select
                placeholder="请选择生产订单"
                onChange={handleProductionOrderChange}
                showSearch
                optionFilterProp="children"
              >
                {productionOrders.map(order => (
                  <Option key={order.id} value={order.id}>
                    {order.orderNumber} - {order.productName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="batchNumber"
              label="批次号"
              rules={[{ required: true, message: '请输入批次号' }]}
            >
              <Input placeholder="请输入批次号" />
            </Form.Item>
          </Col>
        </Row>

        {/* 显示选中的生产订单信息 */}
        {selectedProductionOrder && (
          <Alert
            message="生产订单信息"
            description={
              <div>
                <p><strong>订单号：</strong>{selectedProductionOrder.orderNumber}</p>
                <p><strong>产品：</strong>{selectedProductionOrder.productName}</p>
                <p><strong>计划数量：</strong>{selectedProductionOrder.plannedQuantity}</p>
                <p><strong>完成数量：</strong>{selectedProductionOrder.completedQuantity}</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 数量信息 */}
        <Divider orientation="left">数量信息</Divider>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="inboundQuantity"
              label="入库数量"
              rules={[
                { required: true, message: '请输入入库数量' },
                { type: 'number', min: 1, message: '入库数量必须大于0' }
              ]}
            >
              <InputNumber
                placeholder="请输入入库数量"
                style={{ width: '100%' }}
                min={1}
                onChange={handleInboundQuantityChange}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="qualifiedQuantity"
              label="合格数量"
              rules={[
                { required: true, message: '请输入合格数量' },
                { type: 'number', min: 0, message: '合格数量不能小于0' }
              ]}
            >
              <InputNumber
                placeholder="请输入合格数量"
                style={{ width: '100%' }}
                min={0}
                onChange={handleQualifiedQuantityChange}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="defectiveQuantity"
              label="不合格数量"
              rules={[
                { type: 'number', min: 0, message: '不合格数量不能小于0' }
              ]}
            >
              <InputNumber
                placeholder="请输入不合格数量"
                style={{ width: '100%' }}
                min={0}
                onChange={handleDefectiveQuantityChange}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* 仓储信息 */}
        <Divider orientation="left">仓储信息</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="warehouseId"
              label="仓库"
              rules={[{ required: true, message: '请选择仓库' }]}
            >
              <Select
                placeholder="请选择仓库"
                onChange={handleWarehouseChange}
              >
                {warehouses.map(warehouse => (
                  <Option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="locationId"
              label="库位"
            >
              <Select
                placeholder="请选择库位"
                disabled={!selectedWarehouse}
              >
                {getWarehouseLocations().map(location => (
                  <Option key={location.id} value={location.id}>
                    {location.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* 其他信息 */}
        <Divider orientation="left">其他信息</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="qualityInspectorId"
              label="质检员"
            >
              <Select
                placeholder="请选择质检员"
                allowClear
              >
                {employees
                  .filter(emp => emp.position === '质检员')
                  .map(employee => (
                    <Option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="inboundDate"
              label="入库日期"
              rules={[{ required: true, message: '请选择入库日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="remarks"
          label="备注"
        >
          <TextArea
            placeholder="请输入备注信息"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* 操作按钮 */}
        <Form.Item style={{ textAlign: 'center', marginTop: 24 }}>
          <Space size="middle">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              size="large"
            >
              保存
            </Button>
            <Button
              onClick={onCancel}
              icon={<CloseOutlined />}
              size="large"
            >
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProductionInboundForm;