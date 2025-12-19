import { useEffect, useState, useCallback, useRef } from 'react'
import { warehouseService } from '@/shared/services/warehouse.service'
import { useMessage } from '@/shared/hooks'

export interface OptionItem {
  value: string
  label: string
}

export const useWarehouseOptions = (params?: { type?: string; isActive?: boolean }) => {
  const [options, setOptions] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(false)
  const message = useMessage()
  const messageRef = useRef(message)

  useEffect(() => {
    messageRef.current = message
  }, [message])

  // 使用 useRef 保存 params 的稳定引用，避免因对象引用变化导致死循环
  const paramsRef = useRef(params)
  if (JSON.stringify(params) !== JSON.stringify(paramsRef.current)) {
    paramsRef.current = params
  }
  const stableParams = paramsRef.current

  const fetchOptions = useCallback(async () => {
    setLoading(true)
    try {
      const warehouses = await warehouseService.getOptions(stableParams)
      setOptions(warehouses.map(w => ({ value: w.value, label: w.label })))
    } catch {
      messageRef.current.error('加载仓库选项失败')
    } finally {
      setLoading(false)
    }
  }, [stableParams])

  useEffect(() => {
    void fetchOptions()
  }, [fetchOptions])

  return { options, loading, refresh: fetchOptions }
}