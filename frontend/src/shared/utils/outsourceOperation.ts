import { routingService } from '@/features/routing/services/routing.service'
import type { RoutingWorkcenterInfo } from '@zyerp/shared'
import { WorkcenterType } from '@zyerp/shared'

function isOutsourceType(type?: string): boolean {
  if (!type) return false
  const t = String(type).toLowerCase()
  if (t.includes('outsource') || t.includes('outsourcing') || t.includes('external') || t.includes('outside')) return true
  if (String(type).includes('外协') || String(type).includes('委外') || String(type).includes('外包')) return true
  if (t === String(WorkcenterType.OUTSOURCING).toLowerCase()) return true
  if (String(type).toUpperCase() === 'OUTSOURCING') return true
  return false
}

export async function findOutsourcingOperationsByRoutingId(routingId: string): Promise<RoutingWorkcenterInfo[]> {
  const opsResp = await routingService.getOperations(routingId)
  const ops = opsResp.data || []
  let filtered = ops.filter(op => isOutsourceType(op.workcenterType as unknown as string))
  if (filtered.length > 0) return filtered
  const wcOptions = await routingService.getWorkcenterOptions({ _active: true })
  const wcTypeMap = new Map<string, string>((wcOptions.data || []).map(w => [w.value, String(w.type ?? '')]))
  filtered = ops.filter(op => isOutsourceType(wcTypeMap.get(op.workcenterId)))
  return filtered
}

export async function findOutsourcingOperationsByRoutingCode(routingCode: string): Promise<RoutingWorkcenterInfo[]> {
  const routingResp = await routingService.getByCode(routingCode)
  const id = routingResp.data?.id
  if (!id) return []
  return findOutsourcingOperationsByRoutingId(id)
}

export async function getFirstOutsourcingOperationNameByRoutingId(routingId: string): Promise<string | undefined> {
  const ops = await findOutsourcingOperationsByRoutingId(routingId)
  return ops[0]?.name
}

export async function getFirstOutsourcingOperationNameByRoutingCode(routingCode: string): Promise<string | undefined> {
  const ops = await findOutsourcingOperationsByRoutingCode(routingCode)
  return ops[0]?.name
}