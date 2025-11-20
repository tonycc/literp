import { useCallback, useState } from 'react'
import type { ManufacturingOrder, ManufacturingOrderListParams } from '@zyerp/shared'
import { manufacturingOrderService } from '../services/manufacturing-order.service'

export const useManufacturingOrder = () => {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<ManufacturingOrder[]>([])
  const [total, setTotal] = useState(0)

  const fetchList = useCallback(async (params: ManufacturingOrderListParams = { page: 1, pageSize: 10 }) => {
    setLoading(true)
    try {
      const res = await manufacturingOrderService.getList(params)
      setRows(res.data)
      setTotal(res.pagination.total || 0)
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, rows, total, fetchList }
}