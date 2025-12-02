import { BaseService } from '@/shared/services/base.service';
import { Product, ProductVariant } from '@prisma/client';
import { AppError } from '@/shared/middleware/error';
import { ProductInfo, VariantInfo, ProductQueryParams } from '@zyerp/shared';

export class ProductVariantsService extends BaseService {
  constructor() {
    super();
  }

  async generateVariants(productId: string, attributes: Record<string, string[]>): Promise<ProductInfo[]> {
    const baseProduct = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!baseProduct) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    const combinations = this.generateCombinations(attributes);
    
    return this.prisma.$transaction(async (tx) => {
      const createdVariants: ProductInfo[] = [];
      for (const combination of combinations) {
        const keys = Object.keys(combination).sort();
        
        const resolvedAttrs = [];
        for (const k of keys) {
          const attr = await this.upsertAttribute(k, tx);
          const val = await this.upsertAttributeValue(attr.id, String(combination[k]), tx);
          resolvedAttrs.push({ attr, val });
        }

        const suffixCode = resolvedAttrs.map(item => {
          const ac = item.attr.code || item.attr.name;
          const vc = item.val.code || item.val.name;
          return `${ac}${vc}`;
        }).join('-');

        const suffixName = resolvedAttrs.map(item => item.val.name).join(' ');
        const variantName = `${baseProduct.name} - ${suffixName}`;
        const variantCode = `${baseProduct.code}-${suffixCode}`.toUpperCase();
        const hash = this.buildVariantHash(combination);
        
        const existsByHash = await tx.productVariant.findFirst({ where: { productId, variantHash: hash } });
        if (existsByHash) {
          continue;
        }
        
        const created = await tx.productVariant.create({ 
          data: { 
            productId, 
            code: variantCode, 
            sku: variantCode, // 默认使用变体编码作为SKU
            name: variantName, 
            variantHash: hash, 
            isActive: true 
          } 
        });
        
        for (const item of resolvedAttrs) {
          await tx.variantAttributeValue.upsert({
            where: { variantId_attributeId: { variantId: created.id, attributeId: item.attr.id } },
            update: { attributeValueId: item.val.id },
            create: { variantId: created.id, attributeId: item.attr.id, attributeValueId: item.val.id },
          });
        }
        createdVariants.push(this.formatVariantLite(created, baseProduct));
      }
      return createdVariants;
    });
  }

  private generateCombinations(attributes: any): any[] {
    const keys = Object.keys(attributes);
    const combinations: any[] = [];
    const recursiveHelper = (index: number, currentCombination: any) => {
      if (index === keys.length) {
        combinations.push(currentCombination);
        return;
      }

      const key = keys[index];
      const values = attributes[key];

      for (const value of values) {
        const newCombination = { ...currentCombination, [key]: value };
        recursiveHelper(index + 1, newCombination);
      }
    };

    recursiveHelper(0, {});
    return combinations;
  }

  async updateVariant(productId: string, variantId: string, data: Partial<ProductVariant> & { variantAttributes?: Array<{ name: string; value: string }> }): Promise<ProductInfo> {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({ where: { id: variantId } });
      if (!variant || variant.productId !== productId) {
        throw new Error('Variant not found');
      }
      const updated = await tx.productVariant.update({ where: { id: variantId }, data: {
        name: data.name,
        sku: (data as any).sku,
        status: (data as any).status,
        barcode: (data as any).barcode,
        qrCode: (data as any).qrCode,
        standardPrice: (data as any).standardPrice,
        salePrice: (data as any).salePrice,
        purchasePrice: (data as any).purchasePrice,
        currency: (data as any).currency,
        minStock: (data as any).minStock,
        safetyStock: (data as any).safetyStock,
        maxStock: (data as any).maxStock,
        reorderPoint: (data as any).reorderPoint,
        updatedAt: new Date()
      } });
      const attrs = Array.isArray((data as any)?.variantAttributes) ? ((data as any).variantAttributes as Array<{ name: string; value: string }>) : []
      for (const item of attrs) {
        const attrName = String(item?.name || '').trim()
        const valName = String(item?.value || '').trim()
        if (!attrName || !valName) continue
        const attr = await this.upsertAttribute(attrName, tx)
        const val = await this.upsertAttributeValue(attr.id, valName, tx)
        await tx.variantAttributeValue.upsert({
          where: { variantId_attributeId: { variantId, attributeId: attr.id } },
          update: { attributeValueId: val.id },
          create: { variantId, attributeId: attr.id, attributeValueId: val.id },
        })
      }
      const baseProduct = await tx.product.findUnique({ where: { id: productId } });
      return this.formatVariantLite(updated, baseProduct as Product);
    });
  }

  async deleteVariant(productId: string, variantId: string): Promise<void> {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) {
      throw new Error('Variant not found');
    }
    await this.prisma.productVariant.delete({ where: { id: variantId } });
  }

  /**
   * 获取产品变体（分页）
   * 返回结构：{ data: ProductInfo[], pagination: { total, page, pageSize, totalPages } }
   */
  async getVariants(productId: string | undefined, queryParams: Partial<ProductQueryParams>) {
    const page = Number((queryParams as any).current ?? queryParams.page ?? 1) || 1;
    const pageSize = Number(queryParams.pageSize ?? (queryParams as any).limit ?? 20) || 20;
    const keyword = String(queryParams.keyword || queryParams.name || queryParams.code || '');
    const rawSortField = String(queryParams.sortField || 'updatedAt');
    const rawSortOrder = String(queryParams.sortOrder || 'desc');
    const sortOrder = rawSortOrder === 'ascend' ? 'asc' : rawSortOrder === 'descend' ? 'desc' : (rawSortOrder === 'asc' ? 'asc' : 'desc');
    const allowedSortFields = new Set(['updatedAt', 'createdAt', 'name', 'code', 'isActive']);
    const sortField = allowedSortFields.has(rawSortField) ? rawSortField : 'updatedAt';
    const attrFiltersRaw = ((queryParams as any)?.attributes) || {};
    const andFilters: any[] = [];
    for (const k of Object.keys(attrFiltersRaw)) {
      const v = (attrFiltersRaw as any)[k];
      const values = (Array.isArray(v) ? v : [v]).map((x) => String(x)).filter(Boolean);
      if (!values.length) continue;
      andFilters.push({
        attributeValues: {
          some: {
            attribute: { OR: [{ name: k }, { code: k }] },
            attributeValue: { name: { in: values } },
          },
        },
      });
    }
    const where: any = {
      ...(productId ? { productId } : {}),
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { code: { contains: keyword, mode: 'insensitive' } },
              { sku: { contains: keyword, mode: 'insensitive' } },
              { product: { name: { contains: keyword, mode: 'insensitive' } } },
            ],
          }
        : {}),
      ...(andFilters.length ? { AND: andFilters } : {}),
    };
    const total = await this.prisma.productVariant.count({ where });
    const items = await this.prisma.productVariant.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortField]: sortOrder as any },
      where,
      include: { 
        attributeValues: { include: { attribute: true, attributeValue: true } }, 
        variantStocks: false, // 移除库存关联查询，提升性能
        product: true // 必须关联 product 以支持全局查询时返回产品信息
      },
    });
    // 如果没有 productId，baseProduct 为 null，此时 formatVariantLite 内部需要处理
    const baseProduct = productId ? await this.prisma.product.findUnique({ where: { id: productId } }) : null;
    const variants: VariantInfo[] = items.map((v) => this.formatVariantLite(v, baseProduct || (v as any).product));
    return { data: variants, pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  /**
   * 精简版产品格式化（列表使用）
   */
  private buildVariantHash(attrs: Record<string, any>) {
    const keys = Object.keys(attrs).sort()
    if (keys.length === 0) return 'BASE'
    return keys.map(k => `${k}=${String(attrs[k])}`).join('|')
  }

  private async upsertAttribute(name: string, tx: any = this.prisma) {
    const raw = String(name || '').trim()
    let code = raw.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
    if (!code) code = raw || 'ATTR'
    let found = await tx.attribute.findFirst({ where: { OR: [ { code }, { AND: [{ name: raw }, { NOT: { code: '' } }] } ] } })
    if (!found) {
      // 如果按“非空 code 的同名”未找到，再尝试仅按名称匹配（兼容历史数据 code 为空的记录）
      found = await tx.attribute.findFirst({ where: { name: raw } })
    }
    if (found) return found
    return tx.attribute.create({ data: { name: raw || '属性', code } })
  }

  private async upsertAttributeValue(attributeId: string, name: string, tx: any = this.prisma) {
    const found = await tx.attributeValue.findFirst({ where: { attributeId, name } })
    if (found) return found
    
    let code = name.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
    if (!code) code = 'VAL'
    
    return tx.attributeValue.create({ data: { attributeId, name, code } })
  }

  private formatVariantLite(variant: ProductVariant & { attributeValues?: any[]; variantStocks?: any[] }, baseProduct: Product): VariantInfo {
    return {
      id: variant.id,
      code: variant.code,
      name: variant.name || `${baseProduct.name}`,
      productName: baseProduct.name,
      type: baseProduct.type as any,
      categoryId: baseProduct.categoryId as any,
      unitId: baseProduct.unitId as any,
      defaultWarehouseId: baseProduct.defaultWarehouseId || undefined,
      status: baseProduct.status as any,
      acquisitionMethod: baseProduct.acquisitionMethod as any,
      isActive: variant.isActive,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
      version: baseProduct.version ?? 1,
      parentId: baseProduct.id,
      // 扩展变体维度字段
      sku: (variant as any).sku,
      barcode: (variant as any).barcode,
      qrCode: (variant as any).qrCode,
      standardPrice: (variant as any).standardPrice,
      salePrice: (variant as any).salePrice,
      purchasePrice: (variant as any).purchasePrice,
      currency: (variant as any).currency,
      minStock: (variant as any).minStock,
      safetyStock: (variant as any).safetyStock,
      maxStock: (variant as any).maxStock,
      reorderPoint: (variant as any).reorderPoint,
      // currentStock: Array.isArray((variant as any).variantStocks) ? (variant as any).variantStocks.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0) : undefined,
      // reservedStock: Array.isArray((variant as any).variantStocks) ? (variant as any).variantStocks.reduce((sum: number, s: any) => sum + (s.reservedQuantity || 0), 0) : undefined,
      variantAttributes: Array.isArray(variant.attributeValues)
        ? variant.attributeValues.map((av: any) => ({ name: av.attribute?.name, value: av.attributeValue?.name }))
        : undefined,
    } as VariantInfo
  }
  async getVariantStock(productId: string, variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
    const stocks = await this.prisma.variantStock.findMany({ where: { variantId } });
    const currentStock = stocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const reservedStock = stocks.reduce((sum, s) => sum + (s.reservedQuantity || 0), 0);
    const availableStock = Math.max(0, currentStock - reservedStock);
    return { currentStock, reservedStock, availableStock };
  }

  async adjustVariantStock(productId: string, variantId: string, payload: { type: 'inbound' | 'outbound' | 'reserve' | 'release'; delta: number; warehouseId: string; unitId: string }) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
    const delta = Math.max(0, Number(payload.delta || 0));
    let stock = await this.prisma.variantStock.findFirst({ where: { variantId, warehouseId: payload.warehouseId } });
    if (!stock) {
      stock = await this.prisma.variantStock.create({ data: { variantId, warehouseId: payload.warehouseId, unitId: payload.unitId, quantity: 0, reservedQuantity: 0 } });
    }
    let quantity = stock.quantity;
    let reserved = stock.reservedQuantity;
    switch (payload.type) {
      case 'inbound':
        quantity += delta; break;
      case 'outbound':
        quantity = Math.max(0, quantity - delta); break;
      case 'reserve':
        reserved = Math.min(quantity, reserved + delta); break;
      case 'release':
        reserved = Math.max(0, reserved - delta); break;
    }
    await this.prisma.variantStock.update({ where: { id: stock.id }, data: { quantity, reservedQuantity: reserved, warehouseId: payload.warehouseId, unitId: payload.unitId } });
    return { success: true };
  }

  async listVariantImages(productId: string, variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
    const images = await this.prisma.variantImage.findMany({ where: { variantId }, orderBy: { sortOrder: 'asc' } });
    return images.map(img => ({ id: img.id, url: img.url, altText: img.altText || undefined, isPrimary: img.isPrimary, sortOrder: img.sortOrder }));
  }

  async uploadVariantImage(productId: string, variantId: string, body: any) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) throw new Error('Variant not found');
    const url = body?.url || body?.imageUrl;
    if (!url) throw new AppError('Image url is required', 400, 'IMAGE_URL_REQUIRED');
    const created = await this.prisma.variantImage.create({ data: { variantId, url, sortOrder: 0, isPrimary: false } });
    return { id: created.id, url: created.url };
  }

  async deleteVariantImage(productId: string, variantId: string, imageId: string) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) throw new AppError('Variant not found', 404, 'VARIANT_NOT_FOUND');
    const img = await this.prisma.variantImage.findUnique({ where: { id: imageId } });
    if (!img || img.variantId !== variantId) throw new AppError('Image not found', 404, 'IMAGE_NOT_FOUND');
    await this.prisma.variantImage.delete({ where: { id: imageId } });
    return { success: true };
  }
}