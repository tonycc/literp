import React, { useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import type { ProductionReport } from '@zyerp/shared'
import { productionReportService } from '../services/production-report.service'
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams'
import type { TableParams } from '@/shared/utils/normalizeTableParams'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ProductionReportForm from './ProductionReportForm'

const ProductionReportList: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined)

  const columns: ProColumns<ProductionReport>[] = [
    { title: '报工单编号', dataIndex: 'reportNo', width: 220 },
    { title: '工单编号', dataIndex: 'workOrderNo', width: 220 },
    { title: '生产班组', dataIndex: 'teamName', width: 160 },
    { title: '报工人', dataIndex: 'reporterName', width: 160 },
    { title: '报工时间', dataIndex: 'reportTime', valueType: 'dateTime', width: 200 },
    { title: '产品编码', dataIndex: 'productCode', width: 160 },
    { title: '产品名称', dataIndex: 'productName', width: 220 },
    { title: '规格型号', dataIndex: 'specification', width: 200 },
    { title: '报工数量', dataIndex: 'reportedQuantity', width: 140 },
    { title: '合格数量', dataIndex: 'qualifiedQuantity', width: 140 },
    { title: '不良数量', dataIndex: 'defectQuantity', width: 140 },
    { title: '工序编码', dataIndex: 'processCode', width: 160 },
    { title: '工序名称', dataIndex: 'processName', width: 200 },
  ]

  return (
    <ProTable<ProductionReport>
      actionRef={actionRef}
      rowKey={(r) => r.id as string}
      columns={columns}
      search={{ labelWidth: 'auto' }}
      request={async (params) => {
        const base = normalizeTableParams(params as TableParams)
        const res = await productionReportService.getList({ page: base.page, pageSize: base.pageSize })
        return { data: res.data, success: res.success, total: res.pagination.total }
      }}
      toolBarRender={() => [
        <ProductionReportForm
          key="add"
          trigger={<Button type="primary" icon={<PlusOutlined />}>新增报工</Button>}
          onSuccess={() => actionRef.current?.reload?.()}
        />
      ]}
      pagination={{ showSizeChanger: true, showQuickJumper: true }}
    />
  )
}

export default ProductionReportList