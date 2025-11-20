import { useEffect, useState, useCallback } from 'react'
import { ProductService } from '@/features/product/services/product.service'
import { useMessage } from '@/shared/hooks'

export interface ProductOptionItem {
  id: string
  code: string
  name: string
  specification?: string
  unitLabel?: string
  imageUrl?: string
}

const service = new ProductService()

export const useProductOptions = (params?: { categoryId?: string; keyword?: string; activeOnly?: boolean }) => {
  const [options, setOptions] = useState<ProductOptionItem[]>([])
  const [loading, setLoading] = useState(false)
  const message = useMessage()

  const fetchOptions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await service.getProductOptions(params)
      const list = Array.isArray(res.data) ? res.data : []
      setOptions(
        list.map(p => ({
          id: p.id,
          code: p.code,
          name: p.name,
          specification: p.specification,
          unitLabel: p.unit ? `${p.unit.name}(${p.unit.symbol})` : undefined,
          imageUrl: p.primaryImageUrl,
        }))
      )
    } catch {
      message.error('加载产品选项失败')
    } finally {
      setLoading(false)
    }
  }, [params, message])

  useEffect(() => {
    void fetchOptions()
  }, [fetchOptions])

  return { options, loading, refresh: fetchOptions }
}