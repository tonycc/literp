/**
 * 产品服务
 *///

import { 
  ProductInfo, 
  ProductFormData,
  ProductQueryParams,
  ProductSpecification,
  SpecificationType,
  ProductImage,
  ProductDocument
} from '@zyerp/shared';
import { AppError } from '../../../shared/middleware/error';
import { BaseService } from '../../../shared/services/base.service';
import type { Express } from 'express';

export class ProductService extends BaseService {
  /**
   * 创建产品
   */
  async createProduct(data: ProductFormData, createdBy: string): Promise<ProductInfo> {
    const productData = { ...data };

    const {
      name,
      code,
      description,
      categoryId,
      unitId,
      defaultWarehouseId,
      type,
      status,
      acquisitionMethod,
      specification,
      model,
      barcode,
      qrCode,
      standardCost,
      averageCost,
      latestCost,
      safetyStock,
      safetyStockMin,
      safetyStockMax,
      minStock,
      maxStock,
      reorderPoint,
      remark,
      specifications,
      images,
      documents,
      alternativeUnits
    } = productData;
  
    // 验证产品编码唯一性
    if (code) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { code }
      });
      if (existingProduct) {
        throw new AppError('Product code already exists', 400, 'PRODUCT_CODE_EXISTS');
      }
    } 

    // 验证关联数据并获取实际的ID
    const relatedIds = await this.validateRelatedData(categoryId, unitId, defaultWarehouseId);

    // 生成产品编码（如果未提供）
    const productCode = code || await this.generateProductCode(categoryId);

    // 创建产品
    const product = await this.prisma.product.create({
      data: {
        name,
        code: productCode,
        description,
        specification,
        model,
        barcode,
        qrCode,
        categoryId: relatedIds.categoryId,
        unitId: relatedIds.unitId,
        defaultWarehouseId: relatedIds.warehouseId,
        type: type || 'finished_product',
        status: status || 'active',
        acquisitionMethod: acquisitionMethod || 'production',
        standardCost,
        averageCost,
        latestCost,
        remark,
        
        
        createdBy,
        updatedBy: createdBy,
        // 创建规格参数
        specifications: specifications ? {
          create: specifications.map(spec => ({
            name: spec.name,
            value: spec.value,
            unit: spec.unit,
            type: spec.type, // 使用传入的类型
            sortOrder: spec.sortOrder || 0
          }))
        } : undefined,
        // 创建图片
        images: images ? {
          create: images.map((img, index) => ({
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder || index,
            isPrimary: index === 0 // 第一张图片设为主图
          }))
        } : undefined,
        // 创建文档
        documents: documents ? {
          create: documents.map((doc, index) => ({
            name: doc.name,
            url: doc.url,
            type: doc.type,
            size: doc.size,
            sortOrder: doc.sortOrder || index
          }))
        } : undefined,
        // 创建替代单位
        alternativeUnits: alternativeUnits ? {
          create: alternativeUnits.map(unit => ({
            unitId: unit.unitId,
            conversionRate: unit.conversionRate,
            isDefault: unit.isDefault || false
          }))
        } : undefined
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
        },
        productVariants: true
      }
    });
    const genRaw = (data as any)?.variantGenerateAttributes
    let hasVariantAttrs = false
    if (Array.isArray(genRaw)) {
      for (const item of genRaw) {
        const vals = Array.isArray(item?.values) ? item.values : []
        if (vals.length > 0) { hasVariantAttrs = true; break }
      }
    } else if (genRaw && typeof genRaw === 'object') {
      const entries = Object.entries(genRaw)
      for (const [, v] of entries) {
        const vals = Array.isArray(v) ? v : []
        if (vals.length > 0) { hasVariantAttrs = true; break }
      }
    }
    const autoCreate = String(process.env.AUTO_CREATE_FIRST_VARIANT || 'true') === 'true' && !hasVariantAttrs
    if (autoCreate) {
      const baseCode = `${product.code}-BASE`
      await this.prisma.productVariant.upsert({
        where: { code: baseCode },
        update: {},
        create: { productId: product.id, code: baseCode, name: `${product.name} - BASE`, variantHash: 'BASE', isActive: true },
      })
    }

    const attributeLines = (data as any)?.attributeLines as Array<{ attributeName: string; values: string[] }> | undefined
    if (Array.isArray(attributeLines) && attributeLines.length > 0) {
      for (const item of attributeLines) {
        const codeStr = String(item.attributeName || '').trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
        let attribute = await this.prisma.attribute.findUnique({ where: { code: codeStr } })
        if (!attribute) {
          attribute = await this.prisma.attribute.create({ data: { name: item.attributeName, code: codeStr } })
        }
        let line = await this.prisma.productAttributeLine.findUnique({ where: { productId_attributeId: { productId: product.id, attributeId: attribute.id } } })
        if (!line) {
          line = await this.prisma.productAttributeLine.create({ data: { productId: product.id, attributeId: attribute.id } })
        }
        const existing = await this.prisma.productAttributeLineValue.findMany({ where: { lineId: line.id } })
        const existingIds = new Set(existing.map(e => e.attributeValueId))
        const targetIds: string[] = []
        for (const v of item.values || []) {
          let val = await this.prisma.attributeValue.findFirst({ where: { attributeId: attribute.id, name: v } })
          if (!val) {
            val = await this.prisma.attributeValue.create({ data: { attributeId: attribute.id, name: v } })
          }
          targetIds.push(val.id)
          if (!existingIds.has(val.id)) {
            await this.prisma.productAttributeLineValue.create({ data: { lineId: line.id, attributeValueId: val.id } })
          }
        }
        for (const e of existing) {
          if (!targetIds.includes(e.attributeValueId)) {
            await this.prisma.productAttributeLineValue.delete({ where: { id: e.id } })
          }
        }
      }
    }

    const formattedProduct = this.formatProduct(product);
    return formattedProduct;
  }

  /**
   * 获取产品列表
   */
  async getProducts(params: ProductQueryParams): Promise<{
    data: ProductInfo[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    const {
      page,
      pageSize,
      sortField,
      sortOrder,
      code,
      name,
      type,
      status,
      isActive,
      
    } = params;

    const { skip, take, page: currentPage, pageSize: currentPageSize } = this.getPaginationConfig(page, pageSize);

    const where: any = {
      ...(code && { code: { contains: code, mode: 'insensitive' } }),
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(type && { type }),
      ...(status && { status }),
      ...(isActive !== undefined && { isActive }),
      
    };

    const orderBy = this.getOrderBy(sortField, sortOrder);

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          unit: true,
          defaultWarehouse: true,
          
        },
        skip,
        take,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);
    const ids = products.map(p => p.id)
    const variantCounts = await this.prisma.productVariant.groupBy({
      by: ['productId'],
      where: { productId: { in: ids } },
      _count: { productId: true },
    })
    const countMap = new Map<string, number>(variantCounts.map(v => [v.productId, v._count.productId]))
    const formattedProducts = products.map(this.formatProduct).map(p => ({ ...p, variantCount: countMap.get(p.id) || 0 }))
    return this.buildPaginatedResponse(formattedProducts, total, currentPage, currentPageSize);
  }

  /**
   * 获取排序参数
   */
  private getOrderBy(sortField?: string, sortOrder?: 'asc' | 'desc' | 'ascend' | 'descend'): any {
    if (!sortField || !sortOrder) {
      return { createdAt: 'desc' };
    }

    const order = sortOrder === 'ascend' ? 'asc' : sortOrder === 'descend' ? 'desc' : sortOrder;
    return { [sortField]: order };
  }

  /**
   * 根据ID获取产品
   */
  async getProductById(id: string): Promise<ProductInfo | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
        defaultWarehouse: true,
        specifications: true,
        alternativeUnits: { include: { unit: true } },
        images: true,
        documents: true,
        productVariants: true,
      },
    });

    if (!product) {
      return null;
    }

    return this.formatProduct(product);
  }

  /**
   * 根据编码获取产品
   */
  async getProductByCode(code: string): Promise<ProductInfo | null> {
    const product = await this.prisma.product.findUnique({
      where: { code },
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

    return product ? this.formatProduct(product) : null;
  }

  /**
   * 更新产品
   */
  async updateProduct(id: string, data: Partial<ProductFormData>, updatedBy: string): Promise<ProductInfo> {
    // 检查产品是否存在
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

    // 检查是否有关联的BOM或其他业务数据
    // TODO: 添加业务约束检查

    // 删除产品（级联删除相关数据）
    await this.prisma.product.delete({
      where: { id }
    });

    // TODO: 可以在这里添加删除日志记录
    // if (deletedBy) {
    //   await this.logDeletion(id, deletedBy);
    // }
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
    unitId: string; // unitId 是必需的
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

    // unitId 是必需的
    if (!unitId) {
      throw new AppError('Unit ID is required', 400, 'UNIT_ID_REQUIRED');
    }
    
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
    
    return result as {
      categoryId?: string;
      unitId: string;
      warehouseId?: string;
    };
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

  /**
   * 获取产品规格参数
   */
  async getProductSpecifications(productId: string): Promise<ProductSpecification[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        specifications: true
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product.specifications.map(spec => ({
      id: spec.id,
      productId: spec.productId,
      type: spec.type as SpecificationType,
      name: spec.name,
      value: spec.value,
      unit: spec.unit || undefined,
      options: spec.options || undefined,
      required: spec.required,
      sortOrder: spec.sortOrder,
      createdAt: spec.createdAt,
      updatedAt: spec.updatedAt
    }));
  }

  /**
   * 更新产品规格参数
   */
  async updateProductSpecifications(productId: string, specifications: Partial<ProductSpecification>[]): Promise<ProductSpecification[]> {
    // 验证产品是否存在
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // 删除现有规格参数
    await this.prisma.productSpecification.deleteMany({
      where: { productId }
    });

    // 创建新的规格参数
     const createdSpecs = await Promise.all(
       specifications.map(spec => 
         this.prisma.productSpecification.create({
           data: {
             productId,
             type: spec.type!,
             name: spec.name!,
             value: spec.value!,
             unit: spec.unit,
             options: spec.options,
             required: spec.required || false,
             sortOrder: spec.sortOrder || 0
           }
         })
       )
     );

     return createdSpecs.map(spec => ({
        id: spec.id,
        productId: spec.productId,
        type: spec.type as SpecificationType,
        name: spec.name,
        value: spec.value,
        unit: spec.unit || undefined,
        options: spec.options || undefined,
        required: spec.required,
        sortOrder: spec.sortOrder,
        createdAt: spec.createdAt,
        updatedAt: spec.updatedAt
      }));
  }

  /**
   * 获取产品图片
   */
  async getProductImages(productId: string): Promise<ProductImage[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product.images.map(image => ({
      id: image.id,
      productId: image.productId,
      url: image.url,
      altText: image.altText || undefined,
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt
    }));
  }

  /**
   * 添加产品图片
   */
  async addProductImage(productId: string, imageData: Partial<ProductImage>): Promise<ProductImage> {
    // 验证产品是否存在
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const createdImage = await this.prisma.productImage.create({
      data: {
        productId,
        url: imageData.url!,
        altText: imageData.altText,
        isPrimary: imageData.isPrimary || false,
        sortOrder: imageData.sortOrder || 0
      }
    });

    return {
      id: createdImage.id,
      productId: createdImage.productId,
      url: createdImage.url,
      altText: createdImage.altText || undefined,
      isPrimary: createdImage.isPrimary,
      sortOrder: createdImage.sortOrder,
      createdAt: createdImage.createdAt,
      updatedAt: createdImage.updatedAt
    };
  }

  /**
   * 删除产品图片
   */
  async deleteProductImage(productId: string, imageId: string): Promise<void> {
    const image = await this.prisma.productImage.findFirst({
      where: { 
        id: imageId,
        productId 
      }
    });

    if (!image) {
      throw new Error('Product image not found');
    }

    await this.prisma.productImage.delete({
      where: { id: imageId }
    });
  }

  /**
   * 获取产品文档
   */
  async getProductDocuments(productId: string): Promise<ProductDocument[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        documents: true
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product.documents.map(doc => ({
      id: doc.id,
      productId: doc.productId,
      name: doc.name,
      url: doc.url,
      type: doc.type || undefined,
      size: doc.size || undefined,
      sortOrder: doc.sortOrder,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));
  }

  /**
   * 添加产品文档
   */
  async addProductDocument(productId: string, documentData: Partial<ProductDocument>): Promise<ProductDocument> {
    // 验证产品是否存在
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const createdDocument = await this.prisma.productDocument.create({
      data: {
        productId,
        name: documentData.name!,
        url: documentData.url!,
        type: documentData.type,
        size: documentData.size,
        sortOrder: documentData.sortOrder || 0
      }
    });

    return {
      id: createdDocument.id,
      productId: createdDocument.productId,
      name: createdDocument.name,
      url: createdDocument.url,
      type: createdDocument.type || undefined,
      size: createdDocument.size || undefined,
      sortOrder: createdDocument.sortOrder,
      createdAt: createdDocument.createdAt,
      updatedAt: createdDocument.updatedAt
    };
  }

  /**
   * 删除产品文档
   */
  async deleteProductDocument(productId: string, documentId: string): Promise<void> {
    const document = await this.prisma.productDocument.findFirst({
      where: { 
        id: documentId,
        productId 
      }
    });

    if (!document) {
      throw new Error('Product document not found');
    }

    await this.prisma.productDocument.delete({
      where: { id: documentId }
    });
  }

  /**
   * 导出产品数据
   */
  async exportProducts(queryParams: ProductQueryParams, format: string): Promise<Buffer> {
    const products = await this.getProducts(queryParams);
    
    if (format === 'excel') {
      // 这里应该使用 xlsx 库生成 Excel 文件
      // 为了演示，返回一个简单的 CSV 格式
      const csvData = this.convertToCSV(products.data);
      return Buffer.from(csvData, 'utf-8');
    } else {
      // CSV 格式
      const csvData = this.convertToCSV(products.data);
      return Buffer.from(csvData, 'utf-8');
    }
  }

  /**
   * 导入产品数据
   */
  async importProducts(file: Express.Multer.File): Promise<{ success: number; failed: number; errors: string[] }> {
    // 显式标记参数使用以消除未使用变量诊断
    void file;
    // 这里应该解析上传的文件（Excel 或 CSV）
    // 为了演示，返回一个模拟结果
    return {
      success: 0,
      failed: 0,
      errors: ['Import functionality not implemented yet']
    };
  }

  /**
   * 获取导入模板
   */
  async getImportTemplate(format: string): Promise<Buffer> {
    const headers = [
      '产品名称', '产品类型', '产品分类', '计量单位', '状态', '获取方式',
      '产品编码', '产品简称', '型号', '条形码', '二维码', '标准成本',
      '平均成本', '最新成本', '安全库存', '最小库存', '最大库存', '再订货点',
      '产品描述', '备注'
    ];

    if (format === 'excel') {
      // 这里应该使用 xlsx 库生成 Excel 模板
      const csvData = headers.join(',') + '\n';
      return Buffer.from(csvData, 'utf-8');
    } else {
      // CSV 格式
      const csvData = headers.join(',') + '\n';
      return Buffer.from(csvData, 'utf-8');
    }
  }

  /**
   * 将产品数据转换为 CSV 格式
   */
  private convertToCSV(products: ProductInfo[]): string {
    const headers = [
      '产品编码', '产品名称', '产品类型', '产品分类', '计量单位', '产品规格', '型号', 
      '条形码', '二维码', '获取方式', '默认仓库', '状态', '标准成本', '平均成本', 
      '最新成本', '安全库存', '安全库存下限', '安全库存上限', '最小库存', '最大库存', 
      '再订货点', '产品描述', '备注', '是否启用', '创建时间', '更新时间'
    ];

    const rows = products.map(product => [
      product.code || '',
      product.name,
      product.type,
      '', // 产品分类名称需要通过关联查询获取
      product.unit?.name || '',
      product.specification || '',
      product.model || '',
      product.barcode || '',
      product.qrCode || '',
      product.acquisitionMethod,
      product.warehouse?.name || '',
      product.status,
      product.standardCost || '',
      product.averageCost || '',
      product.latestCost || '',
      product.safetyStock || '',
      product.safetyStockMin || '',
      product.safetyStockMax || '',
      product.minStock || '',
      product.maxStock || '',
      product.reorderPoint || '',
      product.description || '',
      product.remark || '',
      product.isActive ? '是' : '否',
      product.createdAt.toISOString(),
      product.updatedAt.toISOString()
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * 格式化产品数据
   */
  private formatProduct(product: any): ProductInfo {
    return {
      id: product.id,
      code: product.code,
      name: product.name,
      type: product.type,
      categoryId: product.categoryId,
      unitId: product.unitId,
      defaultWarehouseId: product.defaultWarehouseId,
      status: product.status,
      acquisitionMethod: product.acquisitionMethod,
      specification: product.specification,
      model: product.model,
      barcode: product.barcode,
      qrCode: product.qrCode,
      standardCost: product.standardCost,
      averageCost: product.averageCost,
      latestCost: product.latestCost,
      safetyStock: product.safetyStock,
      safetyStockMin: product.safetyStockMin,
      safetyStockMax: product.safetyStockMax,
      minStock: product.minStock,
      maxStock: product.maxStock,
      reorderPoint: product.reorderPoint,
      description: product.description,
      remark: product.remark,
      isActive: product.isActive,
      
      
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      createdBy: product.createdBy,
      updatedBy: product.updatedBy,
      version: product.version,
      unit: product.unit ? {
        id: product.unit.id,
        name: product.unit.name,
        symbol: product.unit.symbol,
        category: product.unit.category,
        precision: product.unit.precision,
        isActive: product.unit.isActive,
        createdAt: product.unit.createdAt,
        updatedAt: product.unit.updatedAt
      } : undefined,
      warehouse: product.defaultWarehouse ? {
        id: product.defaultWarehouse.id,
        code: product.defaultWarehouse.code,
        name: product.defaultWarehouse.name,
        type: product.defaultWarehouse.type,
        isActive: product.defaultWarehouse.isActive,
        createdAt: product.defaultWarehouse.createdAt,
        updatedAt: product.defaultWarehouse.updatedAt
      } : undefined,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        code: product.category.code,
        description: product.category.description,
        sortOrder: product.category.sortOrder,
        isActive: product.category.isActive,
        parentCode: product.category.parentCode,
        parentName: product.category.parentName,
        level: product.category.level,
        path: product.category.path,
        hasChildren: product.category.hasChildren,
        childrenCount: product.category.childrenCount,
        createdAt: product.category.createdAt,
        updatedAt: product.category.updatedAt,
        createdBy: product.category.createdBy,
        updatedBy: product.category.updatedBy,
        version: product.category.version
      } : undefined,
      variants: product.productVariants?.map((v: any) => ({
        id: v.id,
        code: v.code,
        name: v.name,
        type: product.type,
        categoryId: product.categoryId,
        unitId: product.unitId,
        defaultWarehouseId: product.defaultWarehouseId,
        status: product.status,
        acquisitionMethod: product.acquisitionMethod,
        isActive: v.isActive,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        version: product.version,
        parentId: product.id,
      })),
      specifications: product.specifications?.map((spec: any) => ({
        id: spec.id,
        productId: spec.productId,
        name: spec.name,
        value: spec.value,
        unit: spec.unit,
        type: spec.type,
        options: spec.options,
        required: spec.required,
        sortOrder: spec.sortOrder,
        createdAt: spec.createdAt,
        updatedAt: spec.updatedAt
      })),
      alternativeUnits: product.alternativeUnits?.map((altUnit: any) => ({
        id: altUnit.id,
        productId: altUnit.productId,
        unitId: altUnit.unitId,
        conversionRate: altUnit.conversionRate,
        isDefault: altUnit.isDefault,
        createdAt: altUnit.createdAt,
        updatedAt: altUnit.updatedAt,
        unit: altUnit.unit ? {
          id: altUnit.unit.id,
          name: altUnit.unit.name,
          symbol: altUnit.unit.symbol,
          category: altUnit.unit.category,
          precision: altUnit.unit.precision,
          isActive: altUnit.unit.isActive,
          createdAt: altUnit.unit.createdAt,
          updatedAt: altUnit.unit.updatedAt
        } : undefined
      })),
      images: product.images?.map((image: any) => ({
        id: image.id,
        productId: image.productId,
        url: image.url,
        altText: image.altText,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt
      })),
      documents: product.documents?.map((doc: any) => ({
        id: doc.id,
        productId: doc.productId,
        name: doc.name,
        url: doc.url,
        type: doc.type,
        size: doc.size,
        sortOrder: doc.sortOrder,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }))
    };
  }

  // ==================== 产品变体管理方法 ====================
  /**
   * 获取产品选项（用于下拉选择）
   */
  async getProductOptions(params: { keyword?: string; categoryId?: string; activeOnly?: boolean }): Promise<Array<{ id: string; code: string; name: string; specification?: string; unit?: { name: string; symbol: string }; primaryImageUrl?: string }>> {
    const where: any = {
      ...(params.keyword ? { OR: [
        { name: { contains: params.keyword, mode: 'insensitive' } },
        { code: { contains: params.keyword, mode: 'insensitive' } },
        { specification: { contains: params.keyword, mode: 'insensitive' } },
      ] } : {}),
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params.activeOnly !== undefined ? { isActive: params.activeOnly } : {}),
    };
    const rows = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        specification: true,
        unit: { select: { name: true, symbol: true } },
        images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
    return rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      specification: r.specification || undefined,
      unit: r.unit ? { name: r.unit.name, symbol: r.unit.symbol } : undefined,
      primaryImageUrl: r.images?.[0]?.url,
    }));
  }
  

  /**
   * 获取产品的变体列表（兼容适配重命名）
   */
  async getProductVariants(productId: string, params?: {
    page?: number;
    pageSize?: number;
    isActive?: boolean;
  }): Promise<{ data: ProductInfo[]; total: number }> {
    const { page = 1, pageSize = 20, isActive } = params || {};
    const total = await this.prisma.productVariant.count({ where: { productId, ...(isActive !== undefined ? { isActive } : {}) } });
    const items = await this.prisma.productVariant.findMany({ where: { productId, ...(isActive !== undefined ? { isActive } : {}) }, skip: (page - 1) * pageSize, take: pageSize, orderBy: { updatedAt: 'desc' } });
    const baseProduct = await this.prisma.product.findUnique({ where: { id: productId } });
    const data = items.map(v => ({
      id: v.id,
      code: v.code,
      name: v.name,
      type: baseProduct!.type,
      categoryId: baseProduct!.categoryId,
      unitId: baseProduct!.unitId,
      defaultWarehouseId: baseProduct!.defaultWarehouseId || undefined,
      status: baseProduct!.status,
      acquisitionMethod: baseProduct!.acquisitionMethod,
      isActive: v.isActive,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      version: baseProduct!.version ?? 1,
      parentId: baseProduct!.id,
    } as ProductInfo))
    return { data, total };
  }

  /**
   * 批量创建变体
   */
  

  /**
   * 按产品创建批量变体（兼容适配重命名）
   */
  async createVariantsBatchByProduct(
    productId: string,
    variants: Array<{
      name: string;
      code: string;
      variantAttributes: any[];
      priceAdjustment?: any;
      barcode?: string;
    }>,
  ): Promise<{ success: number; failed: number; variants: ProductInfo[] }> {
    const base = await this.prisma.product.findUnique({ where: { id: productId } });
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
        const existByHash = await this.prisma.productVariant.findFirst({ where: { productId, variantHash: hash } })
        if (existByHash) { results.failed++; continue }
        const existByCode = await this.prisma.productVariant.findFirst({ where: { code } })
        if (existByCode) { results.failed++; continue }
        const variant = await this.prisma.productVariant.create({ data: { productId, code, name, variantHash: hash, isActive: true } })
        for (const a of attrsNorm) {
          const raw = a.name.trim()
          let attrCode = raw.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
          if (!attrCode) attrCode = raw || 'ATTR'
          let attr = await this.prisma.attribute.findFirst({ where: { OR: [ { code: attrCode }, { AND: [{ name: raw }, { NOT: { code: '' } }] } ] } })
          if (!attr) {
            // 兼容历史存在 code 为空但同名的记录
            attr = await this.prisma.attribute.findFirst({ where: { name: raw } })
          }
          if (!attr) {
            attr = await this.prisma.attribute.create({ data: { name: raw || '属性', code: attrCode } })
          }
          let val = await this.prisma.attributeValue.findFirst({ where: { attributeId: attr.id, name: a.value } })
          if (!val) {
            val = await this.prisma.attributeValue.create({ data: { attributeId: attr.id, name: a.value } })
          }
          await this.prisma.variantAttributeValue.upsert({
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
   * 预览变体组合
   */
  

  /**
   * 预览产品变体组合（兼容适配重命名）
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
   * 生成笛卡尔积组合
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

  async createProductWithVariants(
    data: any,
    createdBy: string
  ): Promise<{ product: any; variants: any[] }> {
    const product = await this.createProduct(data, createdBy);
    const variantsCreated: any[] = [];
    const gen = data?.variantGenerateAttributes;
    if (gen && product?.id) {
      let attributesMap: Record<string, string[]> | null = null;
      if (Array.isArray(gen)) {
        attributesMap = {};
        for (const item of gen) {
          const k = String(item?.attributeName || '').trim();
          const vals = Array.isArray(item?.values) ? item.values.map((v: any) => String(v)) : [];
          if (k && vals.length) attributesMap[k] = vals;
        }
      } else if (typeof gen === 'object' && gen) {
        attributesMap = Object.fromEntries(Object.entries(gen).map(([k, v]) => [String(k), (Array.isArray(v) ? v : []).map((x) => String(x))]));
      }
      if (attributesMap && Object.keys(attributesMap).length > 0) {
        const pv = new (require('../product-variants/product-variants.service').ProductVariantsService)();
        const created = await pv.generateVariants(product.id, attributesMap, createdBy);
        variantsCreated.push(...created);
      }
    }
    const manual = Array.isArray(data?.variants) ? data.variants : [];
    if (manual.length && product?.id) {
      const result = await this.createVariantsBatchByProduct(product.id, manual as any);
      variantsCreated.push(...(result?.variants || []));
    }
    return { product, variants: variantsCreated };
  }

  /**
   * 格式化产品响应数据
   */
  private formatProductResponse(product: any): ProductInfo {
    return this.formatProduct(product);
  }

  /**
   * 清理未定义的属性
   */
  protected cleanUndefined(obj: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  /**
   * 获取分页配置
   */
  public getPaginationConfig(page?: number, pageSize?: number): { skip: number; take: number; page: number; pageSize: number } {
    const currentPage = Math.max(1, Number(page) || 1);
    const currentPageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (currentPage - 1) * currentPageSize;

    return {
      skip,
      take: currentPageSize,
      page: currentPage,
      pageSize: currentPageSize
    };
  }

  /**
   * 构建分页响应
   */
  public buildPaginatedResponse<T>(data: T[], total: number, page: number, pageSize: number): {
    data: T[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  } {
    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1
      }
    };
  }
}

export const productService = new ProductService();
