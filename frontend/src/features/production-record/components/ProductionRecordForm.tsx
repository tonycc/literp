import React from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Row,
  Col
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import dayjs from 'dayjs';
import type { ProductionRecordStatus } from '../types';
import { PRODUCTION_RECORD_STATUS_CONFIG } from '../types';

const { Option } = Select;
const { TextArea } = Input;

export interface ProductionRecordFormData {
  recordNumber: string;
  batchNumber: string;
  productionOrderNumber: string;
  productName: string;
  materialId: string;
  materialQuantity: number;
  productionQuantity: number;
  materialEmployeeId: string;
  productionEmployeeId: string;
  materialTime: string;
  completionTime?: string;
  status: ProductionRecordStatus;
  remark?: string;
}

interface ProductionRecordFormProps {
  form: FormInstance;
  onSubmit: (values: ProductionRecordFormData) => Promise<void>;
  initialValues?: Partial<ProductionRecordFormData>;
}

const ProductionRecordForm: React.FC<ProductionRecordFormProps> = ({
  form,
  onSubmit,
  initialValues
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: Omit<ProductionRecordFormData, 'materialTime' | 'completionTime'> & {
    materialTime: dayjs.Dayjs;
    completionTime?: dayjs.Dayjs;
  }) => {
    setLoading(true);
    try {
      const formData: ProductionRecordFormData = {
        ...values,
        materialTime: values.materialTime.format('YYYY-MM-DD HH:mm:ss'),
        completionTime: values.completionTime?.format('YYYY-MM-DD HH:mm:ss')
      };
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  // 模拟数据选项
  const materialOptions = [
    { id: 'M001', name: '钢材', code: 'M001', specification: 'Q235B', unit: 'kg' },
    { id: 'M002', name: '电路板', code: 'M002', specification: 'PCB-100', unit: '片' },
    { id: 'M003', name: '合金钢', code: 'M003', specification: '40Cr', unit: 'kg' },
    { id: 'M004', name: '铝合金', code: 'M004', specification: '6061-T6', unit: 'kg' },
    { id: 'M005', name: '传感器芯片', code: 'M005', specification: 'ST-100', unit: '个' }
  ];

  const employeeOptions = [
    { id: 'E001', name: '张三', employeeNumber: 'EMP001', department: '仓储部' },
    { id: 'E002', name: '李四', employeeNumber: 'EMP002', department: '生产部' },
    { id: 'E003', name: '王五', employeeNumber: 'EMP003', department: '仓储部' },
    { id: 'E004', name: '赵六', employeeNumber: 'EMP004', department: '生产部' },
    { id: 'E005', name: '孙七', employeeNumber: 'EMP005', department: '生产部' },
    { id: 'E006', name: '周八', employeeNumber: 'EMP006', department: '生产部' },
    { id: 'E007', name: '吴九', employeeNumber: 'EMP007', department: '仓储部' },
    { id: 'E008', name: '郑十', employeeNumber: 'EMP008', department: '生产部' }
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues ? {
        ...initialValues,
        materialTime: initialValues.materialTime ? dayjs(initialValues.materialTime) : undefined,
        completionTime: initialValues.completionTime ? dayjs(initialValues.completionTime) : undefined
      } : undefined}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="recordNumber"
            label="生产记录编号"
            rules={[{ required: true, message: '请输入生产记录编号' }]}
          >
            <Input placeholder="请输入生产记录编号" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="batchNumber"
            label="产品批次号"
            rules={[{ required: true, message: '请输入产品批次号' }]}
          >
            <Input placeholder="请输入产品批次号" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="productionOrderNumber"
            label="生产工单编号"
            rules={[{ required: true, message: '请输入生产工单编号' }]}
          >
            <Input placeholder="请输入生产工单编号" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="productName"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="materialId"
            label="领取物料"
            rules={[{ required: true, message: '请选择领取物料' }]}
          >
            <Select placeholder="请选择领取物料">
              {materialOptions.map(material => (
                <Option key={material.id} value={material.id}>
                  {material.name} ({material.code}) - {material.specification}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="materialQuantity"
            label="领取数量"
            rules={[{ required: true, message: '请输入领取数量' }]}
          >
            <InputNumber
              placeholder="请输入领取数量"
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="productionQuantity"
            label="生产数量"
            rules={[{ required: true, message: '请输入生产数量' }]}
          >
            <InputNumber
              placeholder="请输入生产数量"
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              {Object.entries(PRODUCTION_RECORD_STATUS_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>{config.text}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="materialEmployeeId"
            label="领料员工"
            rules={[{ required: true, message: '请选择领料员工' }]}
          >
            <Select placeholder="请选择领料员工">
              {employeeOptions.filter(emp => emp.department === '仓储部').map(employee => (
                <Option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.employeeNumber}) - {employee.department}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="productionEmployeeId"
            label="生产员工"
            rules={[{ required: true, message: '请选择生产员工' }]}
          >
            <Select placeholder="请选择生产员工">
              {employeeOptions.filter(emp => emp.department === '生产部').map(employee => (
                <Option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.employeeNumber}) - {employee.department}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="materialTime"
            label="领料时间"
            rules={[{ required: true, message: '请选择领料时间' }]}
          >
            <DatePicker
              showTime
              placeholder="请选择领料时间"
              style={{ width: '100%' }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="completionTime"
            label="完工时间"
          >
            <DatePicker
              showTime
              placeholder="请选择完工时间"
              style={{ width: '100%' }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="remark"
        label="备注"
      >
        <TextArea
          placeholder="请输入备注信息"
          rows={3}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            确定
          </Button>
          <Button onClick={() => form.resetFields()}>
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProductionRecordForm;