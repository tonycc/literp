/**
 * 客户信息表单组件
 */

import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Card,
  Space,
  message,
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  BankOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
} from '../types';

const { Option } = Select;

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CreateCustomerData | UpdateCustomerData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const isEdit = !!customer;

  // 初始化表单数据
  useEffect(() => {
    if (customer) {
      const formData = {
        ...customer,
        establishedDate: customer.establishedDate ? dayjs(customer.establishedDate) : undefined,
      };
      form.setFieldsValue(formData);
    } else {
      form.resetFields();
    }
  }, [customer, form]);

  // 处理表单提交
  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const formData = {
        ...values,
        establishedDate: values.establishedDate ? (values.establishedDate as { format: (format: string) => string }).format('YYYY-MM-DD') : undefined,
      };

      if (isEdit) {
        await onSubmit({ id: customer!.id, ...formData } as UpdateCustomerData);
      } else {
        await onSubmit(formData as CreateCustomerData);
      }

      message.success(isEdit ? '更新成功' : '创建成功');
    } catch {
      message.error(isEdit ? '更新失败' : '创建失败');
    }
  };

  // 生成客户编码
  const generateCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const code = `CUS${timestamp}`;
    form.setFieldValue('code', code);
  };

  return (
    <Card
      title={
        <Space>
          <UserOutlined />
          {isEdit ? '编辑客户信息' : '新增客户信息'}
        </Space>
      }
      extra={
        <Space>
          <Button onClick={onCancel} icon={<CloseOutlined />}>
            取消
          </Button>
          <Button
            type="primary"
            loading={loading}
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
          >
            {isEdit ? '更新' : '保存'}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {/* 基本信息 */}
        <Card type="inner" title={<><UserOutlined /> 基本信息</>} style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="客户编码"
                name="code"
                rules={[
                  { required: true, message: '请输入客户编码' },
                  { pattern: /^[A-Z0-9]{3,20}$/, message: '客户编码格式不正确（3-20位大写字母和数字）' },
                ]}
              >
                <Input
                  placeholder="请输入客户编码"
                  suffix={
                    !isEdit && (
                      <Button
                        type="link"
                        size="small"
                        onClick={generateCode}
                      >
                        生成
                      </Button>
                    )
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="客户名称"
                name="name"
                rules={[
                  { required: true, message: '请输入客户名称' },
                  { min: 2, max: 100, message: '客户名称长度为2-100个字符' },
                ]}
              >
                <Input placeholder="请输入客户名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="客户分类"
                name="category"
                rules={[{ required: true, message: '请选择客户分类' }]}
              >
                <Select placeholder="请选择客户分类">
                  <Option value="enterprise">企业客户</Option>
                  <Option value="individual">个人客户</Option>
                  <Option value="government">政府客户</Option>
                  <Option value="institution">机构客户</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="联系人"
                name="contactPerson"
                rules={[
                  { required: true, message: '请输入联系人' },
                  { min: 2, max: 50, message: '联系人姓名长度为2-50个字符' },
                ]}
              >
                <Input placeholder="请输入联系人" prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="联系电话"
                name="phone"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
                ]}
              >
                <Input placeholder="请输入联系电话" prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="邮箱"
                name="email"
                rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
              >
                <Input placeholder="请输入邮箱" prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="地址"
                name="address"
                rules={[
                  { required: true, message: '请输入地址' },
                  { min: 5, max: 200, message: '地址长度为5-200个字符' },
                ]}
              >
                <Input placeholder="请输入地址" prefix={<HomeOutlined />} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="信用等级"
                name="creditLevel"
                rules={[{ required: true, message: '请选择信用等级' }]}
              >
                <Select placeholder="请选择信用等级">
                  <Option value="AAA">AAA</Option>
                  <Option value="AA">AA</Option>
                  <Option value="A">A</Option>
                  <Option value="BBB">BBB</Option>
                  <Option value="BB">BB</Option>
                  <Option value="B">B</Option>
                  <Option value="C">C</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">活跃</Option>
                  <Option value="inactive">非活跃</Option>
                  <Option value="suspended">暂停</Option>
                  <Option value="blacklisted">黑名单</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 财务信息 */}
        <Card type="inner" title={<><DollarOutlined /> 财务信息</>} style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="银行账户"
                name="bankAccount"
                rules={[{ pattern: /^[0-9]{16,19}$/, message: '银行账户格式不正确' }]}
              >
                <Input placeholder="请输入银行账户" prefix={<BankOutlined />} />
              </Form.Item>
            </Col>
             <Col span={12}>
              <Form.Item
                label="开户银行"
                name="bankName"
              >
                <Input placeholder="请输入开户银行" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}> 
            <Col span={12}>
              <Form.Item
                label="付款方式"
                name="paymentMethod"
              >
                <Input placeholder="请输入付款方式" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Card>
  );
};

export default CustomerForm;