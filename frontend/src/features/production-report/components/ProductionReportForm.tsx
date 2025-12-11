import React, { useRef } from 'react'
import { ModalForm, ProFormText, ProFormDigit, ProFormDateTimePicker, ProFormSelect, ProCard } from '@ant-design/pro-components'
import type { ProFormInstance } from '@ant-design/pro-components'
import { useMessage } from '@/shared/hooks'
import { productionReportService } from '../services/production-report.service'
import { workOrderService } from '@/features/work-order/services/work-order.service'
import { productService } from '@/features/product/services/product.service'
import type { WorkOrderDetail } from '@zyerp/shared'
import type { CreateProductionReportData, ProductionReport } from '@zyerp/shared'
import { Button, Row, Col } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

interface ProductionReportFormProps {
  trigger?: React.JSX.Element
  onSuccess?: (report: ProductionReport) => void
}

const ProductionReportForm: React.FC<ProductionReportFormProps> = ({ trigger, onSuccess }) => {
  const formRef = useRef<ProFormInstance<CreateProductionReportData> | undefined>(undefined)
  const message = useMessage()
  const workOrderMapRef = useRef<Map<string, WorkOrderDetail>>(new Map())

  return (
    <ModalForm<CreateProductionReportData>
      formRef={formRef}
      title="新增报工"
      layout="vertical"
      modalProps={{ destroyOnClose: true }}
      trigger={
        trigger ?? (
          <Button type="primary" icon={<PlusOutlined />}>新增报工</Button>
        )
      }
      onFinish={async (values) => {
        const payload: CreateProductionReportData = {
          ...values,
          reportTime: values.reportTime ? dayjs(values.reportTime).format('YYYY-MM-DD') : undefined,
          reportedQuantity: Number(values.reportedQuantity || 0),
          qualifiedQuantity: Number(values.qualifiedQuantity || 0),
          defectQuantity: Number(values.defectQuantity || 0),
        }
        if (values.workOrderId) {
          const wo = workOrderMapRef.current.get(String(values.workOrderId))
          if (wo && typeof wo.orderNo === 'string') {
            payload.workOrderNo = wo.orderNo
          }
        }
        const resp = await productionReportService.create(payload)
        if (resp.success && resp.data) {
          message.success(`报工成功：${resp.data.reportNo ?? ''}`)
          formRef.current?.resetFields?.()
          onSuccess?.(resp.data)
          return true
        }
        message.error(resp.message ?? '报工失败')
        return false
      }}
    >
      <ProCard title="工单与报工" bordered>
        <Row gutter={16}>
          <Col span={12}>
            <ProFormSelect
              name="workOrderId"
              label="生产工单"
              placeholder="请选择生产工单"
              rules={[{ required: true, message: '请选择生产工单' }]}
              request={async () => {
                const res = await workOrderService.getList({ page: 1, pageSize: 50 })
                workOrderMapRef.current = new Map((res.data || []).map((wo) => [wo.id, wo]))
                return (res.data || []).map((wo) => ({
                  label: `${wo.orderNo ?? wo.id.slice(0, 8)}｜${wo.productName ?? '-'}`,
                  value: wo.id,
                }))
              }}
              fieldProps={{
                onChange: (value) => {
                  const id = typeof value === 'string' ? value : String(value)
                  const wo = workOrderMapRef.current.get(id)
                  if (wo) {
                    formRef.current?.setFieldsValue?.({
                      productCode: typeof wo.productCode === 'string' ? wo.productCode : undefined,
                      productName: typeof wo.productName === 'string' ? wo.productName : undefined,
                      reportedQuantity: typeof wo.quantity === 'number' ? wo.quantity : undefined,
                      processName: typeof wo.operationsLabel === 'string' ? wo.operationsLabel : undefined,
                      processCode: typeof wo.operationId === 'string' ? wo.operationId : undefined,
                    })
                    const pid = typeof wo.productId === 'string' ? wo.productId : undefined
                    if (pid) {
                      void (async () => {
                        const resp = await productService.getProductById(pid)
                        const p = resp.data
                        if (p && typeof p === 'object') {
                          formRef.current?.setFieldsValue?.({
                            specification: typeof p.specification === 'string' ? p.specification : undefined,
                          })
                        }
                      })()
                    }
                  }
                },
              }}
            />
          </Col>
          <Col span={6}>
            <ProFormText name="teamName" label="生产班组" />
          </Col>
          <Col span={6}>
            <ProFormText name="reporterName" label="报工人" />
          </Col>
          <Col span={12}>
            <ProFormDateTimePicker name="reportTime" label="报工时间" />
          </Col>
        </Row>
      </ProCard>

      <ProCard title="产品信息" bordered style={{ marginTop: 12 }}>
        <Row gutter={16}>
          <Col span={8}>
            <ProFormText name="productCode" label="产品编码" />
          </Col>
          <Col span={8}>
            <ProFormText name="productName" label="产品名称" />
          </Col>
          <Col span={8}>
            <ProFormText name="specification" label="规格型号" />
          </Col>
        </Row>
      </ProCard>

      <ProCard title="数量与工序" bordered style={{ marginTop: 12 }}>
        <Row gutter={16}>
          <Col span={6}>
            <ProFormDigit name="reportedQuantity" label="报工数量" min={0} fieldProps={{ precision: 4 }} />
          </Col>
          <Col span={6}>
            <ProFormDigit name="qualifiedQuantity" label="合格数量" min={0} fieldProps={{ precision: 4 }} />
          </Col>
          <Col span={6}>
            <ProFormDigit name="defectQuantity" label="不良数量" min={0} fieldProps={{ precision: 4 }} />
          </Col>
          <Col span={6}>
            <ProFormText name="processName" label="工序名称" />
          </Col>
        </Row>
      </ProCard>

      <ProCard title="备注" bordered style={{ marginTop: 12 }}>
        <Row gutter={16}>
          <Col span={24}>
            <ProFormText name="remark" label="备注" />
          </Col>
        </Row>
      </ProCard>
    </ModalForm>
  )
}

export default ProductionReportForm