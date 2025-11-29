import React, { useEffect, useState } from 'react'
import { Modal, Row, Col, Card, Button, Space, Input, Form, Select } from 'antd'
import type { Supplier, CreateSupplierData } from '@zyerp/shared'
import { SupplierStatus, SupplierCategory } from '@zyerp/shared'
import { SUPPLIER_CATEGORY_OPTIONS } from '@/shared/constants/supplier'
import { getDict } from '@/shared/services/dictionary.service'
import { supplierService } from '../services/supplier.service'
import { useMessage } from '@/shared/hooks/useMessage'

interface SupplierFormProps {
  visible: boolean
  editingSupplier: Supplier | null
  onCancel: () => void
  onSubmit: (values: CreateSupplierData) => Promise<void>
}

const SupplierForm: React.FC<SupplierFormProps> = ({ visible, editingSupplier, onCancel, onSubmit }) => {
  const [form] = Form.useForm<CreateSupplierData>()
  const message = useMessage()
  const [categoryOptions, setCategoryOptions] = useState<Array<{ label: string; value: string }>>(SUPPLIER_CATEGORY_OPTIONS)

  const initialValues: Partial<CreateSupplierData> = {
    code: '',
    name: '',
    category: SupplierCategory.MANUFACTURER,
    status: SupplierStatus.ACTIVE,
  }

  useEffect(() => {
    const load = async () => {
      if (visible) {
        const dc = await getDict('supplier-category')
        if (dc.options.length > 0) setCategoryOptions(dc.options)
        if (editingSupplier?.id) {
          const detail = await supplierService.getById(editingSupplier.id)
          const d = detail.data
          form.setFieldsValue({
            code: d?.code ?? '',
            name: d?.name ?? '',
            shortName: d?.shortName ?? '',
            category: typeof d?.category === 'string' ? d?.category : SupplierCategory.MANUFACTURER,
            status: typeof d?.status === 'string' ? d?.status : SupplierStatus.ACTIVE,
            contactName: d?.contactName ?? '',
            phone: d?.phone ?? '',
            email: d?.email ?? '',
            address: d?.address ?? '',
            registeredCapital: d?.registeredCapital ?? undefined,
            creditLevel: d?.creditLevel ?? '',
            remark: d?.remark ?? '',
          })
        } else {
          form.setFieldsValue({
            code: '',
            name: '',
            category: initialValues.category,
            status: initialValues.status,
            shortName: '',
            contactName: '',
            phone: '',
            email: '',
            address: '',
            registeredCapital: undefined,
            creditLevel: '',
            remark: '',
          })
        }
      }
    }
    void load()
  }, [visible, editingSupplier, form, initialValues.category, initialValues.status])

  return (
    <Modal
      title={editingSupplier ? '编辑供应商' : '新增供应商'}
      open={visible}
      footer={null}
      onCancel={onCancel}
      destroyOnHidden
      width={1000}
    >
      <Form form={form} layout="vertical" onFinish={(values: CreateSupplierData) => {
        void (async () => {
          await onSubmit(values)
          message.success(editingSupplier ? '更新成功' : '创建成功')
        })()
      }}>
        <Card size="small" title="基本信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="供应商编码">
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item
                    name="code"
                    rules={[
                      { required: true, message: '请输入供应商编码' },
                      { pattern: /^[A-Z0-9]+$/, message: '编码只能包含大写字母和数字' }
                    ]}
                    validateTrigger="onBlur"
                    noStyle
                  >
                    <Input placeholder="供应商编码，格式：字母+数字" />
                  </Form.Item>
                  <Button
                    type="primary"
                    onClick={() => {
                      const iso = new Date().toISOString()
                      const code = `SUP${iso.slice(0,4)}${iso.slice(5,7)}${iso.slice(8,10)}${iso.slice(11,13)}${iso.slice(14,16)}`
                      form.setFieldsValue({ code })
                    }}
                  >
                    生成
                  </Button>
                </Space.Compact>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="name" label="供应商名称" rules={[{ required: true, message: '请输入供应商名称' }, { max: 100, message: '名称长度不能超过100个字符' }]}>
                <Input placeholder="供应商名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
            <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}> 
                <Select placeholder="选择分类" options={categoryOptions} allowClear showSearch />
            </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="contactName" label="联系人" rules={[{ max: 50, message: '联系人长度不能超过50个字符' }]}>
                <Input placeholder="联系人" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone" label="联系电话" rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }]}>
                <Input placeholder="联系电话" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}>
                <Input placeholder="邮箱" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="address" label="地址" rules={[{ max: 200, message: '地址长度不能超过200个字符' }]}>
                <Input placeholder="地址" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Card size="small" title="财务信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="creditLevel" label="信用等级">
                <Input placeholder="信用等级" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Card size="small" title="备注" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="remark" label="备注">
                <Input placeholder="备注" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Row justify="end">
            <Space align='end'>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" htmlType="submit">保存</Button>
          </Space>
        </Row>
      </Form>
      
    </Modal>
  )
}
export default SupplierForm
