import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  Button,
  Row,
  Col,
  message,
  Space,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import type {
  CreateCustomerPriceListData,
  UpdateCustomerPriceListData,
  CustomerOption,
  SalesManagerOption,
  ProductOption,
} from '../types';
import {
  PriceListStatus,
  VATRate,
  Unit,
} from '../types';

const { Option } = Select;

interface CustomerPriceListFormProps {
  form: FormInstance;
  initialValues?: UpdateCustomerPriceListData;
  onSubmit: (values: CreateCustomerPriceListData | UpdateCustomerPriceListData) => Promise<void>;
  loading?: boolean;
}

// 模拟数据
const mockCustomers: CustomerOption[] = [
  { value: 'C001', label: '华为技术有限公司' },
  { value: 'C002', label: '腾讯科技有限公司' },
  { value: 'C003', label: '阿里巴巴集团' },
  { value: 'C004', label: '百度在线网络技术有限公司' },
];

const mockSalesManagers: SalesManagerOption[] = [
  { value: '张三', label: '张三' },
  { value: '李四', label: '李四' },
  { value: '王五', label: '王五' },
  { value: '赵六', label: '赵六' },
];

const mockProducts: ProductOption[] = [
  { value: 'FP001', label: '机械零件A', code: 'FP001', specification: '精密加工，表面镀锌' },
  { value: 'FP002', label: '精密齿轮', code: 'FP002', specification: '高精度齿轮，模数2.5' },
  { value: 'FP003', label: '液压缸体', code: 'FP003', specification: '耐压25MPa，行程200mm' },
  { value: 'FP004', label: '电机外壳', code: 'FP004', specification: '铝合金材质，防护等级IP65' },
  { value: 'FP005', label: '传动轴', code: 'FP005', specification: '45#钢调质，表面硬度HRC45-50' },
  { value: 'FP006', label: '控制面板', code: 'FP006', specification: '7寸触摸屏，IP67防护' },
  { value: 'FP007', label: '减速器总成', code: 'FP007', specification: '减速比1:50，输出扭矩500Nm' },
  { value: 'FP008', label: '液压阀组', code: 'FP008', specification: '工作压力21MPa，流量60L/min' },
];

const CustomerPriceListForm: React.FC<CustomerPriceListFormProps> = ({
  form,
  initialValues,
  onSubmit,
  loading = false,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);

  // 状态选项
  const statusOptions = [
    { label: '生效', value: PriceListStatus.ACTIVE },
    { label: '失效', value: PriceListStatus.INACTIVE },
    { label: '待生效', value: PriceListStatus.PENDING },
    { label: '已过期', value: PriceListStatus.EXPIRED },
  ];

  // 增值税税率选项
  const vatRateOptions = [
    { label: '0%', value: VATRate.RATE_0 },
    { label: '3%', value: VATRate.RATE_3 },
    { label: '6%', value: VATRate.RATE_6 },
    { label: '9%', value: VATRate.RATE_9 },
    { label: '13%', value: VATRate.RATE_13 },
  ];

  // 单位选项
  const unitOptions = [
    { label: '件', value: Unit.PCS },
    { label: '套', value: Unit.SET },
    { label: '箱', value: Unit.BOX },
    { label: '千克', value: Unit.KG },
    { label: '克', value: Unit.G },
    { label: '米', value: Unit.M },
    { label: '厘米', value: Unit.CM },
    { label: '平方米', value: Unit.M2 },
    { label: '立方米', value: Unit.M3 },
    { label: '升', value: Unit.L },
    { label: '毫升', value: Unit.ML },
    { label: '对', value: Unit.PAIR },
    { label: '打', value: Unit.DOZEN },
  ];

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
      const vatRate = form.getFieldValue('vatRate') || VATRate.RATE_13;
      const { priceExcludingTax, taxAmount } = calculatePrices(value, vatRate);
      
      form.setFieldsValue({
        priceExcludingTax,
        taxAmount,
      });
    }
  };

  // 处理税率变化
  const handleVatRateChange = (value: VATRate) => {
    const priceIncludingTax = form.getFieldValue('priceIncludingTax');
    if (priceIncludingTax && priceIncludingTax > 0) {
      const { priceExcludingTax, taxAmount } = calculatePrices(priceIncludingTax, value);
      
      form.setFieldsValue({
        priceExcludingTax,
        taxAmount,
      });
    }
  };

  // 处理产品选择
  const handleProductChange = (value: string) => {
    const product = mockProducts.find(p => p.value === value);
    if (product) {
      // setSelectedProduct(product);
      form.setFieldsValue({
        productName: product.label,
        productCode: product.code,
        specification: product.specification,
      });
    }
  };

  // 处理图片上传
  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
    
    if (newFileList.length > 0 && newFileList[0].status === 'done') {
      // 这里应该设置实际的图片URL
      form.setFieldValue('productImage', newFileList[0].response?.url || '');
    }
  };

  // 自定义上传
  const customUpload = () => {
    // 模拟上传
    setTimeout(() => {
      message.success('图片上传成功');
    }, 1000);
    return false; // 阻止默认上传行为
  };

  // 表单提交
  const handleSubmit = async (values: CreateCustomerPriceListData | UpdateCustomerPriceListData) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  // 初始化表单值
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        effectiveDate: initialValues.effectiveDate ? dayjs(initialValues.effectiveDate) : undefined,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : undefined,
      });
    }
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="customerId"
            label="客户"
            rules={[
              { required: true, message: '请选择客户' },
            ]}
          >
            <Select
              placeholder="请选择客户"
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {mockCustomers.map(customer => (
                <Option key={customer.value} value={customer.value}>
                  {customer.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="产品选择"
          >
            <Select
              placeholder="请选择产品（可选）"
              allowClear
              onChange={handleProductChange}
            >
              {mockProducts.map(product => (
                <Option key={product.value} value={product.value}>
                  {product.label} ({product.code})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="productName"
            label="产品名称"
            rules={[
              { required: true, message: '请输入产品名称' },
              { max: 100, message: '产品名称不能超过100个字符' },
            ]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="productCode"
            label="产品编码"
            rules={[
              { required: true, message: '请输入产品编码' },
              { max: 50, message: '产品编码不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入产品编码" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="customerProductCode"
            label="客户产品编码"
            rules={[
              { max: 50, message: '客户产品编码不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入客户产品编码（可选）" />
          </Form.Item>
        </Col>

      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="specification"
            label="规格型号"
            rules={[
              { max: 100, message: '规格型号不能超过100个字符' },
            ]}
          >
            <Input placeholder="请输入规格型号（可选）" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="unit"
            label="单位"
            rules={[
              { required: true, message: '请选择单位' },
            ]}
          >
            <Select placeholder="请选择单位">
              {unitOptions.map(unit => (
                <Option key={unit.value} value={unit.value}>
                  {unit.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name="priceIncludingTax"
            label="销售单价(含税)"
            rules={[
              { required: true, message: '请输入销售单价(含税)' },
              { type: 'number', min: 0.01, message: '销售单价必须大于0' },
            ]}
          >
            <InputNumber
              placeholder="请输入销售单价(含税)"
              style={{ width: '100%' }}
              precision={2}
              min={0.01}
              addonAfter="元"
              onChange={handlePriceIncludingTaxChange}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="vatRate"
            label="增值税税率"
            rules={[
              { required: true, message: '请选择增值税税率' },
            ]}
          >
            <Select
              placeholder="请选择增值税税率"
              onChange={handleVatRateChange}
            >
              {vatRateOptions.map(rate => (
                <Option key={rate.value} value={rate.value}>
                  {rate.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="priceExcludingTax"
            label="销售单价(不含税)"
          >
            <InputNumber
              placeholder="自动计算"
              style={{ width: '100%' }}
              precision={2}
              disabled
              addonAfter="元"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name="taxAmount"
            label="税额"
          >
            <InputNumber
              placeholder="自动计算"
              style={{ width: '100%' }}
              precision={2}
              disabled
              addonAfter="元"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="effectiveDate"
            label="生效日期"
            rules={[
              { required: true, message: '请选择生效日期' },
            ]}
          >
            <DatePicker
              placeholder="请选择生效日期"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="expiryDate"
            label="失效日期"
          >
            <DatePicker
              placeholder="请选择失效日期（可选）"
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="status"
            label="状态"
            rules={[
              { required: true, message: '请选择状态' },
            ]}
          >
            <Select placeholder="请选择状态">
              {statusOptions.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="salesManager"
            label="销售负责人"
            rules={[
              { required: true, message: '请选择销售负责人' },
            ]}
          >
            <Select
              placeholder="请选择销售负责人"
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {mockSalesManagers.map(manager => (
                <Option key={manager.value} value={manager.value}>
                  {manager.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            name="productImage"
            label="产品图片"
          >
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={handleUploadChange}
              customRequest={customUpload}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>
                上传产品图片（可选）
              </Button>
            </Upload>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? '更新' : '创建'}
          </Button>
          <Button onClick={() => form.resetFields()}>
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CustomerPriceListForm;