-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_product_bom_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bomId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "materialVariantId" TEXT,
    "quantity" REAL NOT NULL,
    "unitId" TEXT NOT NULL,
    "childBomId" TEXT,
    "sequence" INTEGER NOT NULL DEFAULT 10,
    "requirementType" TEXT NOT NULL DEFAULT 'fixed',
    "isKey" BOOLEAN NOT NULL DEFAULT false,
    "isPhantom" BOOLEAN NOT NULL DEFAULT false,
    "substitutionRatio" REAL NOT NULL DEFAULT 1,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "processInfo" TEXT,
    "effectiveDate" DATETIME,
    "expiryDate" DATETIME,
    "unitCost" REAL,
    "totalCost" REAL,
    "remark" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_bom_items_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_bom_items_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_bom_items_childBomId_fkey" FOREIGN KEY ("childBomId") REFERENCES "product_boms" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "product_bom_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_bom_items_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_bom_items_materialVariantId_fkey" FOREIGN KEY ("materialVariantId") REFERENCES "product_variants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "product_bom_items_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "product_boms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_product_bom_items" ("bomId", "childBomId", "createdAt", "createdBy", "effectiveDate", "expiryDate", "id", "isKey", "isPhantom", "isPreferred", "materialId", "priority", "processInfo", "quantity", "remark", "requirementType", "sequence", "substitutionRatio", "totalCost", "unitCost", "unitId", "updatedAt", "updatedBy") SELECT "bomId", "childBomId", "createdAt", "createdBy", "effectiveDate", "expiryDate", "id", "isKey", "isPhantom", "isPreferred", "materialId", "priority", "processInfo", "quantity", "remark", "requirementType", "sequence", "substitutionRatio", "totalCost", "unitCost", "unitId", "updatedAt", "updatedBy" FROM "product_bom_items";
DROP TABLE "product_bom_items";
ALTER TABLE "new_product_bom_items" RENAME TO "product_bom_items";
CREATE INDEX "product_bom_items_bomId_idx" ON "product_bom_items"("bomId");
CREATE INDEX "product_bom_items_materialId_idx" ON "product_bom_items"("materialId");
CREATE INDEX "product_bom_items_materialVariantId_idx" ON "product_bom_items"("materialVariantId");
CREATE INDEX "product_bom_items_childBomId_idx" ON "product_bom_items"("childBomId");
CREATE INDEX "product_bom_items_sequence_idx" ON "product_bom_items"("sequence");
CREATE INDEX "product_bom_items_createdBy_idx" ON "product_bom_items"("createdBy");
CREATE INDEX "product_bom_items_createdAt_idx" ON "product_bom_items"("createdAt");
CREATE TABLE "new_product_boms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "baseQuantity" REAL NOT NULL DEFAULT 1,
    "baseUnitId" TEXT NOT NULL,
    "routingId" TEXT,
    "effectiveDate" DATETIME NOT NULL,
    "expiryDate" DATETIME,
    "description" TEXT,
    "remark" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_boms_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "product_boms_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_boms_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_boms_routingId_fkey" FOREIGN KEY ("routingId") REFERENCES "routings" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "product_boms_baseUnitId_fkey" FOREIGN KEY ("baseUnitId") REFERENCES "units" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_boms_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "product_boms_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_product_boms" ("approvedAt", "approvedBy", "baseQuantity", "baseUnitId", "code", "createdAt", "createdBy", "description", "effectiveDate", "expiryDate", "id", "isDefault", "name", "productId", "remark", "routingId", "status", "type", "updatedAt", "updatedBy", "version") SELECT "approvedAt", "approvedBy", "baseQuantity", "baseUnitId", "code", "createdAt", "createdBy", "description", "effectiveDate", "expiryDate", "id", "isDefault", "name", "productId", "remark", "routingId", "status", "type", "updatedAt", "updatedBy", "version" FROM "product_boms";
DROP TABLE "product_boms";
ALTER TABLE "new_product_boms" RENAME TO "product_boms";
CREATE UNIQUE INDEX "product_boms_code_key" ON "product_boms"("code");
CREATE INDEX "product_boms_productId_idx" ON "product_boms"("productId");
CREATE INDEX "product_boms_variantId_idx" ON "product_boms"("variantId");
CREATE INDEX "product_boms_type_idx" ON "product_boms"("type");
CREATE INDEX "product_boms_status_idx" ON "product_boms"("status");
CREATE INDEX "product_boms_effectiveDate_idx" ON "product_boms"("effectiveDate");
CREATE INDEX "product_boms_createdBy_idx" ON "product_boms"("createdBy");
CREATE INDEX "product_boms_createdAt_idx" ON "product_boms"("createdAt");
CREATE INDEX "product_boms_routingId_idx" ON "product_boms"("routingId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
