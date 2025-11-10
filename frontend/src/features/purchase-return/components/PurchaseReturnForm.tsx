import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Row,
  Col,
  message,
  Card,
  Divider
} from 'antd';
import dayjs from 'dayjs';
import type { PurchaseReturnFormData } from '../types';

const { Option } = Select;
const { TextArea } = Input;

interface PurchaseReturnFormProps {
  onSubmit: (formData: PurchaseReturnFormData) => Promise<void>;
  onCancel: () => void;
  initialValues?: Partial<PurchaseReturnFormData>;
}

// 模拟采购订单数据
const mockPurchaseOrders = [
  { id: 'PO001', supplierName: '北京科技有限公司', supplierContact: '张经理' },
  { id: 'PO002', supplierName: '上海制造有限公司', supplierContact: '王总监' },
  { id: 'PO003', supplierName: '深圳电子有限公司', supplierContact: '刘主管' },
  { id: 'PO004', supplierName: '广州材料有限公司', supplierContact: '陈经理' }
];

// 模拟采购负责人数据
const mockPurchaseManagers = [
  { id: '1', name: '李明' },
  { id: '2', name: '陈华' },
  { id: '3', name: '王强' },
  { id: '4', name: '张伟' }
];

// 退货原因选项
const returnReasons = [
  '产品质量不符合要求',
  '规格型号不匹配',
  '数量错误',
  '包装破损',
  '延期交货',
  '产品缺陷',
  '其他原因'
];

export const PurchaseReturnForm: React.FC<PurchaseReturnFormProps> = ({
  onSubmit,
  onCancel,
  initialValues
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string>('');

  // 处理采购订单选择
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId);
    const order = mockPurchaseOrders.find(o => o.id === orderId);
    if (order) {
      form.setFieldsValue({
        supplierName: order.supplierName,
        supplierContact: order.supplierContact
      });
    }
  };

  // 表单提交
  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const formData: PurchaseReturnFormData = {
        purchaseOrderId: values.purchaseOrderId as string,
        supplierName: values.supplierName as string,
        supplierContact: values.supplierContact as string,
        purchaseManager: values.purchaseManager as string,
        returnReason: values.returnReason as string,
        totalQuantity: values.totalQuantity as number,
        totalAmount: values.totalAmount as number,
        returnDate: (values.returnDate as { format: (format: string) => string }).format('YYYY-MM-DD'),
        remark: values.remark as string | undefined
      };
      await onSubmit(formData);
      message.success('提交成功');
    } catch {
      message.error('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        returnDate: dayjs(),
        ...initialValues
      }}
    >
      <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="purchaseOrderId"
              label="采购订单编号"
              rules={[{ required: true, message: '请选择采购订单编号' }]}
            >
              <Select
                placeholder="请选择采购订单编号"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
                onChange={handleOrderSelect}
              >
                {mockPurchaseOrders.map(order => (
                  <Option key={order.id} value={order.id}>
                    {order.id} - {order.supplierName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="returnDate"
              label="退货申请日期"
              rules={[{ required: true, message: '请选择退货申请日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="请选择退货申请日期"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="supplierName"
              label="供应商名称"
              rules={[{ required: true, message: '请输入供应商名称' }]}
            >
              <Input placeholder="请输入供应商名称" disabled={!!selectedOrder} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="supplierContact"
              label="供应商联系人"
              rules={[{ required: true, message: '请输入供应商联系人' }]}
            >
              <Input placeholder="请输入供应商联系人" disabled={!!selectedOrder} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="purchaseManager"
              label="采购负责人"
              rules={[{ required: true, message: '请选择采购负责人' }]}
            >
              <Select placeholder="请选择采购负责人">
                {mockPurchaseManagers.map(manager => (
                  <Option key={manager.id} value={manager.name}>
                    {manager.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="退货信息" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="returnReason"
              label="退货原因"
              rules={[{ required: true, message: '请选择退货原因' }]}
            >
              <Select
                placeholder="请选择退货原因"
                allowClear
                showSearch
              >
                {returnReasons.map(reason => (
                  <Option key={reason} value={reason}>
                    {reason}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="totalQuantity"
              label="退货总数量"
              rules={[
                { required: true, message: '请输入退货总数量' },
                { type: 'number', min: 1, message: '退货数量必须大于0' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入退货总数量"
                min={1}
                precision={0}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="totalAmount"
              label="退货总金额"
              rules={[
                { required: true, message: '请输入退货总金额' },
                { type: 'number', min: 0.01, message: '退货金额必须大于0' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="请输入退货总金额"
                min={0.01}
                precision={2}
                addonBefore="¥"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="remark"
              label="备注"
            >
              <TextArea
                rows={4}
                placeholder="请输入备注信息（可选）"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Divider />

      <Row justify="end" gutter={16}>
        <Col>
          <Button onClick={onCancel}>
            取消
          </Button>
        </Col>
        <Col>
          <Button type="primary" htmlType="submit" loading={loading}>
            提交
          </Button>
        </Col>
      </Row>
    </Form>
  );
};