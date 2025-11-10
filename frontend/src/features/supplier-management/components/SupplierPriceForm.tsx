import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Upload,
  Row,
  Col,
  message,
  Tabs,
  Card,
  Space,
  Typography,
  Button
} from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  UserOutlined,
  PictureOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { SupplierPrice, SupplierPriceFormData } from '../types';

const { Option } = Select;

interface SupplierPriceFormProps {
  visible: boolean;
  editingPrice: SupplierPrice | null;
  onCancel: () => void;
  onSubmit: (values: SupplierPriceFormData) => Promise<void>;
}

const SupplierPriceForm: React.FC<SupplierPriceFormProps> = ({
  visible,
  editingPrice,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [taxExclusivePrice, setTaxExclusivePrice] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);

  // 计算不含税价格和税额
  const calculateTax = (taxInclusivePrice: number, vatRate: number) => {
    const taxExclusive = taxInclusivePrice / (1 + vatRate);
    const tax = taxInclusivePrice - taxExclusive;
    setTaxExclusivePrice(Number(taxExclusive.toFixed(2)));
    setTaxAmount(Number(tax.toFixed(2)));
  };

  // 监听含税价格和税率变化
  const handlePriceChange = () => {
    const taxInclusivePrice = form.getFieldValue('taxInclusivePrice') || 0;
    const vatRate = form.getFieldValue('vatRate') || 0;
    if (taxInclusivePrice > 0 && vatRate >= 0) {
      calculateTax(taxInclusivePrice, vatRate);
    }
  };

  // 表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 添加计算后的字段
      const formData: SupplierPriceFormData = {
        ...values,
        productImage: fileList.length > 0 ? fileList[0].url || fileList[0].response?.url : undefined
      };
      
      await onSubmit(formData);
      message.success(editingPrice ? '更新成功' : '创建成功');
      handleCancel();
    } catch (error) {
      console.error('表单提交失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 取消操作
  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setTaxExclusivePrice(0);
    setTaxAmount(0);
    onCancel();
  };

  // 文件上传处理
  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (editingPrice) {
        form.setFieldsValue({
          supplierId: editingPrice.supplierId,
          productName: editingPrice.productName,
          productCode: editingPrice.productCode,
          specification: editingPrice.specification,
          model: editingPrice.model,
          unit: editingPrice.unit,
          taxInclusivePrice: editingPrice.taxInclusivePrice,
          vatRate: editingPrice.vatRate,
          purchaseManager: editingPrice.purchaseManager
        });
        
        setTaxExclusivePrice(editingPrice.taxExclusivePrice);
        setTaxAmount(editingPrice.taxAmount);
        
        if (editingPrice.productImage) {
          setFileList([{
            uid: '-1',
            name: 'product-image',
            status: 'done',
            url: editingPrice.productImage
          }]);
        }
      } else {
        form.resetFields();
        setFileList([]);
        setTaxExclusivePrice(0);
        setTaxAmount(0);
      }
    }
  }, [visible, editingPrice, form]);

  const tabItems = [
    {
      key: 'product',
      label: (
        <Space>
          <ShoppingOutlined />
          产品信息
        </Space>
      ),
      children: (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Typography.Title level={5} style={{ marginBottom: 16 }}>
            <ShoppingOutlined style={{ marginRight: 8 }} />
            基本信息
          </Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="供应商"
                name="supplierId"
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select placeholder="请选择供应商">
                  <Option value="SUP001">华为技术有限公司</Option>
                  <Option value="SUP002">小米科技有限公司</Option>
                  <Option value="SUP003">苹果公司</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="产品名称"
                name="productName"
                rules={[
                  { required: true, message: '请输入产品名称' },
                  { max: 100, message: '产品名称长度不能超过100个字符' }
                ]}
              >
                <Input placeholder="请输入产品名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="产品编码"
                name="productCode"
                rules={[
                  { required: true, message: '请输入产品编码' },
                  { max: 50, message: '产品编码长度不能超过50个字符' }
                ]}
              >
                <Input placeholder="请输入产品编码" />
              </Form.Item>
            </Col>

          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="规格"
                name="specification"
                rules={[{ max: 100, message: '规格长度不能超过100个字符' }]}
              >
                <Input placeholder="请输入规格" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="型号"
                name="model"
                rules={[{ max: 50, message: '型号长度不能超过50个字符' }]}
              >
                <Input placeholder="请输入型号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="单位"
                name="unit"
                rules={[{ required: true, message: '请选择单位' }]}
              >
                <Select placeholder="请选择单位">
                  <Option value="台">台</Option>
                  <Option value="个">个</Option>
                  <Option value="套">套</Option>
                  <Option value="件">件</Option>
                  <Option value="箱">箱</Option>
                  <Option value="包">包</Option>
                  <Option value="米">米</Option>
                  <Option value="千克">千克</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="产品图片"
                name="productImage"
              >
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  {fileList.length === 0 && (
                    <div>
                      <PictureOutlined />
                      <div style={{ marginTop: 8 }}>上传图片</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'price',
      label: (
        <Space>
          <DollarOutlined />
          价格信息
        </Space>
      ),
      children: (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Typography.Title level={5} style={{ marginBottom: 16 }}>
            <DollarOutlined style={{ marginRight: 8 }} />
            价格设置
          </Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="含税单价"
                name="taxInclusivePrice"
                rules={[
                  { required: true, message: '请输入含税单价' },
                  { type: 'number', min: 0.01, message: '含税单价必须大于0' }
                ]}
              >
                <InputNumber
                  placeholder="请输入含税单价"
                  style={{ width: '100%' }}
                  precision={2}
                  min={0.01}
                  onChange={handlePriceChange}
                  addonBefore="¥"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="增值税税率"
                name="vatRate"
                rules={[
                  { required: true, message: '请选择增值税税率' },
                  { type: 'number', min: 0, max: 1, message: '税率必须在0-1之间' }
                ]}
              >
                <Select
                  placeholder="请选择税率"
                  onChange={handlePriceChange}
                >
                  <Option value={0}>0%</Option>
                  <Option value={0.03}>3%</Option>
                  <Option value={0.06}>6%</Option>
                  <Option value={0.09}>9%</Option>
                  <Option value={0.13}>13%</Option>
                  <Option value={0.16}>16%</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="不含税单价">
                <InputNumber
                  value={taxExclusivePrice}
                  disabled
                  style={{ width: '100%' }}
                  precision={2}
                  addonBefore="¥"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="税额">
                <InputNumber
                  value={taxAmount}
                  disabled
                  style={{ width: '100%' }}
                  precision={2}
                  addonBefore="¥"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'manager',
      label: (
        <Space>
          <UserOutlined />
          负责人信息
        </Space>
      ),
      children: (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Typography.Title level={5} style={{ marginBottom: 16 }}>
            <UserOutlined style={{ marginRight: 8 }} />
            负责人设置
          </Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="采购负责人"
                name="purchaseManager"
                rules={[
                  { required: true, message: '请选择采购负责人' },
                  { max: 50, message: '负责人姓名长度不能超过50个字符' }
                ]}
              >
                <Select placeholder="请选择采购负责人">
                  <Option value="张三">张三</Option>
                  <Option value="李四">李四</Option>
                  <Option value="王五">王五</Option>
                  <Option value="赵六">赵六</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined />
          {editingPrice ? '编辑价格信息' : '新增价格信息'}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={1000}
      centered
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {editingPrice ? '更新' : '创建'}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Tabs
          defaultActiveKey="product"
          items={tabItems}
          style={{ minHeight: 400 }}
        />
      </Form>
    </Modal>
  );
};

export default SupplierPriceForm;