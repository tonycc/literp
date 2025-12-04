import React, { useEffect, useRef, useState } from 'react';
import { Button, Row, Col, Card, Space } from 'antd';
import {
  ProForm,
  ProFormText,
  ProFormSelect,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
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
import type { Customer, CreateCustomerData, UpdateCustomerData } from '@zyerp/shared';
import { getDict } from '@/shared/services/dictionary.service'

type CustomerFormValues = CreateCustomerData & { id?: string };

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
  const formRef = useRef<ProFormInstance<CustomerFormValues> | undefined>(undefined);
  const isEdit = !!customer;
  const [categoryOptions, setCategoryOptions] = useState<Array<{ label: string; value: string }>>([])
  const [creditOptions, setCreditOptions] = useState<Array<{ label: string; value: string }>>([])

  useEffect(() => {
    if (customer) {
      formRef.current?.setFieldsValue({ ...customer } as Partial<CustomerFormValues>);
    } else {
      formRef.current?.resetFields();
    }
  }, [customer]);

  useEffect(() => {
    let mounted = true
    const run = async () => {
      const dc = await getDict('customer-category')
      const dl = await getDict('customer-credit-level')
      if (mounted) {
        if (dc.options.length > 0) setCategoryOptions(dc.options)
        if (dl.options.length > 0) setCreditOptions(dl.options)
      }
    }
    void run()
    return () => { mounted = false }
  }, [])

  const handleSubmit = async (values: CustomerFormValues) => {
    const formData: CustomerFormValues = { ...values }
    if (customer) {
      const payload: UpdateCustomerData = { id: customer.id, ...formData }
      await onSubmit(payload)
    } else {
      const payload: CreateCustomerData = { ...formData }
      await onSubmit(payload)
    }
  }

  const generateCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const code = `CUS${timestamp}`;
    formRef.current?.setFieldsValue({ code } as Partial<CustomerFormValues>);
  };

  return (
      <ProForm<CustomerFormValues>
        formRef={formRef}
        initialValues={customer ? { ...customer } : undefined}
        onFinish={handleSubmit}
        layout="vertical"
        submitter={{ render: () => null }}
      >
        <Card type="inner" title={<><UserOutlined /> 基本信息</>} style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <ProFormText
                name="code"
                label="客户编码"
                placeholder="请输入客户编码"
                rules={[
                  { required: true, message: '请输入客户编码' },
                  { pattern: /^[A-Z0-9]{3,20}$/, message: '客户编码格式不正确（3-20位大写字母和数字）' },
                ]}
                fieldProps={{
                  suffix: !isEdit ? (
                    <Button type="link" size="small" onClick={generateCode}>生成</Button>
                  ) : undefined,
                }}
              />
            </Col>
            <Col span={8}>
              <ProFormText
                name="name"
                label="客户名称"
                placeholder="请输入客户名称"
                rules={[
                  { required: true, message: '请输入客户名称' },
                  { min: 2, max: 100, message: '客户名称长度为2-100个字符' },
                ]}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name="category"
                label="客户分类"
                placeholder="请选择客户分类"
                rules={[{ required: true, message: '请选择客户分类' }]}
                options={categoryOptions}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <ProFormText
                name="contactPerson"
                label="联系人"
                placeholder="请输入联系人"
                rules={[
                  { required: true, message: '请输入联系人' },
                  { min: 2, max: 50, message: '联系人姓名长度为2-50个字符' },
                ]}
                fieldProps={{ prefix: <UserOutlined /> }}
              />
            </Col>
            <Col span={8}>
              <ProFormText
                name="phone"
                label="联系电话"
                placeholder="请输入联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
                ]}
                fieldProps={{ prefix: <PhoneOutlined /> }}
              />
            </Col>
            <Col span={8}>
              <ProFormText
                name="email"
                label="邮箱"
                placeholder="请输入邮箱"
                rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
                fieldProps={{ prefix: <MailOutlined /> }}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="address"
                label="地址"
                placeholder="请输入地址"
                fieldProps={{ prefix: <HomeOutlined /> }}
              />
            </Col>
            <Col span={6}>
              <ProFormSelect
                name="creditLevel"
                label="信用等级"
                placeholder="请选择信用等级"
                options={creditOptions}
              />
            </Col>
          </Row>
        </Card>
        <Card type="inner" title={<><DollarOutlined /> 财务信息</>} style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="bankAccount"
                label="银行账户"
                placeholder="请输入银行账户"
                rules={[{ pattern: /^[0-9]{16,19}$/, message: '银行账户格式不正确' }]}
                fieldProps={{ prefix: <BankOutlined /> }}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="bankName"
                label="开户银行"
                placeholder="请输入开户银行"
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="paymentMethod"
                label="付款方式"
                placeholder="请输入付款方式"
              />
            </Col>
            <Col span={12}>
              <ProFormText name="taxNumber" label="税号" placeholder="请输入税号" />
            </Col>
          </Row>
        </Card>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={onCancel} icon={<CloseOutlined />}>取消</Button>
              <Button type="primary" loading={loading} icon={<SaveOutlined />} onClick={() => formRef.current?.submit?.()}>
                {isEdit ? '更新' : '保存'}
              </Button>
            </Space>
          </Col>
        </Row>
      </ProForm>
  );
};

export default CustomerForm;
