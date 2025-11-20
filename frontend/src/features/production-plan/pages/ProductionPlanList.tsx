import React from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Drawer, Row, Col, Alert, Modal } from 'antd'
import ProductionPlanDetailModal from '../components/ProductionPlanDetailModal'
import { useMessage, useModal } from '@/shared/hooks'
import { productionPlanService } from '../services/production-plan.service'
import { MaterialRequirementList } from '../components/MaterialRequirementList'
import type { ProductionPlan, ProductionPlanProductPlan } from '@zyerp/shared'
import { PRODUCTION_PLAN_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/production-plan'
import { salesOrderService } from '@/features/sales-order/services/sales-order.service'
import type { SalesOrder, SalesOrderItem } from '@zyerp/shared'
import { BomService } from '@/features/bom/services/bom.service'
import type { BomItem } from '@zyerp/shared'
import { warehouseService } from '@/shared/services/warehouse.service'
import { getUsers } from '@/shared/services'
import apiClient from '@/shared/services/api'
import type { VariantInfo } from '@zyerp/shared'

const ProductionPlanList: React.FC = () => {
  const message = useMessage()
  const modal = useModal()
  const actionRef = React.useRef<ActionType | undefined>(undefined)
  const [selected, setSelected] = React.useState<ProductionPlan | null>(null)
  const [detailVisible, setDetailVisible] = React.useState(false)
  const [warehouseMap, setWarehouseMap] = React.useState<Record<string, string>>({})
  const [userMap, setUserMap] = React.useState<Record<string, string>>({})
  const [salesOrderVisible, setSalesOrderVisible] = React.useState(false)
  const [salesOrder, setSalesOrder] = React.useState<SalesOrder | null>(null)
  const [salesOrderItems, setSalesOrderItems] = React.useState<SalesOrderItem[]>([])
  const [productMaterialsVisible, setProductMaterialsVisible] = React.useState(false)
  const [productMaterialsRows, setProductMaterialsRows] = React.useState<ProductMaterialsRow[]>([])
  const [mrpVisible, setMrpVisible] = React.useState(false)
  const [mrpProduction, setMrpProduction] = React.useState<MrpProductionSuggestion[]>([])
  const [mrpPurchase, setMrpPurchase] = React.useState<MrpPurchaseSuggestion[]>([])
  

  React.useEffect(() => {
    const loadDicts = async () => {
      try {
        const opts = await warehouseService.getOptions({ isActive: true })
        const map: Record<string, string> = {}
        for (const w of opts || []) {
          map[String(w.value)] = String(w.label)
        }
        setWarehouseMap(map)
      } catch {
        // 静默处理异常，避免用户感知
      }
      try {
        const users = await getUsers({ page: 1, pageSize: 200 })
        const mapU: Record<string, string> = {}
        for (const u of users.data || []) {
          mapU[String(u.id)] = u.username || u.email || String(u.id)
        }
        setUserMap(mapU)
      } catch {
        // 静默处理异常，避免用户感知
      }
    }
    void loadDicts()
  }, [])

  const getWarehouseName = (id?: string) => (id && warehouseMap[id] ? warehouseMap[id] : '-')
  const getUserName = (id?: string) => (id && userMap[id] ? userMap[id] : '-')

  const columns: ProColumns<ProductionPlan>[] = [
    { title: '序号', dataIndex: 'index', valueType: 'indexBorder', width: 48 },
    { title: '销售订单', dataIndex: 'orderNo', width: 160, render: (_, r) => (
      <a
        onClick={() => {
          if (!r.orderId) return
          void (async () => {
            try {
              const so = await salesOrderService.getById(r.orderId)
              const items = await salesOrderService.getItems(r.orderId)
              setSalesOrder(so.data || null)
              setSalesOrderItems(items.data || [])
              setSalesOrderVisible(true)
            } catch {
              message.error('加载销售订单失败')
            }
          })()
        }}
      >{r.orderNo ?? '-'}</a>
    ) },
    { title: '计划名称', dataIndex: 'name', ellipsis: true, width: 180 },
    { title: '产品数', dataIndex: 'products', width: 100, render: (_, r) => (
      <a onClick={() => { setSelected(r); setDetailVisible(true) }}>
        {r.products?.length ?? 0}
      </a>
    ) },
    { title: '物料项数', dataIndex: 'materialRequirements', width: 120, render: (_, r) => (
      <a onClick={() => {
        void (async () => {
          try {
            const products = r.products || []
            const map = new Map<string, ProductMaterialsRow>()
            await Promise.all(products.map(async (p) => {
              if (!p.bomId) return
              const res = await BomService.getItems(p.bomId)
              const items: BomItem[] = res.data || []
              const base = typeof p.baseQuantity === 'number' && p.baseQuantity > 0 ? p.baseQuantity : 1
              const ratio = (typeof p.quantity === 'number' ? p.quantity : 0) / base
              const pid = String(p.productId)
              let parent = map.get(pid)
              if (!parent) {
                parent = {
                  key: pid,
                  rowType: 'product',
                  productId: pid,
                  productCode: p.productCode,
                  productName: p.productName,
                  bomCode: p.bomCode,
                  children: [],
                }
                map.set(pid, parent)
              }
              for (let idx = 0; idx < items.length; idx++) {
                const it = items[idx]
                const reqQty = (typeof it.quantity === 'number' ? it.quantity : 0) * ratio
                const child: ProductMaterialsRow = {
                  key: `${pid}:${it.materialCode}:${idx}`,
                  rowType: 'material',
                  materialCode: it.materialCode ?? '',
                  materialName: it.materialName ?? '',
                  unit: it.unitName ?? undefined,
                  requiredQuantity: reqQty,
                  requirementType: it.requirementType ?? undefined,
                }
                ;(parent.children as ProductMaterialsRow[]).push(child)
              }
            }))
            setProductMaterialsRows(Array.from(map.values()))
            setProductMaterialsVisible(true)
          } catch {
            message.error('加载产品物料明细失败')
          }
        })()
      }}>
        {r.materialRequirements?.length ?? 0}
      </a>
    ) },
    { title: 'MRP建议', dataIndex: 'mrp', width: 180, hideInSearch: true, render: (_, r) => (
      <a onClick={() => {
        void (async () => {
          const products = r.products || []
          const production: MrpProductionSuggestion[] = []
          for (const p of products) {
            if (!p.productId) continue
            const resp = await apiClient.get<{ data: { data: VariantInfo[] } }>(`/products/${p.productId}/variants`, { params: { page: 1, pageSize: 100 } })
            const variants = resp.data?.data?.data || []
            const available = variants.reduce((sum, v) => sum + Math.max(0, (v.currentStock ?? 0) - (v.reservedStock ?? 0)), 0)
            const req = typeof p.quantity === 'number' ? p.quantity : Number(p.quantity || 0)
            const shortage = Math.max(0, req - available)
            production.push({
              key: `${r.id}:mrp:prod:${p.productId}`,
              productId: p.productId,
              productCode: p.productCode,
              productName: p.productName,
              requiredQuantity: req,
              availableStock: available,
              shortage,
            })
          }

          const mats = r.materialRequirements || []
          const purchase: MrpPurchaseSuggestion[] = []
          for (const m of mats) {
            const req = typeof m.requiredQuantity === 'number' ? m.requiredQuantity : Number(m.requiredQuantity || 0)
            if (!m.materialId) continue
            const resp = await apiClient.get<{ data: { data: VariantInfo[] } }>(`/products/${m.materialId}/variants`, { params: { page: 1, pageSize: 100 } })
            const variants = resp.data?.data?.data || []
            const available = variants.reduce((sum, v) => sum + Math.max(0, (v.currentStock ?? 0) - (v.reservedStock ?? 0)), 0)
            const shortage = Math.max(0, req - available)
            purchase.push({
              key: `${r.id}:mrp:purchase:${m.materialId}`,
              materialId: m.materialId,
              materialCode: m.materialCode,
              materialName: m.materialName,
              unit: m.unit ?? null,
              requiredQuantity: req,
              availableStock: available,
              shortage,
              needOutsource: m.needOutsource ?? false,
            })
          }

          setMrpProduction(production)
          setMrpPurchase(purchase)
          setMrpVisible(true)
        })()
      }}>
        查看MRP
      </a>
    ) },
    { title: '计划开始', dataIndex: 'plannedStart', valueType: 'date', width: 140, hideInSearch: true },
    { title: '计划完工', dataIndex: 'plannedFinish', valueType: 'date', width: 140, hideInSearch: true },
    { title: '负责人', dataIndex: 'ownerId', width: 140, render: (_, r) => getUserName(r.ownerId) },
    { title: '成品仓库', dataIndex: 'finishedWarehouseId', width: 140, render: (_, r) => getWarehouseName(r.finishedWarehouseId) },
    { title: '领料仓库', dataIndex: 'issueWarehouseId', width: 140, render: (_, r) => getWarehouseName(r.issueWarehouseId) },
    
    { title: '状态', dataIndex: 'status', width: 120, valueType: 'select', valueEnum: PRODUCTION_PLAN_STATUS_VALUE_ENUM_PRO },
    { title: '备注', dataIndex: 'notes', ellipsis: true, width: 220, hideInSearch: true },
    { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime', width: 180, hideInSearch: true },
    { title: '更新时间', dataIndex: 'updatedAt', valueType: 'dateTime', width: 180, hideInSearch: true },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      fixed: 'right',
      dataIndex: 'actions',
      render: (_, record) => [
        <a key="view" onClick={() => { setSelected(record); setDetailVisible(true) }}>详情</a>,
        <a
          key="confirm"
          onClick={() => {
            modal.confirm({
              title: '确认生产计划',
              content: `确认生产计划（订单号：${record.orderNo ?? '-'}）？确认后自动生成制造订单`,
              onOk: async () => {
                const resp = await productionPlanService.confirm(record.id)
                if (resp.success) {
                  message.success('确认成功，正在生成制造订单…')
                  const gen = await productionPlanService.generateManufacturingOrders(record.id)
                  if (gen.success) {
                    message.success(`生成制造订单成功：${gen.data?.length ?? 0} 条`)
                    void actionRef.current?.reload?.()
                  } else {
                    message.error(gen.message || '生成制造订单失败')
                  }
                } else {
                  message.error(resp.message || '确认失败')
                }
              },
            })
          }}
          style={{ pointerEvents: record.status === 'draft' ? 'auto' : 'none', color: record.status === 'draft' ? undefined : '#999' }}
        >确认</a>,
        <a
          key="cancel"
          onClick={() => {
            modal.confirm({
              title: '取消生产计划',
              content: `取消生产计划（订单号：${record.orderNo ?? '-'}）？`,
              onOk: async () => {
                const resp = await productionPlanService.cancel(record.id)
                if (resp.success) {
                  message.success('取消成功')
                  void actionRef.current?.reload?.()
                } else {
                  message.error(resp.message || '取消失败')
                }
              },
            })
          }}
          style={{ pointerEvents: record.status === 'completed' ? 'none' : 'auto', color: record.status === 'completed' ? '#999' : undefined }}
        >取消</a>,
        <a
          key="delete"
          onClick={() => {
            modal.confirm({
              title: '删除生产计划',
              content: `确认删除该生产计划（订单号：${record.orderNo ?? '-'})？`,
              onOk: async () => {
                const resp = await productionPlanService.delete(record.id)
                if (resp.success) {
                  message.success('删除成功')
                  void actionRef.current?.reload?.()
                } else {
                  message.error(resp.message || '删除失败')
                }
              },
            })
          }}
          style={{ pointerEvents: record.status === 'confirmed' || record.status === 'completed' ? 'none' : 'auto', color: record.status === 'confirmed' || record.status === 'completed' ? '#999' : undefined }}
        >删除</a>,
      ],
    },
  ]

  return (
    <>
      <ProTable<ProductionPlan>
        headerTitle="生产计划列表"
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const resp = await productionPlanService.getList({
            page: (params.current as number) ?? 1,
            pageSize: (params.pageSize as number) ?? 10,
            status: (params as Record<string, unknown>)?.status as string | undefined,
            orderNo: (params as Record<string, unknown>)?.orderNo as string | undefined,
            startDate: (params as Record<string, unknown>)?.startDate as string | undefined,
            endDate: (params as Record<string, unknown>)?.endDate as string | undefined,
          })
          return {
            data: resp.data,
            success: true,
            total: resp.pagination.total,
          }
        }}
        rowKey={(r) => r.id}
        search={{ labelWidth: 'auto' }}
        scroll={{ x: 1200 }}
        toolBarRender={() => {
          const handleExport = async (): Promise<void> => {
            const resp = await productionPlanService.getList({ page: 1, pageSize: 100 })
            const rows = resp.data
            const header = ['订单号','状态','创建时间','产品数','物料项数']
            const csvRows = (rows || []).map(r => [
              r.orderNo ?? '-',
              r.status,
              r.createdAt,
              String(r.products?.length ?? 0),
              String(r.materialRequirements?.length ?? 0),
            ].join(','))
            const csv = [header.join(','), ...csvRows].join('\n')
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = '生产计划列表.csv'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }
          return [
            <a key="export" onClick={() => { void handleExport() }}>导出CSV</a>
          ]
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
        }}
      />
      <ProductionPlanDetailModal visible={detailVisible} plan={selected} onClose={() => setDetailVisible(false)} />
      <Drawer
        open={salesOrderVisible}
        onClose={() => setSalesOrderVisible(false)}
        title={salesOrder ? `销售订单 - ${salesOrder.orderNo ?? '-'}` : '销售订单'}
        width={920}
      >
        <Row gutter={[16, 16]}>
          <Col span={4}><strong>订单号：</strong>{salesOrder?.orderNo ?? '-'}</Col>
          <Col span={6}><strong>客户：</strong>{salesOrder?.customerName ?? '-'}</Col>
          <Col span={4}><strong>下单日期：</strong>{salesOrder?.orderDate ?? '-'}</Col>
          <Col span={4}><strong>交付日期：</strong>{salesOrder?.deliveryDate ?? '-'}</Col>
          <Col span={4}><strong>状态：</strong>{salesOrder?.status ?? '-'}</Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <ProTable<SalesOrderItem>
              headerTitle="订单产品明细"
              columns={[
                { title: '产品', dataIndex: ['product','name'], width: 220, render: (_, r) => r.product?.name ?? '-' },
                { title: '产品编码', dataIndex: ['product','code'], width: 140, render: (_, r) => r.product?.code ?? '-' },
                { title: '数量', dataIndex: 'quantity', valueType: 'digit', width: 100 },
                { title: '单位', dataIndex: ['unit','name'], width: 100, render: (_, r) => r.unit?.name ?? '-' },
                { title: '仓库', dataIndex: ['warehouse','name'], width: 140, render: (_, r) => r.warehouse?.name ?? '-' },
              ]}
              dataSource={salesOrderItems}
              rowKey={(r) => String(r.id)}
              search={false}
              pagination={false}
              scroll={{ x: 900 }}
            />
          </Col>
        </Row>
      </Drawer>
      <Drawer
        open={productMaterialsVisible}
        onClose={() => setProductMaterialsVisible(false)}
        title="每个产品的物料需求明细"
        width={920}
      >
        <ProTable<ProductMaterialsRow>
          headerTitle="物料明细（按产品展开）"
          columns={[
            { title: '产品编码', dataIndex: 'productCode', width: 140, render: (_, r) => (r.productCode ? <strong>{r.productCode}</strong> : '-') },
            { title: '产品名称', dataIndex: 'productName', width: 200, render: (_, r) => (r.productName ? <strong>{r.productName}</strong> : '-') },
            { title: 'BOM版本', dataIndex: 'bomCode', width: 120 },
            { title: '物料编码', dataIndex: 'materialCode', width: 140 },
            { title: '物料名称', dataIndex: 'materialName' },
            { title: '单位', dataIndex: 'unit', width: 100 },
            { title: '需求量', dataIndex: 'requiredQuantity', valueType: 'digit', width: 120 },
            { title: '需求类型', dataIndex: 'requirementType', width: 120 },
          ]}
          dataSource={productMaterialsRows}
          rowKey={(r) => r.key}
          search={false}
          pagination={false}
          expandable={{ defaultExpandAllRows: true }}
          scroll={{ x: 1100 }}
        />
      </Drawer>
      <Drawer
        open={mrpVisible}
        onClose={() => setMrpVisible(false)}
        title="MRP建议"
        width={920}
      >
        <Row gutter={[16,16]}>
          <Col span={24}>
            <ProTable<MrpProductionSuggestion>
              headerTitle="生产建议"
              columns={[
                { title: '产品编码', dataIndex: 'productCode', width: 140 },
                { title: '产品名称', dataIndex: 'productName' },
                { title: '需求量', dataIndex: 'requiredQuantity', valueType: 'digit', width: 120 },
                { title: '可用库存', dataIndex: 'availableStock', valueType: 'digit', width: 120 },
                { title: '缺口', dataIndex: 'shortage', valueType: 'digit', width: 120 },
              ]}
              dataSource={mrpProduction}
              rowKey={(r) => r.key}
              search={false}
              pagination={false}
              scroll={{ x: 800 }}
            />
          </Col>
          <Col span={24}>
            <ProTable<MrpPurchaseSuggestion>
              headerTitle="采购/外协建议"
              columns={[
                { title: '物料编码', dataIndex: 'materialCode', width: 140 },
                { title: '物料名称', dataIndex: 'materialName' },
                { title: '单位', dataIndex: 'unit', width: 80 },
                { title: '需求量', dataIndex: 'requiredQuantity', valueType: 'digit', width: 120 },
                { title: '可用库存', dataIndex: 'availableStock', valueType: 'digit', width: 120 },
                { title: '缺口', dataIndex: 'shortage', valueType: 'digit', width: 120 },
                { title: '建议', dataIndex: 'needOutsource', width: 100, render: (_, r) => (r.shortage > 0 ? (r.needOutsource ? '外协' : '采购') : '无需') },
              ]}
              dataSource={mrpPurchase}
              rowKey={(r) => r.key}
              search={false}
              pagination={false}
              scroll={{ x: 1000 }}
            />
          </Col>
        </Row>
      </Drawer>
    </>
  )
}

export default ProductionPlanList
type ProductMaterialsRow = {
  key: string
  rowType: 'product' | 'material'
  productId?: string
  productCode?: string
  productName?: string
  bomCode?: string | null
  materialCode?: string
  materialName?: string
  unit?: string | null
  requiredQuantity?: number
  requirementType?: string
  children?: ProductMaterialsRow[]
}
type MrpProductionSuggestion = {
  key: string
  productId: string
  productCode: string
  productName: string
  requiredQuantity: number
  availableStock: number
  shortage: number
}
type MrpPurchaseSuggestion = {
  key: string
  materialId: string
  materialCode: string
  materialName: string
  unit: string | null
  requiredQuantity: number
  availableStock: number
  shortage: number
  needOutsource?: boolean
}