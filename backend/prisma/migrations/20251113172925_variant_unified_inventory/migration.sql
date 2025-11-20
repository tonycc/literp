/*
  Warnings:

  - You are about to drop the column `maxStock` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `minStock` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `reorderPoint` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `safetyStock` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `safetyStockMax` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `safetyStockMin` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN "barcode" TEXT;
ALTER TABLE "product_variants" ADD COLUMN "currency" TEXT DEFAULT 'CNY';
ALTER TABLE "product_variants" ADD COLUMN "maxStock" REAL;
ALTER TABLE "product_variants" ADD COLUMN "minStock" REAL;
ALTER TABLE "product_variants" ADD COLUMN "purchasePrice" REAL;
ALTER TABLE "product_variants" ADD COLUMN "qrCode" TEXT;
ALTER TABLE "product_variants" ADD COLUMN "reorderPoint" REAL;
ALTER TABLE "product_variants" ADD COLUMN "safetyStock" REAL;
ALTER TABLE "product_variants" ADD COLUMN "salePrice" REAL;
ALTER TABLE "product_variants" ADD COLUMN "standardPrice" REAL;

-- CreateTable
CREATE TABLE "variant_stocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variantId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "unitId" TEXT,
    "quantity" REAL NOT NULL DEFAULT 0,
    "reservedQuantity" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "variant_stocks_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "variant_stocks_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "variant_stocks_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "variant_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variantId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "variant_images_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "remark" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "products_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "products_defaultWarehouseId_fkey" FOREIGN KEY ("defaultWarehouseId") REFERENCES "warehouses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("acquisitionMethod", "averageCost", "barcode", "categoryId", "code", "createdAt", "createdBy", "defaultWarehouseId", "description", "id", "isActive", "latestCost", "model", "name", "qrCode", "remark", "specification", "standardCost", "status", "type", "unitId", "updatedAt", "updatedBy", "version") SELECT "acquisitionMethod", "averageCost", "barcode", "categoryId", "code", "createdAt", "createdBy", "defaultWarehouseId", "description", "id", "isActive", "latestCost", "model", "name", "qrCode", "remark", "specification", "standardCost", "status", "type", "unitId", "updatedAt", "updatedBy", "version" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");
CREATE INDEX "products_code_idx" ON "products"("code");
CREATE INDEX "products_name_idx" ON "products"("name");
CREATE INDEX "products_type_idx" ON "products"("type");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX "products_status_idx" ON "products"("status");
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "variant_stocks_variantId_idx" ON "variant_stocks"("variantId");

-- CreateIndex
CREATE INDEX "variant_stocks_warehouseId_idx" ON "variant_stocks"("warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "variant_stocks_variantId_key" ON "variant_stocks"("variantId");

-- CreateIndex
CREATE INDEX "variant_images_variantId_idx" ON "variant_images"("variantId");

-- CreateIndex
CREATE INDEX "variant_images_sortOrder_idx" ON "variant_images"("sortOrder");
