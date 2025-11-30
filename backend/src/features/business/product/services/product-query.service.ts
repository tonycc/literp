import { 
  ProductInfo,
  ProductQueryParams
} from '@zyerp/shared';
import { ProductBaseService } from './product-base.service';

export class ProductQueryService extends ProductBaseService {
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
    // @ts-ignore - variantCount might not be in ProductInfo but we add it for frontend
    const formattedProducts = products.map(p => this.formatProduct(p)).map(p => ({ ...p, variantCount: countMap.get(p.id) || 0 }))
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
        },
        productVariants: true,
      },
    });

    if (!product) {
      return null;
    }

    return this.formatProduct(product);
  }

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
   * 获取产品变体列表
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
}
