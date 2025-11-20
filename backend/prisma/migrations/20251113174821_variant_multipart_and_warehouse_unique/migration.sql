/*
  Warnings:

  - A unique constraint covering the columns `[variantId,warehouseId]` on the table `variant_stocks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "variant_stocks_variantId_key";

-- CreateIndex
CREATE UNIQUE INDEX "variant_stocks_variantId_warehouseId_key" ON "variant_stocks"("variantId", "warehouseId");
