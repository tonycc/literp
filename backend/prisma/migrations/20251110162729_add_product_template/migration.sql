/*
  Warnings:

  - You are about to drop the column `category` on the `product_templates` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `product_templates` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `product_templates` table. All the data in the column will be lost.
  - You are about to drop the column `variantAttributeIds` on the `product_templates` table. All the data in the column will be lost.
  - Added the required column `unitId` to the `product_templates` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_product_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "categoryId" TEXT,
    "specification" TEXT,
    "unitId" TEXT NOT NULL,
    "model" TEXT,
    "acquisitionMethod" TEXT,
    "description" TEXT,
    "remark" TEXT,
    "variantAttributes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_templates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "product_templates_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_product_templates" ("createdAt", "description", "id", "name", "type", "updatedAt") SELECT "createdAt", "description", "id", "name", "type", "updatedAt" FROM "product_templates";
DROP TABLE "product_templates";
ALTER TABLE "new_product_templates" RENAME TO "product_templates";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
