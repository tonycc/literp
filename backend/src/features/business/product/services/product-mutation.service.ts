import { Prisma } from '@prisma/client';
import { 
  ProductInfo
} from '@zyerp/shared';
import { AppError } from '../../../../shared/middleware/error';
import { ProductBaseService } from './product-base.service';
import { ProductVariantService } from './product-variant.service';

export class ProductMutationService extends ProductBaseService {
  private variantService = new ProductVariantService();

  /**
   * 创建产品
   */
  async createProduct(data: any, createdBy: string, tx?: Prisma.TransactionClient): Promise<ProductInfo> {
    const db = tx || this.prisma;
    console.log('ProductMutationService.createProduct called with:', JSON.stringify(data));
    try {
      // 验证必填字段
      if (!data.name) {
        throw new AppError('Product name is required', 400, 'PRODUCT_NAME_REQUIRED');
      }
      if (!data.type) {
        throw new AppError('Product type is required', 400, 'PRODUCT_TYPE_REQUIRED');
      }

      // 验证 SKU 唯一性
      if (data.sku) {
        const skuExists = await db.productVariant.findFirst({
          where: { sku: data.sku }
        });
        if (skuExists) {
          throw new AppError('Product SKU already exists', 400, 'PRODUCT_SKU_EXISTS');
        }
      }

      // 验证并规范化关联外键为实际ID
      // 始终验证，因为 unitId 是必需的
      console.log('Validating related data...');
      const ids = await this.validateRelatedData(data.categoryId, data.unitId, data.defaultWarehouseId)
      const normalizedCategoryId = ids.categoryId
      const normalizedUnitId = ids.unitId
      const normalizedWarehouseId = ids.warehouseId

      if (!normalizedUnitId) {
        throw new AppError('Unit ID is required', 400, 'UNIT_ID_REQUIRED');
      }

      // 自动生成产品编码（如果未提供）
      let code = data.code;
      if (!code) {
        console.log('Generating product code...');
        code = await this.generateProductCode(normalizedCategoryId);
      } else {
        // 检查编码是否已存在
        console.log('Checking product code availability...');
        const isCodeAvailable = await this.checkProductCode(code);
        if (!isCodeAvailable) {
          throw new AppError('Product code already exists', 400, 'PRODUCT_CODE_EXISTS');
        }
      }

      const createData: any = {
        ...this.cleanUndefined({
          ...data,
          code,
          categoryId: normalizedCategoryId, // 可能为 undefined，cleanUndefined 会处理
          unitId: normalizedUnitId,         // 肯定是 string
          defaultWarehouseId: normalizedWarehouseId // 可能为 undefined
        }),
        createdBy,
        updatedBy: createdBy
      };

    // 移除嵌套关系数据，这些需要单独处理
    delete createData.specifications;
    delete createData.images;
    delete createData.documents;
    delete createData.alternativeUnits;
    delete createData.variants; // 变体单独处理
    delete createData.attributeLines; // 属性行单独处理
    delete createData.variantGenerateAttributes; // 变体生成属性单独处理
    delete createData.sku; // SKU属于变体，不属于产品
    
    // 移除变体维度的价格和库存字段
    delete createData.salePrice;
    delete createData.standardPrice;
    delete createData.purchasePrice;
    delete createData.safetyStock;
    delete createData.minStock;
    delete createData.maxStock;
    delete createData.reorderPoint;
    delete createData.currency;
    delete createData.safetyStockMin;
    delete createData.safetyStockMax;

    // 移除可能的其他前端临时字段
    delete createData.current;
    delete createData.pageSize;
    delete createData.total;
    delete createData.singleAttributeId;
    delete createData.singleAttributeName;
    delete createData.singleAttributeValue;
    delete createData.categoryCode;
    delete createData.images;
    delete createData.documents;
    delete createData.specifications;
    delete createData.alternativeUnits;
    delete createData.unitName;
    delete createData.categoryName;

    // 提取价格和库存信息用于首个变体
    const { 
      salePrice, 
      standardPrice, 
      purchasePrice, 
      safetyStock, 
      minStock, 
      maxStock, 
      reorderPoint,
      sku
    } = data;

    console.log('Creating product base record...', JSON.stringify(createData));
    const product = await db.product.create({
      data: createData,
      include: {
        category: true,
        unit: true,
        defaultWarehouse: true,
        specifications: true,
        images: true,
        documents: true,
        alternativeUnits: {
          include: {
            unit: true
          }
        }
      }
    });
    console.log('Product base record created:', product.id);

    // 处理规格参数
    if (data.specifications && Array.isArray(data.specifications)) {
      console.log('Processing specifications...');
      for (const spec of data.specifications) {
        await db.productSpecification.create({
          data: {
            productId: product.id,
            type: spec.type || 'text',
            name: spec.name,
            value: spec.value,
            unit: spec.unit,
            options: spec.options,
            required: spec.required || false,
            sortOrder: spec.sortOrder || 0
          }
        });
      }
    }

    // 处理多单位
    if (data.alternativeUnits && Array.isArray(data.alternativeUnits)) {
      console.log('Processing alternative units...');
      for (const altUnit of data.alternativeUnits) {
        if (altUnit.unitId) {
          await db.productAlternativeUnit.create({
            data: {
              productId: product.id,
              unitId: altUnit.unitId,
              conversionRate: altUnit.conversionRate || 1,
              isDefault: altUnit.isDefault || false
            }
          });
        }
      }
    }

    // 处理图片
    if (data.images && Array.isArray(data.images)) {
      console.log('Processing images...');
      for (const image of data.images) {
        const imageUrl = image.url || (image.response && image.response.url);
        if (!imageUrl) {
          console.warn('Skipping image without URL:', JSON.stringify(image));
          continue;
        }
        await db.productImage.create({
          data: {
            productId: product.id,
            url: imageUrl,
            altText: image.altText || image.name,
            isPrimary: image.isPrimary || false,
            sortOrder: image.sortOrder || 0
          }
        });
      }
    }

    // 处理文档
    if (data.documents && Array.isArray(data.documents)) {
      console.log('Processing documents...');
      for (const doc of data.documents) {
        const docUrl = doc.url || (doc.response && doc.response.url);
        if (!docUrl) {
            console.warn('Skipping document without URL:', JSON.stringify(doc));
            continue;
        }
        await db.productDocument.create({
          data: {
            productId: product.id,
            name: doc.name,
            url: docUrl,
            type: doc.type,
            size: doc.size,
            sortOrder: doc.sortOrder || 0
          }
        });
      }
    }

    // 处理属性行和变体生成属性
    console.log('Processing variant attributes...');
    const genRaw = (data as any)?.variantGenerateAttributes
    if (Array.isArray(genRaw)) {
      for (const item of genRaw) {
        const vals = Array.isArray(item?.values) ? item.values : []
        if (vals.length > 0) { break }
      }
    } else if (genRaw && typeof genRaw === 'object') {
      const entries = Object.entries(genRaw)
      for (const [, v] of entries) {
        const vals = Array.isArray(v) ? v : []
        if (vals.length > 0) { break }
      }
    }

    const attributeLines = (data as any)?.attributeLines as Array<{ attributeName: string; values: string[] }> | undefined
    const variantAttributes: Array<{ name: string; values: string[] }> = []
    if (Array.isArray(attributeLines) && attributeLines.length > 0) {
      for (const item of attributeLines) {
        let codeStr = String(item.attributeName || '').trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
        if (!codeStr) codeStr = (item.attributeName || 'ATTR').toUpperCase()
        
        let attribute = await db.attribute.findUnique({ where: { code: codeStr } })
        if (!attribute) {
          // Try to find by name if code not found, to avoid duplicates
          const nameMatch = await db.attribute.findFirst({ where: { name: item.attributeName } })
          if (nameMatch) {
             attribute = nameMatch
          } else {
             attribute = await db.attribute.create({ data: { name: item.attributeName, code: codeStr } })
          }
        }
        let line = await db.productAttributeLine.findUnique({ where: { productId_attributeId: { productId: product.id, attributeId: attribute.id } } })
        if (!line) {
          line = await db.productAttributeLine.create({ data: { productId: product.id, attributeId: attribute.id } })
        }
        const existing = await db.productAttributeLineValue.findMany({ where: { lineId: line.id } })
        const existingIds = new Set(existing.map(e => e.attributeValueId))
        const targetIds: string[] = []
        for (const v of item.values || []) {
          let val = await db.attributeValue.findFirst({ where: { attributeId: attribute.id, name: v } })
          if (!val) {
            val = await db.attributeValue.create({ data: { attributeId: attribute.id, name: v } })
          }
          targetIds.push(val.id)
          if (!existingIds.has(val.id)) {
            await db.productAttributeLineValue.create({ data: { lineId: line.id, attributeValueId: val.id } })
          }
        }
        for (const e of existing) {
          if (!targetIds.includes(e.attributeValueId)) {
            await db.productAttributeLineValue.delete({ where: { id: e.id } })
          }
        }
        if (item.values && item.values.length > 0) {
          variantAttributes.push({ name: item.attributeName, values: item.values })
        }
      }
    }

    // 统一产品变体创建逻辑
    const hasManualVariants = Array.isArray(data.variants) && data.variants.length > 0;
    const autoCreate = String(process.env.AUTO_CREATE_FIRST_VARIANT || 'true') === 'true'
    const variantsToCreate: Array<{ suffix: string; nameSuffix: string; hash: string; combo?: Array<{ name: string; value: string }> }> = []

    // 如果有手动指定的变体，则跳过自动生成逻辑
    if (!hasManualVariants) {
      if (variantAttributes.length > 0) {
        // 使用 ProductVariantService 中的生成逻辑
        const combinations = this.variantService.generateAttributeCombinations(variantAttributes)
        for (const combo of combinations) {
          variantsToCreate.push({
            suffix: combo.map(c => c.value).join('-'),
            nameSuffix: combo.map(c => c.value).join(' '),
            hash: combo.map(c => c.value).join('-'),
            combo
          })
        }
      } else if (autoCreate) {
        // 无属性且允许自动创建 -> 创建 BASE 变体
        variantsToCreate.push({
          suffix: 'BASE',
          nameSuffix: '',
          hash: 'BASE'
        })
      }
    }

    console.log(`Creating ${variantsToCreate.length} variants...`);
    for (const v of variantsToCreate) {
      // 生成变体编码和SKU
      const variantCode = v.suffix === 'BASE' 
        ? `${product.code}-BASE` 
        : `${product.code}-${v.suffix}`.toUpperCase()

      let variantSku = ''
      if (sku) {
        variantSku = v.suffix === 'BASE' ? sku : `${sku}-${v.suffix}`
      } else {
        variantSku = v.suffix === 'BASE' ? product.code : variantCode
      }

      const variantName = v.nameSuffix ? `${product.name} ${v.nameSuffix}` : product.name

      const existingVariant = await db.productVariant.findUnique({ where: { code: variantCode } })
      
      if (!existingVariant) {
        console.log(`Creating variant: ${variantCode}`);
        const createdVariant = await db.productVariant.create({
          data: {
            productId: product.id,
            code: variantCode,
            sku: variantSku,
            name: variantName,
            variantHash: v.hash,
            isActive: true,
            salePrice: salePrice,
            standardPrice: standardPrice,
            purchasePrice: purchasePrice,
            safetyStock: safetyStock,
            minStock: minStock,
            maxStock: maxStock,
            reorderPoint: reorderPoint
          }
        })

        // 创建变体属性值关联
        if (v.combo && v.combo.length > 0) {
          for (const item of v.combo) {
            let codeStr = String(item.name || '').trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
            if (!codeStr) codeStr = (item.name || 'ATTR').toUpperCase()
            
            let attribute = await db.attribute.findUnique({ where: { code: codeStr } })
            if (!attribute) {
               attribute = await db.attribute.findFirst({ where: { name: item.name } })
            }
            
            if (attribute) {
              let attributeValue = await db.attributeValue.findFirst({
                where: { attributeId: attribute.id, name: item.value }
              })
              if (!attributeValue) {
                attributeValue = await db.attributeValue.create({
                  data: { attributeId: attribute.id, name: item.value }
                })
              }
              await db.variantAttributeValue.create({
                data: {
                  variantId: createdVariant.id,
                  attributeId: attribute.id,
                  attributeValueId: attributeValue.id
                }
              })
            }
          }
        }
      }
    }

    const formattedProduct = this.formatProduct(product);
    console.log('Product creation completed successfully');
    return formattedProduct;
    } catch (error) {
      console.error('ProductMutationService.createProduct failed:', error);
      throw error;
    }
  }

  /**
   * 更新产品
   */
  async updateProduct(id: string, data: any, updatedBy: string): Promise<ProductInfo> {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // 验证产品编码唯一性（如果更新了编码）
    if (data.code && data.code !== existingProduct.code) {
      const codeExists = await this.prisma.product.findUnique({
        where: { code: data.code }
      });
      if (codeExists) {
        throw new AppError('Product code already exists', 400, 'PRODUCT_CODE_EXISTS');
      }
    }

    // 验证并规范化关联外键为实际ID
    let normalizedCategoryId: string | undefined
    let normalizedUnitId: string | undefined
    let normalizedWarehouseId: string | undefined
    if (data.categoryId || data.unitId || data.defaultWarehouseId) {
      const ids = await this.validateRelatedData(data.categoryId, data.unitId, data.defaultWarehouseId)
      normalizedCategoryId = ids.categoryId
      normalizedUnitId = ids.unitId
      normalizedWarehouseId = ids.warehouseId
    }

    // 更新产品基本信息
    const updateData: any = {
      ...this.cleanUndefined({
        ...data,
        ...(normalizedCategoryId ? { categoryId: normalizedCategoryId } : {}),
        ...(normalizedUnitId ? { unitId: normalizedUnitId } : {}),
        ...(normalizedWarehouseId ? { defaultWarehouseId: normalizedWarehouseId } : {}),
      }),
      updatedBy,
      updatedAt: new Date()
    };

    // 移除嵌套关系数据，这些需要单独处理
    delete updateData.specifications;
    delete updateData.images;
    delete updateData.documents;
    delete updateData.alternativeUnits;
    delete updateData.sku; // SKU属于变体，不属于产品

    // 移除变体维度的价格和库存字段
    delete updateData.salePrice;
    delete updateData.standardPrice;
    delete updateData.purchasePrice;
    delete updateData.safetyStock;
    delete updateData.minStock;
    delete updateData.maxStock;
    delete updateData.reorderPoint;
    delete updateData.currency;
    delete updateData.safetyStockMin;
    delete updateData.safetyStockMax;

    // 移除可能的其他前端临时字段
    delete updateData.current;
    delete updateData.pageSize;
    delete updateData.total;


    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        unit: true,
        defaultWarehouse: true,
        specifications: true,
        images: true,
        documents: true,
        alternativeUnits: {
          include: {
            unit: true
          }
        }
      }
    });

    return this.formatProduct(product);
  }

  /**
   * 删除产品
   */
  async deleteProduct(id: string, deletedBy?: string): Promise<void> {
    // 显式标记参数使用以消除未使用变量诊断
    void deletedBy;
    const product = await this.prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // 删除产品（级联删除相关数据）
    await this.prisma.product.delete({
      where: { id }
    });
  }

  /**
   * 切换产品状态
   */
  async toggleProductStatus(id: string, updatedBy: string): Promise<ProductInfo> {
    const product = await this.prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    const newStatus = product.status === 'active' 
      ? 'inactive' 
      : 'active';

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        status: newStatus,
        updatedBy,
        updatedAt: new Date()
      },
      include: {
        category: true,
        unit: true,
        defaultWarehouse: true,
        specifications: true,
        images: true,
        documents: true,
        alternativeUnits: {
          include: {
            unit: true
          }
        }
      }
    });

    return this.formatProduct(updatedProduct);
  }

  /**
   * 批量更新产品状态
   */
  async batchUpdateStatus(
    productIds: string[],
    status: 'active' | 'inactive'
  ): Promise<{ success: number; failed: number }> {
    const results = {
      success: 0,
      failed: 0
    };

    for (const productId of productIds) {
      try {
        const product = await this.prisma.product.findUnique({
          where: { id: productId }
        });

        if (!product) {
          results.failed++;
          continue;
        }

        await this.prisma.product.update({
          where: { id: productId },
          data: {
            status,
            updatedAt: new Date()
          }
        });

        results.success++;
      } catch (error) {
        console.error(`Error updating product ${productId}:`, error);
        results.failed++;
      }
    }

    return results;
  }

  /**
   * 批量删除产品
   */
  async batchDelete(productIds: string[]): Promise<{ success: number; failed: number }> {
    const results = {
      success: 0,
      failed: 0
    };

    for (const productId of productIds) {
      try {
        const product = await this.prisma.product.findUnique({
          where: { id: productId }
        });

        if (!product) {
          results.failed++;
          continue;
        }

        // 检查是否有关联变体
        const variantsCount = await this.prisma.productVariant.count({ where: { productId } })
        if (variantsCount > 0) {
          console.warn(`Product ${productId} has variants, skipping deletion`);
          results.failed++;
          continue;
        }

        await this.prisma.product.delete({
          where: { id: productId }
        });

        results.success++;
      } catch (error) {
        console.error(`Error deleting product ${productId}:`, error);
        results.failed++;
      }
    }

    return results;
  }

  /**
   * 生成产品编码
   */
  private async generateProductCode(categoryId?: string): Promise<string> {
    let prefix = 'P';
    
    if (categoryId) {
      const category = await this.prisma.productCategory.findUnique({
        where: { id: categoryId }
      });
      if (category) {
        prefix = category.code;
      }
    }

    // 获取当前最大编号
    const lastProduct = await this.prisma.product.findFirst({
      where: {
        code: {
          startsWith: prefix
        }
      },
      orderBy: {
        code: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastProduct) {
      const match = lastProduct.code.match(new RegExp(`^${prefix}(\\d+)$`));
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * 验证关联数据
   */
  private async validateRelatedData(categoryId?: string, unitId?: string, warehouseId?: string): Promise<{
    categoryId?: string;
    unitId?: string;
    warehouseId?: string;
  }> {
    const result: { categoryId?: string; unitId?: string; warehouseId?: string } = {};
    
    if (categoryId) {
      let category = await this.prisma.productCategory.findUnique({ where: { id: categoryId } });
      if (!category) {
        category = await this.prisma.productCategory.findUnique({ where: { code: categoryId } });
      }
      if (!category) {
        throw new AppError('Product category not found', 404, 'CATEGORY_NOT_FOUND');
      }
      if (!category.isActive) {
        throw new AppError('Product category is inactive', 400, 'CATEGORY_INACTIVE');
      }
      result.categoryId = category.id; // 返回实际的ID
    }

    if (unitId) {
      const unit = await this.prisma.unit.findUnique({
        where: { id: unitId }
      });
      if (!unit) {
        throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
      }
      if (!unit.isActive) {
        throw new AppError('Unit is inactive', 400, 'UNIT_INACTIVE');
      }
      result.unitId = unit.id;
    }

    if (warehouseId) {
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: warehouseId }
      });
      if (!warehouse) {
        throw new AppError('Warehouse not found', 404, 'WAREHOUSE_NOT_FOUND');
      }
      if (!warehouse.isActive) {
        throw new AppError('Warehouse is inactive', 400, 'WAREHOUSE_INACTIVE');
      }
      result.warehouseId = warehouse.id;
    }
    
    return result;
  }

  /**
   * 检查产品编码是否可用
   */
  async checkProductCode(code: string): Promise<boolean> {
    const existingProduct = await this.prisma.product.findFirst({
      where: { code }
    });
    return !existingProduct;
  }
}
