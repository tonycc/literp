import { useEffect, useState } from 'react'
import { ProductAttributeLinesService } from '../services/product-attribute-lines.service'
import { useMessage } from '@/shared/hooks'
import AttributesService from '@/features/attributes/services/attributes.service'

export const useProductAttributeLines = (productId: string) => {
  const message = useMessage()
  const [loading, setLoading] = useState(false)
  const [attributes, setAttributes] = useState<Array<{ attributeName: string; values: string[]; source?: 'product' | 'global' }>>([])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [linesResp, attrsResp] = await Promise.all([
          ProductAttributeLinesService.getLines(productId),
          AttributesService.getAttributes({ page: 1, pageSize: 1000 }),
        ])
        const productLines = (linesResp.success ? linesResp.data : []).map(l => ({ ...l, source: 'product' as const }))
        const globalAttrs = (attrsResp.success ? attrsResp.data : []).filter(a => a.isGlobal)
        const globalLines = globalAttrs.map(a => ({ attributeName: a.name, values: a.values || [], source: 'global' as const }))
        const merged: Array<{ attributeName: string; values: string[]; source?: 'product' | 'global' }> = []
        const seen = new Set<string>()
        for (const l of [...productLines, ...globalLines]) {
          const key = l.attributeName
          if (seen.has(key)) continue
          seen.add(key)
          merged.push({ attributeName: l.attributeName, values: l.values, source: l.source })
        }
        setAttributes(merged)
      } catch {
        message.error('获取属性线失败')
      } finally {
        setLoading(false)
      }
    }
    if (productId) { void fetch() }
  }, [productId, message])

  const save = async (list: Array<{ attributeName: string; values: string[] }>) => {
    const ok = await ProductAttributeLinesService.save(productId, list)
    if (!ok) message.error('保存属性线失败')
    return ok
  }

  return { loading, attributes, save }
}

