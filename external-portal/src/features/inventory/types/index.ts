// 产品库存信息
export interface ProductInventory {
  id: string
  productCode: string
  productName: string
  category: string
  specification: string
  unit: string
  currentStock: number
  availableStock: number
  reservedStock: number
  minStockLevel: number
  maxStockLevel: number
  location: string
  lastUpdated: string
  supplier: string
  unitPrice: number
  totalValue: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
}

// 库存搜索参数
export interface InventorySearchParams {
  search?: string
  category?: string
  status?: string
  location?: string
  supplier?: string
}

// 库存统计信息
export interface InventoryStats {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
}