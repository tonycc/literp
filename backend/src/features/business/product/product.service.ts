/**
 * 产品服务
 */

import { 
  ProductInfo, 
  ProductFormData,
  ProductQueryParams,
  ProductListResponse,
  ProductSpecification,
  SpecificationType,
  ProductImage,
  ProductDocument
} from '@zyerp/shared';
import { AppError } from '../../../shared/middleware/error';
import { BaseService } from '../../../shared/services/base.service';

export class ProductService extends BaseService {
  /**
   * 创建产品
   */
  async createProduct(data: ProductFormData, createdBy: string): Promise<ProductInfo> {
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
    } = data;
  
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
        safetyStock,
        safetyStockMin,
        safetyStockMax,
        minStock,
        maxStock,
        reorderPoint,
        remark,
        createdBy,
        updatedBy: createdBy,
        // 创建规格参数
        specifications: specifications ? {
          create: specifications.map(spec => ({
            name: spec.name,
            value: spec.value,
            unit: spec.unit,
            type: 'text', // 默认为文本类型
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
        }
      }
    });
   
    const formattedProduct = this.formatProduct(product);
    return formattedProduct;
  }

  /**
   * 获取产品列表
   */
  async getProducts(params: ProductQueryParams): Promise<ProductListResponse> {
    const { page, pageSize, keyword, name, type, categoryId, status, defaultWarehouseId } = params;
    const { skip, take } = this.getPaginationConfig(page, pageSize);

    // 构建查询条件
    const where: any = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { code: { contains: keyword } },
        { description: { contains: keyword } }
      ];
    }

    // 产品名称筛选
    if (name) {
      where.name = { contains: name };
    }

    // 产品类型筛选
    if (type) {
      where.type = type;
    }

    if (categoryId) {
      // categoryId 实际上是 category code，需要转换为实际的 ID
      const category = await this.prisma.productCategory.findUnique({
        where: { code: categoryId }
      });
      
      if (category) {
        where.categoryId = category.id;
      } else {
        // 如果找不到对应的类目，设置一个不存在的ID，确保查询结果为空
        where.categoryId = 'non-existent-category-id';
      }
    }

    if (status) {
      where.status = status;
    }

    if (defaultWarehouseId) {
      where.defaultWarehouseId = defaultWarehouseId;
    }

    // 构建排序条件
    const orderBy: any = {
      createdAt: 'desc'
    };

    // 查询数据
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
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
      }),
      this.prisma.product.count({ where })
    ]);

    const formattedProducts = products.map(product => this.formatProduct(product));

    // 使用getPaginationConfig返回的正确页码和页面大小
    const { page: currentPage, pageSize: currentPageSize } = this.getPaginationConfig(page, pageSize);
    const paginationResult = this.buildPaginatedResponse(
      formattedProducts,
      total,
      currentPage,
      currentPageSize
    );
    return {
      success: true,
      data: paginationResult.data,
      pagination: paginationResult.pagination,
      message: 'Products retrieved successfully',
      timestamp: new Date()
    };
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

    // 验证关联数据
    if (data.categoryId || data.unitId || data.defaultWarehouseId) {
      await this.validateRelatedData(data.categoryId, data.unitId, data.defaultWarehouseId);
    }

    // 更新产品基本信息
    const updateData: any = {
      ...this.cleanUndefined(data),
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
      const category = await this.prisma.productCategory.findUnique({
        where: { code: categoryId }
      });
      if (!category) {
        throw new AppError('Product category not found', 404, 'CATEGORY_NOT_FOUND');
      }
      if (!category.isActive) {
        throw new AppError('Product category is inactive', 400, 'CATEGORY_INACTIVE');
      }
      result.categoryId = category.id; // 返回实际的ID而不是code
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
}

export const productService = new ProductService();