PRAGMA foreign_keys=off;

CREATE TABLE IF NOT EXISTS "material_issue_orders" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderNo" TEXT NOT NULL UNIQUE,
  "workOrderId" TEXT NOT NULL,
  "moId" TEXT NOT NULL,
  "warehouseId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "remark" TEXT,
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "material_issue_orders_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "material_issue_orders_moId_fkey" FOREIGN KEY ("moId") REFERENCES "manufacturing_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "material_issue_orders_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "material_issue_orders_workOrderId_idx" ON "material_issue_orders"("workOrderId");
CREATE INDEX IF NOT EXISTS "material_issue_orders_status_idx" ON "material_issue_orders"("status");

CREATE TABLE IF NOT EXISTS "material_issue_order_items" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "materialId" TEXT NOT NULL,
  "unitId" TEXT NOT NULL,
  "requiredQuantity" REAL NOT NULL DEFAULT 0,
  "issuedQuantity" REAL NOT NULL DEFAULT 0,
  "pendingQuantity" REAL NOT NULL DEFAULT 0,
  "warehouseId" TEXT,
  "remark" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "material_issue_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "material_issue_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "material_issue_order_items_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "material_issue_order_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "material_issue_order_items_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "material_issue_order_items_orderId_idx" ON "material_issue_order_items"("orderId");
CREATE INDEX IF NOT EXISTS "material_issue_order_items_materialId_idx" ON "material_issue_order_items"("materialId");

PRAGMA foreign_keys=on;