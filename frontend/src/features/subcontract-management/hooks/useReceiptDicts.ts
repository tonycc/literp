import { useEffect, useState } from 'react'
import { subcontractOrderService } from '../services/subcontract-order.service'
import { warehouseService } from '@/shared/services/warehouse.service'
import { getUsers } from '@/shared/services'

export interface ReceiptDicts {
  orderMap: Record<string, string>
  supplierMap: Record<string, string>
  orderSupplierMap: Record<string, string>
  warehouseMap: Record<string, string>
  userMap: Record<string, string>
}

export const useReceiptDicts = (orderId?: string): ReceiptDicts => {
  const [orderMap, setOrderMap] = useState<Record<string, string>>({})
  const [supplierMap, setSupplierMap] = useState<Record<string, string>>({})
  const [orderSupplierMap, setOrderSupplierMap] = useState<Record<string, string>>({})
  const [warehouseMap, setWarehouseMap] = useState<Record<string, string>>({})
  const [userMap, setUserMap] = useState<Record<string, string>>({})

  useEffect(() => {
    void (async () => {
      try {
        if (orderId) {
          const resp = await subcontractOrderService.getById(orderId)
          const data = resp.data
          if (resp.success && data) {
            setOrderMap({ [data.id]: data.orderNo })
            if (data.supplierId && data.supplierName) setSupplierMap(prev => ({ ...prev, [data.supplierId]: data.supplierName! }))
            if (data.id && data.supplierName) setOrderSupplierMap(prev => ({ ...prev, [data.id]: data.supplierName! }))
          }
        } else {
          const res = await subcontractOrderService.getList({ page: 1, pageSize: 500 })
          const om: Record<string, string> = {}
          const sm: Record<string, string> = {}
          const osm: Record<string, string> = {}
          for (const o of res.data || []) {
            if (o.id && o.orderNo) om[o.id] = o.orderNo
            if (o.supplierId && o.supplierName) sm[o.supplierId] = o.supplierName
            if (o.id && o.supplierName) osm[o.id] = o.supplierName
          }
          setOrderMap(om)
          setSupplierMap(sm)
          setOrderSupplierMap(osm)
        }
      } catch { void 0 }
      try {
        const opts = await warehouseService.getOptions({ isActive: true })
        const wm: Record<string, string> = {}
        for (const w of opts || []) wm[String(w.value)] = String(w.label)
        setWarehouseMap(wm)
      } catch { void 0 }
      try {
        const users = await getUsers({ page: 1, pageSize: 999 })
        const um: Record<string, string> = {}
        for (const u of users.data || []) um[String(u.id)] = u.username || u.email || String(u.id)
        setUserMap(um)
      } catch { void 0 }
    })()
  }, [orderId])

  return { orderMap, supplierMap, orderSupplierMap, warehouseMap, userMap }
}