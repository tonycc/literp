import { useCallback } from 'react'
import { useMessage } from '@/shared/hooks'
import { BomService } from '../services/bom.service'
import type { BomItemSyncItem } from '@zyerp/shared'
import type { MaterialRequirementType } from '@zyerp/shared'

export const useBomItemsSync = () => {
  const message = useMessage()

  const syncBomItems = useCallback(async (bomId: string, items: BomItemSyncItem[]) => {
    try {
      const res = await BomService.syncItems(bomId, items)
      if (!res.success) {
        message.error(res.message || '物料项批量同步失败')
        return null
      }
      return res.data ?? { created: 0, updated: 0, deleted: 0, skipped: 0 }
    } catch (error) {
      console.error('syncBomItems error:', error)
      message.error('物料项批量同步失败')
      return null
    }
  }, [message])

  const toSyncItems = useCallback((rows: Array<{ id?: string; materialId: string; unitId: string; quantity: number; sequence: number; isKey: boolean; isPhantom?: boolean; childBomId?: string; requirementType?: MaterialRequirementType }>): BomItemSyncItem[] => {
    return rows.map((r) => ({
      id: r.id,
      materialId: r.materialId,
      quantity: r.quantity,
      unitId: r.unitId,
      sequence: r.sequence,
      requirementType: (r.requirementType ?? 'fixed') as MaterialRequirementType,
      isKey: r.isKey,
      isPhantom: !!r.isPhantom,
      childBomId: r.childBomId,
    }))
  }, [])

  return { syncBomItems, toSyncItems }
}