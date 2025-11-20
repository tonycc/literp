import fs from 'fs'
import path from 'path'
import type { MaterialIssueOrder } from '@zyerp/shared'

const storePath = path.resolve(process.cwd(), 'backend', 'data', 'material-issue.json')

function ensureDir() {
  const dir = path.dirname(storePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readAll(): MaterialIssueOrder[] {
  try {
    if (!fs.existsSync(storePath)) return []
    const raw = fs.readFileSync(storePath, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as MaterialIssueOrder[] : []
  } catch {
    return []
  }
}

function writeAll(list: MaterialIssueOrder[]) {
  ensureDir()
  fs.writeFileSync(storePath, JSON.stringify(list, null, 2), 'utf-8')
}

export function getByWorkOrderId(workOrderId: string): MaterialIssueOrder | undefined {
  return readAll().find(o => o.workOrderId === workOrderId)
}

export function save(order: MaterialIssueOrder): void {
  const list = readAll()
  const idx = list.findIndex(o => o.workOrderId === order.workOrderId)
  if (idx >= 0) list[idx] = order
  else list.push(order)
  writeAll(list)
}

export function list(): MaterialIssueOrder[] {
  return readAll()
}