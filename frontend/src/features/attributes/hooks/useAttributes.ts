import { useEffect, useState, useCallback } from 'react'
import { useMessage } from '@/shared/hooks'
import { AttributesService, type AttributeInfo, type AttributeValueInfo } from '../services/attributes.service'

export const useAttributes = () => {
  const message = useMessage()
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<AttributeInfo[]>([])
  const [total, setTotal] = useState(0)

  const fetch = useCallback(async (params?: { page?: number; pageSize?: number; keyword?: string }) => {
    setLoading(true)
    try {
      const resp = await AttributesService.getAttributes(params)
      if (resp.success) {
        setList(resp.data)
        setTotal(resp.total)
      } else {
        message.error('获取属性失败')
      }
    } catch {
      message.error('获取属性失败')
    } finally {
      setLoading(false)
    }
  }, [message])

  const create = useCallback(async (data: Partial<AttributeInfo>) => {
    setLoading(true)
    try {
      const ok = await AttributesService.createAttribute(data)
      if (!ok) message.error('新增属性失败')
      return ok
    } finally {
      setLoading(false)
    }
  }, [message])

  const update = useCallback(async (id: string, data: Partial<AttributeInfo>) => {
    setLoading(true)
    try {
      const ok = await AttributesService.updateAttribute(id, data)
      if (!ok) message.error('更新属性失败')
      return ok
    } finally {
      setLoading(false)
    }
  }, [message])

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const ok = await AttributesService.deleteAttribute(id)
      if (!ok) message.error('删除属性失败')
      return ok
    } finally {
      setLoading(false)
    }
  }, [message])

  const getValues = useCallback(async (attributeId: string) => {
    const resp = await AttributesService.getAttributeValues(attributeId)
    if (!resp.success) message.error('获取属性值失败')
    return resp.data
  }, [message])

  const saveValues = useCallback(async (attributeId: string, values: Array<Partial<AttributeValueInfo>>) => {
    const ok = await AttributesService.createAttributeValues(attributeId, values)
    if (!ok) message.error('保存属性值失败')
    return ok
  }, [message])

  return { loading, list, total, fetch, create, update, remove, getValues, saveValues }
}

