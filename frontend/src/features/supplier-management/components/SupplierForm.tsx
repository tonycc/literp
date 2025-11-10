import React from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  message,
  Tabs,
  Card,
  Space,
  Typography
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  BankOutlined,
  ShopOutlined
} from '@ant-design/icons';
import type { Supplier, SupplierFormData } from '../types';
import { SupplierStatus, SupplierType, SupplierLevel } from '../types';

const { Option } = Select;
const { TextArea } = Input;

interface SupplierFormProps {
  visible: boolean;
  editingSupplier: Supplier | null;
  onCancel: () => void;
  onSubmit: (values: SupplierFormData) => Promise<void>;
}

const SupplierForm: React.FC<SupplierFormProps> = ({
  visible,
  editingSupplier,
  onCancel,
  onSubmit
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  // 当编辑供应商变化时，更新表单值
  React.useEffect(() => {
    if (visible) {
      if (editingSupplier) {
        form.setFieldsValue(editingSupplier);
      } else {
        form.resetFields();
        // 设置新增供应商的默认值
        form.setFieldsValue({
          type: SupplierType.MANUFACTURER,
          level: SupplierLevel.C,
          status: SupplierStatus.ACTIVE,
          country: '中国'
        });
      }
    }
  }, [visible, editingSupplier, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSubmit(values);
      form.resetFields();
      message.success(editingSupplier ? '更新成功' : '创建成功');
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const tabItems = [
    {
      key: 'basic',
      label: (
        <Space>
          <UserOutlined />
          基本信息
        </Space>
      ),
      children: (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="供应商编码"
                rules={[
                  { required: true, message: '请输入供应商编码' },
                  { pattern: /^[A-Z0-9]+$/, message: '编码只能包含大写字母和数字' }
                ]}
              >
                <Input placeholder="如：SUP001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="供应商名称"
                rules={[
                  { required: true, message: '请输入供应商名称' },
                  { max: 100, message: '名称长度不能超过100个字符' }
                ]}
              >
                <Input placeholder="请输入供应商全称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="shortName"
                label="简称"
                rules={[{ max: 50, message: '简称长度不能超过50个字符' }]}
              >
                <Input placeholder="请输入供应商简称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="供应商类型"
                rules={[{ required: true, message: '请选择供应商类型' }]}
              >
                <Select placeholder="请选择供应商类型">
                  <Option value={SupplierType.MANUFACTURER}>制造商</Option>
                  <Option value={SupplierType.DISTRIBUTOR}>分销商</Option>
                  <Option value={SupplierType.SERVICE_PROVIDER}>服务商</Option>
                  <Option value={SupplierType.TRADING_COMPANY}>贸易公司</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="level"
                label="供应商等级"
                rules={[{ required: true, message: '请选择供应商等级' }]}
              >
                <Select placeholder="请选择供应商等级">
                  <Option value={SupplierLevel.A}>A级</Option>
                  <Option value={SupplierLevel.B}>B级</Option>
                  <Option value={SupplierLevel.C}>C级</Option>
                  <Option value={SupplierLevel.D}>D级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value={SupplierStatus.ACTIVE}>启用</Option>
                  <Option value={SupplierStatus.INACTIVE}>停用</Option>
                  <Option value={SupplierStatus.SUSPENDED}>暂停</Option>
                  <Option value={SupplierStatus.BLACKLISTED}>黑名单</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'contact',
      label: (
        <Space>
          <PhoneOutlined />
          联系与地址信息
        </Space>
      ),
      children: (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Typography.Title level={5} style={{ marginBottom: 16 }}>
            <PhoneOutlined style={{ marginRight: 8 }} />
            联系方式
          </Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contactPerson"
                label="联系人"
                rules={[
                  { required: true, message: '请输入联系人' },
                  { max: 50, message: '联系人长度不能超过50个字符' }
                ]}
              >
                <Input placeholder="请输入联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactPhone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
                ]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contactEmail"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入正确的邮箱格式' }
                ]}
              >
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="website"
                label="网站"
                rules={[{ type: 'url', message: '请输入正确的网址格式' }]}
              >
                <Input placeholder="请输入网站地址" />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5} style={{ marginBottom: 16, marginTop: 24 }}>
            <HomeOutlined style={{ marginRight: 8 }} />
            地址信息
          </Typography.Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="country"
                label="国家"
                rules={[{ required: true, message: '请输入国家' }]}
              >
                <Input placeholder="请输入国家" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="province"
                label="省份"
                rules={[{ required: true, message: '请输入省份' }]}
              >
                <Input placeholder="请输入省份" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="city"
                label="城市"
                rules={[{ required: true, message: '请输入城市' }]}
              >
                <Input placeholder="请输入城市" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={18}>
              <Form.Item
                name="address"
                label="详细地址"
                rules={[
                  { required: true, message: '请输入详细地址' },
                  { max: 200, message: '地址长度不能超过200个字符' }
                ]}
              >
                <Input placeholder="请输入详细地址" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="postalCode"
                label="邮政编码"
                rules={[{ pattern: /^\d{6}$/, message: '请输入正确的邮政编码' }]}
              >
                <Input placeholder="请输入邮政编码" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'financial',
      label: (
        <Space>
          <BankOutlined />
          财务信息
        </Space>
      ),
      children: (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="taxNumber"
                label="税号"
                rules={[{ max: 50, message: '税号长度不能超过50个字符' }]}
              >
                <Input placeholder="请输入税号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="creditLimit"
                label="信用额度"
                rules={[{ type: 'number', min: 0, message: '信用额度不能为负数' }]}
              >
                <InputNumber
                  placeholder="请输入信用额度"
                  style={{ width: '100%' }}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/¥\s?|(,*)/g, '') as unknown as number}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bankName"
                label="开户银行"
                rules={[{ max: 100, message: '银行名称长度不能超过100个字符' }]}
              >
                <Input placeholder="请输入开户银行" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bankAccount"
                label="银行账号"
                rules={[{ max: 50, message: '银行账号长度不能超过50个字符' }]}
              >
                <Input placeholder="请输入银行账号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="paymentTerms"
                label="付款条件"
                rules={[{ max: 100, message: '付款条件长度不能超过100个字符' }]}
              >
                <Input placeholder="如：月结30天" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'business',
      label: (
        <Space>
          <ShopOutlined />
          业务信息
        </Space>
      ),
      children: (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mainProducts"
                label="主营产品"
                rules={[{ max: 200, message: '主营产品长度不能超过200个字符' }]}
              >
                <TextArea rows={3} placeholder="请输入主营产品" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="businessScope"
                label="经营范围"
                rules={[{ max: 500, message: '经营范围长度不能超过500个字符' }]}
              >
                <TextArea rows={3} placeholder="请输入经营范围" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
  ];

  return (
    <Modal
      title={editingSupplier ? '编辑供应商' : '新增供应商'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={900}
      destroyOnHidden
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: SupplierType.MANUFACTURER,
          level: SupplierLevel.C,
          status: SupplierStatus.ACTIVE,
          country: '中国'
        }}
      >
        <Tabs
          defaultActiveKey="basic"
          items={tabItems}
          size="small"
          tabPosition="top"
          style={{ minHeight: 400 }}
        />
      </Form>
    </Modal>
  );
};

export default SupplierForm;