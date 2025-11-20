import React, { useEffect, useMemo, useState } from 'react'
import { ProCard } from '@ant-design/pro-components'
import type { WorkOrderDetail } from '@zyerp/shared'
import { workOrderService } from '../services/work-order.service'
import { WORK_ORDER_STATUS_OPTIONS } from '@/shared/constants/work-order'
import { Button } from 'antd'
import { workcenterService } from '@/features/workcenter/services/workcenter.service'
import { useMessage } from '@/shared/hooks'
import { useNavigate } from 'react-router-dom'

type WorkOrderGroup = { key: string; title: string; status: string }

export const WorkOrderBoard: React.FC = () => {
  const message = useMessage()
  const navigate = useNavigate()
  const [rows, setRows] = useState<WorkOrderDetail[]>([])
  const [workcenterDict, setWorkcenterDict] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const resp = await workOrderService.getList({ page: 1, pageSize: 100 })
        if (resp.success) setRows(resp.data)
        else message.error(resp.message || '加载失败')
      } catch {
        message.error('加载失败')
      } finally {
        setLoading(false)
      }
    }
    void fetch()
  }, [message])

  useEffect(() => {
    const loadWorkcenters = async () => {
      try {
        const resp = await workcenterService.getList({ page: 1, pageSize: 999 })
        const dict: Record<string, string> = {}
        for (const w of resp.data || []) {
          if (w && typeof w.id === 'string') dict[w.id] = w.code || w.name || w.id
        }
        setWorkcenterDict(dict)
      } catch {
        message.error('加载工作中心失败')
      }
    }
    void loadWorkcenters()
  }, [message])

  const groups: WorkOrderGroup[] = useMemo(() => (
    WORK_ORDER_STATUS_OPTIONS.map((o) => ({ key: o.value, title: o.label, status: o.value }))
  ), [])

  const grouped = useMemo(() => {
    const m = new Map<string, WorkOrder[]>()
    for (const g of groups) m.set(g.status, [])
    for (const r of rows) {
      const list = m.get(r.status) || []
      list.push(r)
      m.set(r.status, list)
    }
    return m
  }, [rows, groups])

  return (
    <>
      <ProCard gutter={16} loading={loading}>
        {groups.map((g) => (
          <ProCard key={g.key} title={g.title} colSpan="20%">
            {(grouped.get(g.status) || []).map((wo) => (
              <div key={wo.id} style={{ border: '1px solid #f0f0f0', borderRadius: 6, padding: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{wo.productName || '-'}</div>
                <div style={{ fontSize: 12, color: '#666' }}>序号：{wo.sequence}</div>
                <div style={{ fontSize: 12, color: '#666' }}>工作中心：{wo.workcenterId ? (workcenterDict[wo.workcenterId] || '-') : '-'}</div>
                <div style={{ fontSize: 12, color: '#666' }}>计划：{wo.plannedStart ? String(wo.plannedStart) : '-'} → {wo.plannedFinish ? String(wo.plannedFinish) : '-'}</div>
                <Button type="link" onClick={() => navigate(`/work-order-scheduling?moId=${wo.moId}`)}>排产视图</Button>
              </div>
            ))}
          </ProCard>
        ))}
      </ProCard>
    </>
  )
}

export default WorkOrderBoard