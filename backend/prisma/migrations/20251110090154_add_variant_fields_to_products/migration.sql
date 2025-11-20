-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "categoryId" TEXT,
    "specification" TEXT,
    "unitId" TEXT NOT NULL,
    "model" TEXT,
    "barcode" TEXT,
    "qrCode" TEXT,
    "acquisitionMethod" TEXT,
    "defaultWarehouseId" TEXT,
    "standardCost" REAL,
    "averageCost" REAL,
    "latestCost" REAL,
    "safetyStock" REAL,
    "safetyStockMin" REAL,
    "safetyStockMax" REAL,
    "minStock" REAL,
    "maxStock" REAL,
    "reorderPoint" REAL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "variantAttributes" TEXT,
    "description" TEXT,
    "remark" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "products_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "products_defaultWarehouseId_fkey" FOREIGN KEY ("defaultWarehouseId") REFERENCES "warehouses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "products_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_products" ("acquisitionMethod", "averageCost", "barcode", "categoryId", "code", "createdAt", "createdBy", "defaultWarehouseId", "description", "id", "isActive", "isTemplate", "latestCost", "maxStock", "minStock", "model", "name", "parentId", "qrCode", "remark", "reorderPoint", "safetyStock", "safetyStockMax", "safetyStockMin", "specification", "standardCost", "status", "type", "unitId", "updatedAt", "updatedBy", "variantAttributes", "version") SELECT "acquisitionMethod", "averageCost", "barcode", "categoryId", "code", "createdAt", "createdBy", "defaultWarehouseId", "description", "id", "isActive", "isTemplate", "latestCost", "maxStock", "minStock", "model", "name", "parentId", "qrCode", "remark", "reorderPoint", "safetyStock", "safetyStockMax", "safetyStockMin", "specification", "standardCost", "status", "type", "unitId", "updatedAt", "updatedBy", "variantAttributes", "version" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");
CREATE INDEX "products_code_idx" ON "products"("code");
CREATE INDEX "products_name_idx" ON "products"("name");
CREATE INDEX "products_type_idx" ON "products"("type");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX "products_status_idx" ON "products"("status");
CREATE INDEX "products_isTemplate_idx" ON "products"("isTemplate");
CREATE INDEX "products_parentId_idx" ON "products"("parentId");
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
