import apiClient from './api'
import { mapPaginatedResponse } from './pagination'
import type { ApiResponse, PaginatedResponse } from '@zyerp/shared'

export type DictionaryItem = { value: string; label: string; status?: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }

type DictResult = { options: Array<{ label: string; value: string }>; valueEnum: Record<string, { text: string; status?: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }> }

const cache = new Map<string, { result: DictResult; expiresAt: number }>()
const TTL = 10 * 60 * 1000

function toResult(items: DictionaryItem[]): DictResult {
  const options = items.map(i => ({ label: i.label, value: i.value }))
  const valueEnum: Record<string, { text: string; status?: 'Default' | 'Processing' | 'Success' | 'Warning' | 'Error' }> = {}
  for (const it of items) {
    const s = it.status
    if (s && (s === 'Default' || s === 'Processing' || s === 'Success' || s === 'Warning' || s === 'Error')) {
      valueEnum[it.value] = { text: it.label, status: s }
    } else {
      valueEnum[it.value] = { text: it.label }
    }
  }
  return { options, valueEnum }
}

async function fetchDict(key: string): Promise<PaginatedResponse<DictionaryItem>> {
  const resp = await apiClient.get<ApiResponse<unknown>>(`/dictionaries/${key}`)
  return mapPaginatedResponse<DictionaryItem>(resp.data)
}

export async function getDict(key: string): Promise<DictResult> {
  const now = Date.now()
  const c = cache.get(key)
  if (c && c.expiresAt > now) return c.result
  try {
    const data = await fetchDict(key)
    const items = Array.isArray(data.data) ? data.data : []
    const result = toResult(items)
    cache.set(key, { result, expiresAt: now + TTL })
    return result
  } catch {
    const result = { options: [], valueEnum: {} }
    cache.set(key, { result, expiresAt: now + TTL })
    return result
  }
}

export function clearDictCache(key?: string) {
  if (key) cache.delete(key)
  else cache.clear()
}
