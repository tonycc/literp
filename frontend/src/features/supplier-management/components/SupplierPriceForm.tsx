import React, { useEffect, useRef, useState } from 'react'
import { Modal, Row, Col, Card } from 'antd'
import { ProForm, ProFormText, ProFormSelect, ProFormDigit, ProFormDatePicker } from '@ant-design/pro-components'
import type { ProFormInstance } from '@ant-design/pro-components'
import type { CreateSupplierPriceData, SupplierPrice, User } from '@zyerp/shared'
import { SUPPLIER_VAT_RATE_OPTIONS } from '@/shared/constants/supplier'
import { supplierPriceService } from '../services/supplier-price.service'
import { supplierService } from '../services/supplier.service'
import { getUsers } from '@/shared/services/user.service'
import { ProductService } from '@/features/product/services'

interface SupplierPriceFormProps {
  visible: boolean
  editingPrice: SupplierPrice | null
  onCancel: () => void
  onSubmit: (values: CreateSupplierPriceData) => Promise<void>
}

const SupplierPriceForm: React.FC<SupplierPriceFormProps> = ({ visible, editingPrice, onCancel, onSubmit }) => {
  const formRef = useRef<ProFormInstance<CreateSupplierPriceData>>(null)

  const [taxExclusive, setTaxExclusive] = useState<number>(0)
  const [taxAmount, setTaxAmount] = useState<number>(0)

  const computeTax = (inclusive?: number, vat?: number) => {
    if (typeof inclusive === 'number' && typeof vat === 'number') {
      const ex = Number((inclusive / (1 + vat)).toFixed(2))
      const ta = Number((inclusive - ex).toFixed(2))
      setTaxExclusive(ex)
      setTaxAmount(ta)
    }
  }

  useEffect(() => {
    const inc = editingPrice?.taxInclusivePrice
    const vt = editingPrice?.vatRate
    computeTax(inc, vt)
  }, [editingPrice])

  return (
    <Modal
      title={editingPrice ? '编辑价格' : '新增价格'}
      open={visible}
      footer={null}
      onCancel={onCancel}
      width={1000}
      destroyOnHidden
    >
      <ProForm<CreateSupplierPriceData>
        formRef={formRef}
        layout="vertical"
        request={async () => {
          if (editingPrice?.id) {
            const detail = await supplierPriceService.getById(editingPrice.id)
            const d = detail.data as SupplierPrice
            computeTax(d.taxInclusivePrice, d.vatRate)
            return {
              supplierId: d.supplierId,
              productName: d.productName,
              productCode: d.productCode,
              unit: d.unit ?? '',
              taxInclusivePrice: d.taxInclusivePrice,
              vatRate: d.vatRate,
              effectiveDate: d.effectiveDate ?? undefined,
              expiryDate: d.expiryDate ?? undefined,
              minOrderQty: d.minOrderQty ?? undefined,
              purchaseManager: d.purchaseManager ?? '',
              remark: d.remark ?? '',
            }
          }
          return {
            supplierId: '',
            productName: '',
            productCode: '',
            unit: '',
            taxInclusivePrice: 0,
            vatRate: SUPPLIER_VAT_RATE_OPTIONS[0].value,
            effectiveDate: undefined,
            expiryDate: undefined,
            minOrderQty: undefined,
            purchaseManager: '',
            remark: '',
          }
        }}
        params={{ id: editingPrice?.id ?? undefined }}
        onValuesChange={(_changedValues, allValues) => {
          const current = allValues as CreateSupplierPriceData
          const inc = current.taxInclusivePrice
          const vt = current.vatRate
          computeTax(inc, vt)
        }}
        onFinish={async (values: CreateSupplierPriceData) => {
          const {
            supplierId,
            productName,
            productCode,
            unit,
            taxInclusivePrice,
            vatRate,
            effectiveDate,
            expiryDate,
            minOrderQty,
            purchaseManager,
            remark,
          } = values
          const effectiveDateStr = typeof effectiveDate === 'string' ? effectiveDate : (effectiveDate as unknown as { format: (f: string) => string })?.format?.('YYYY-MM-DD')
          const expiryDateStr = typeof expiryDate === 'string' ? expiryDate : (expiryDate as unknown as { format: (f: string) => string })?.format?.('YYYY-MM-DD')
          await onSubmit({
            supplierId,
            productName,
            productCode,
            unit,
            taxInclusivePrice,
            vatRate,
            effectiveDate: effectiveDateStr,
            expiryDate: expiryDateStr,
            minOrderQty,
            purchaseManager,
            remark,
          })
          return true
        }}
        submitter={{ searchConfig: { submitText: '提 交', resetText: '重 置' } }}
      >
        <Card size="small" title="基本信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <ProFormSelect
                name="supplierId"
                label="供应商"
                rules={[{ required: true }]}
                request={async () => {
                  const resp = await supplierService.getList({ current: 1, pageSize: 100 })
                  return (resp.data || []).map(s => ({ label: `${s.name}`, value: s.id }))
                }}
                showSearch
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="purchaseManager"
                label="采购负责人"
                request={async () => {
                  const resp = await getUsers({ page: 1, pageSize: 200 })
                  const users = resp.data || []
                  const opts = users
                    .map((u: User) => ({
                      label: u.username ? (u.email ? `${u.username}（${u.email}）` : u.username) : '',
                      value: u.username || '',
                    }))
                    .filter((o) => !!o.label && !!o.value)
                  return opts
                }}
                fieldProps={{ optionFilterProp: 'label' }}
                showSearch
                allowClear
              />
            </Col>
          </Row>
        </Card>

        <Card size="small" title="产品信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <ProFormSelect
                name="productId"
                label="产品名称"
                rules={[{ required: true }]}
                request={async () => {
                  const ps = new ProductService()
                  const resp = await ps.getProductOptions({ activeOnly: true })
                  const list = resp.data || []
                  return list.map((p) => ({ label: p.name, value: p.id, code: p.code, unitName: p.unit?.name }))
                }}
                fieldProps={{
                  optionFilterProp: 'label',
                  onChange: async (value: string, option: unknown) => {
                    const opt = option as { label: string; value: string; code?: string; unitName?: string }
                    // Use a local type definition to avoid linter errors with imported types
                    type LocalFormInstance = {
                      setFieldsValue: (values: Partial<CreateSupplierPriceData>) => void
                    }
                    const instance = formRef.current as unknown as LocalFormInstance | undefined
                    if (opt?.code || opt?.unitName) {
                      instance?.setFieldsValue({ productName: opt?.label, productCode: opt?.code ?? '', unit: opt?.unitName ?? '' })
                    } else if (value) {
                      const ps = new ProductService()
                      const detail = await ps.getProductById(value)
                      const p = detail.data
                      instance?.setFieldsValue({ productName: p?.name ?? '', productCode: p?.code ?? '', unit: p?.unit?.name ?? '' })
                    }
                  },
                }}
                showSearch
              />
            </Col>
            <Col span={0}>
              <ProFormText name="productName" label="产品名称" rules={[{ required: true }]} fieldProps={{ disabled: true }} />
            </Col>
          
            <Col span={8}>
              <ProFormText name="productCode" label="产品编码" rules={[{ required: true }, { max: 50 }]} fieldProps={{ disabled: true }} />
            </Col>
            <Col span={4}>
              <ProFormText name="unit" label="单位" fieldProps={{ disabled: true }} />
            </Col>
            <Col span={4}>
              <ProFormDigit name="minOrderQty" label="最小订量" min={0} fieldProps={{ precision: 2 }} />
            </Col>
          </Row>
        </Card>

        <Card size="small" title="价格信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <ProFormDigit name="taxInclusivePrice" label="含税单价" min={0} fieldProps={{ precision: 2 }} rules={[{ required: true }]} />
            </Col>
            <Col span={12}>
              <ProFormSelect name="vatRate" label="税率" options={SUPPLIER_VAT_RATE_OPTIONS} rules={[{ required: true }]} />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ marginRight: 16 }}>不含税：¥{taxExclusive.toFixed(2)}</span>
                <span>税额：¥{taxAmount.toFixed(2)}</span>
              </div>
            </Col>
          </Row>
        </Card>

        <Card size="small" title="有效期" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <ProFormDatePicker name="effectiveDate" label="生效日期" />
            </Col>
            <Col span={12}>
              <ProFormDatePicker name="expiryDate" label="失效日期" />
            </Col>
          </Row>
        </Card>

        <Card size="small" title="备注" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <ProFormText name="remark" label="备注" />
            </Col>
          </Row>
        </Card>
      </ProForm>
    </Modal>
  )
}

export default SupplierPriceForm