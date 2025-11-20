-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_product_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "categoryId" TEXT,
    "specification" TEXT,
    "unitId" TEXT NOT NULL,
    "model" TEXT,
    "acquisitionMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "defaultWarehouseId" TEXT,
    "standardCost" REAL NOT NULL DEFAULT 0,
    "safetyStockMin" REAL NOT NULL DEFAULT 0,
    "safetyStockMax" REAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "remark" TEXT,
    "variantAttributes" TEXT,
    "images" TEXT,
    "productRules" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "product_templates_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_templates_defaultWarehouseId_fkey" FOREIGN KEY ("defaultWarehouseId") REFERENCES "warehouses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_product_templates" ("acquisitionMethod", "categoryId", "createdAt", "description", "id", "model", "name", "remark", "specification", "type", "unitId", "updatedAt", "variantAttributes") SELECT "acquisitionMethod", "categoryId", "createdAt", "description", "id", "model", "name", "remark", "specification", "type", "unitId", "updatedAt", "variantAttributes" FROM "product_templates";
DROP TABLE "product_templates";
ALTER TABLE "new_product_templates" RENAME TO "product_templates";
CREATE UNIQUE INDEX "product_templates_code_key" ON "product_templates"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
