import { 
  ProductInfo
} from '@zyerp/shared';
import { BaseService } from '../../../../shared/services/base.service';

export class ProductBaseService extends BaseService {
  /**
   * 格式化产品数据
   */
  public formatProduct(product: any): ProductInfo {
    if (!product) return product;

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
      salePrice: product.salePrice ? Number(product.salePrice) : undefined,
      standardPrice: product.standardPrice ? Number(product.standardPrice) : undefined,
      purchasePrice: product.purchasePrice ? Number(product.purchasePrice) : undefined,
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
        isPrimary: image.isPrimary,
        sortOrder: image.sortOrder,
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
    } as ProductInfo;
  }

  /**
   * 清理未定义的属性
   */
  public cleanUndefined(obj: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  /**
   * 获取分页配置 (覆盖 BaseService，增加最大限制)
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
  public buildPaginatedResponse<T>(data: T[], total: number, page: number, pageSize: number) {
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
