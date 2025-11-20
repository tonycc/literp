import { useEffect, useState, useCallback, useRef } from 'react'
import { unitService } from '@/shared/services/unit.service'
import { useMessage } from '@/shared/hooks'

export interface OptionItem {
  value: string
  label: string
}

export const useUnitOptions = (params?: { category?: string; isActive?: boolean }) => {
  const [options, setOptions] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(false)
  const message = useMessage()
  const messageRef = useRef(message)

  useEffect(() => {
    messageRef.current = message
  }, [message])

  const fetchOptions = useCallback(async () => {
    setLoading(true)
    try {
      const units = await unitService.getOptions(params)
      setOptions(units.map(u => ({ value: u.value, label: u.label })))
    } catch {
      messageRef.current.error('加载单位选项失败')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    void fetchOptions()
  }, [fetchOptions])

  return { options, loading, refresh: fetchOptions }
}