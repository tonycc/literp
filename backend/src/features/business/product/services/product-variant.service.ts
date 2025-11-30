import { Prisma } from '@prisma/client';
import { 
  ProductInfo
} from '@zyerp/shared';
import { AppError } from '../../../../shared/middleware/error';
import { ProductBaseService } from './product-base.service';

export class ProductVariantService extends ProductBaseService {
  /**
   * 按产品创建批量变体
   */
  async createVariantsBatchByProduct(
    productId: string,
    variants: Array<{
      name: string;
      code: string;
      sku?: string;
      variantAttributes: any[];
      priceAdjustment?: any;
      barcode?: string;
      standardPrice?: number;
      salePrice?: number;
      purchasePrice?: number;
      minStock?: number;
      maxStock?: number;
      safetyStock?: number;
    }>,
    tx?: Prisma.TransactionClient
  ): Promise<{ success: number; failed: number; variants: ProductInfo[] }> {
    const db = tx || this.prisma;
    const base = await db.product.findUnique({ where: { id: productId } });
    if (!base) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    const results = { success: 0, failed: 0, variants: [] as ProductInfo[] };
    for (const variantData of variants) {
      try {
        const attrsNorm = (Array.isArray(variantData.variantAttributes) ? variantData.variantAttributes : [])
          .map((a: any) => ({ name: String(a?.name || ''), value: String(a?.value || '') }))
          .filter((a: any) => a.name && a.value)
        const suffixName = attrsNorm.map((a: any) => a.value).join(' ')
        const suffixCode = attrsNorm.map((a: any) => a.value).join('-')
        const hash = attrsNorm
          .slice()
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
          .map((a: any) => `${a.name}=${a.value}`)
          .join('|') || 'BASE'
        const codeInput = String(variantData.code || '').trim()
        const code = codeInput || `${base.code}-${suffixCode || 'BASE'}`.toUpperCase()
        const nameInput = String(variantData.name || '').trim()
        const name = nameInput || `${base.name} - ${suffixName || 'BASE'}`
        
        // Fix: Treat empty or whitespace-only SKU as null to avoid unique constraint violation
        const skuInput = variantData.sku ? String(variantData.sku).trim() : ''
        const sku = skuInput || null
        
        const existByHash = await db.productVariant.findFirst({ where: { productId, variantHash: hash } })
        if (existByHash) { 
          console.warn(`Variant hash exists: ${hash}`);
          results.failed++; 
          continue 
        }
        const existByCode = await db.productVariant.findFirst({ where: { code } })
        if (existByCode) { 
          console.warn(`Variant code exists: ${code}`);
          results.failed++; 
          continue 
        }
        if (sku) {
          const existBySku = await db.productVariant.findFirst({ where: { sku } })
          if (existBySku) {
            console.warn(`Variant SKU exists: ${sku}`);
            results.failed++;
            continue
          }
        }

        const variant = await db.productVariant.create({ 
          data: { 
            productId, 
            code, 
            name, 
            sku,
            variantHash: hash, 
            isActive: true,
            barcode: variantData.barcode,
            standardPrice: variantData.standardPrice,
            salePrice: variantData.salePrice,
            purchasePrice: variantData.purchasePrice,
            minStock: variantData.minStock,
            maxStock: variantData.maxStock,
            safetyStock: variantData.safetyStock
          } 
        })
        for (const a of attrsNorm) {
          const raw = a.name.trim()
          let attrCode = raw.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
          if (!attrCode) attrCode = raw || 'ATTR'
          let attr = await db.attribute.findFirst({ where: { OR: [ { code: attrCode }, { AND: [{ name: raw }, { NOT: { code: '' } }] } ] } })
          if (!attr) {
            // 兼容历史存在 code 为空但同名的记录
            attr = await db.attribute.findFirst({ where: { name: raw } })
          }
          if (!attr) {
            attr = await db.attribute.create({ data: { name: raw || '属性', code: attrCode } })
          }
          let val = await db.attributeValue.findFirst({ where: { attributeId: attr.id, name: a.value } })
          if (!val) {
            val = await db.attributeValue.create({ data: { attributeId: attr.id, name: a.value } })
          }
          await db.variantAttributeValue.upsert({
            where: { variantId_attributeId: { variantId: variant.id, attributeId: attr.id } },
            update: { attributeValueId: val.id },
            create: { variantId: variant.id, attributeId: attr.id, attributeValueId: val.id },
          })
        }
        results.variants.push({
          id: variant.id,
          code: variant.code,
          name: variant.name,
          type: base.type as any,
          categoryId: base.categoryId as any,
          unitId: base.unitId as any,
          defaultWarehouseId: base.defaultWarehouseId || undefined,
          status: base.status as any,
          acquisitionMethod: base.acquisitionMethod as any,
          isActive: variant.isActive,
          createdAt: variant.createdAt,
          updatedAt: variant.updatedAt,
          version: base.version ?? 1,
          parentId: base.id,
        } as ProductInfo);
        results.success++;
      } catch (error) {
        console.error('Error creating variant:', error);
        results.failed++;
      }
    }
    return results;
  }

  /**
   * 预览产品变体组合
   */
  async previewVariantCombinationsByProduct(
    productId: string,
    attributes: {
      [name: string]: {
        type: string;
        values: string[];
      };
    }
  ): Promise<{ combinations: any[]; total: number }> {
    const base = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!base) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    const attributeNames = Object.keys(attributes);
    const attributeValues = attributeNames.map(name => attributes[name].values);
    const combinations = this.generateCombinations(attributeValues);
    const results = combinations.map(combination => {
      const variantAttributes = combination.map((value, index) => ({
        name: attributeNames[index],
        value: value,
        type: attributes[attributeNames[index]].type
      }));
      const variantName = `${base.name} - ${variantAttributes.map(a => a.value).join(' ')}`;
      const variantCode = `${base.code}-${variantAttributes.map(a => a.value.toUpperCase().replace(/\s+/g, '')).join('-')}`;
      return { attributes: variantAttributes, name: variantName, code: variantCode, exists: false };
    });
    return { combinations: results, total: results.length };
  }

  /**
   * 生成笛卡尔积组合 (string[][])
   */
  private generateCombinations(arrays: string[][]): string[][] {
    if (arrays.length === 0) return [[]];
    if (arrays.length === 1) return arrays[0].map(item => [item]);

    const [first, ...rest] = arrays;
    const restCombinations = this.generateCombinations(rest);

    return first.flatMap(item =>
      restCombinations.map(combination => [item, ...combination])
    );
  }

  /**
   * 生成带属性名称的笛卡尔积组合 (用于 createProduct 中的逻辑)
   */
  public generateAttributeCombinations(
    arrays: Array<{ name: string; values: string[] }>,
    index = 0,
    current: Array<{ name: string; value: string }> = []
  ): Array<Array<{ name: string; value: string }>> {
    if (index === arrays.length) return [current]
    const res: Array<Array<{ name: string; value: string }>> = []
    const attr = arrays[index]
    for (const val of attr.values) {
      res.push(...this.generateAttributeCombinations(arrays, index + 1, [...current, { name: attr.name, value: val }]))
    }
    return res
  }
}
