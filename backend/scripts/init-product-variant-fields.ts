
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting initialization of ProductVariant blank fields...');

  try {
    // 1. Fetch all variants with their product info
    const variants = await prisma.productVariant.findMany({
      include: {
        product: true
      }
    });

    console.log(`Total variants to check: ${variants.length}`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const variant of variants) {
      try {
        const updates: any = {};

        // Price fields
        if (variant.priceDelta === null) updates.priceDelta = 0;
        if (variant.standardPrice === null) updates.standardPrice = 0;
        if (variant.salePrice === null) updates.salePrice = 0;
        if (variant.purchasePrice === null) updates.purchasePrice = 0;

        // Stock threshold fields
        if (variant.minStock === null) updates.minStock = 0;
        if (variant.safetyStock === null) updates.safetyStock = 0;
        if (variant.maxStock === null) updates.maxStock = 0;
        if (variant.reorderPoint === null) updates.reorderPoint = 0;

        // Identification fields
        if (!variant.barcode) updates.barcode = variant.code;
        if (!variant.qrCode) updates.qrCode = variant.code;
        if (!variant.name && variant.product?.name) updates.name = variant.product.name;

        // SKU (ensure it's set, though previous script should have handled it)
        if (!variant.sku) updates.sku = variant.code;

        if (Object.keys(updates).length > 0) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: updates
          });
          updatedCount++;
        }

      } catch (error) {
        console.error(`Failed to update variant ${variant.id} (${variant.code}):`, error);
        errorCount++;
      }
    }

    console.log('-----------------------------------');
    console.log('Initialization completed.');
    console.log(`Updated variants: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Script execution failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
