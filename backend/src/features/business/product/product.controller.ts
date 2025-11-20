import type { Request, Response } from 'express';
import { ProductService } from './product.service';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';
import type { ProductFormData, ProductQueryParams } from '@zyerp/shared';

/**
 * 产品控制器
 */
export class ProductController extends BaseController {
  private productService: ProductService;

  constructor() {
    super();
    this.productService = new ProductService();
  }

  /**
   * 创建产品
   */
  @ErrorHandler
  async createProduct(req: Request, res: Response): Promise<void> {
    const data: ProductFormData = req.body;
    const userId = this.getUserId(req);
    const product = await this.productService.createProduct(data, userId);
    
    this.success(res, product, '产品创建成功');
  }

  @ErrorHandler
  async createProductWithVariants(req: Request, res: Response): Promise<void> {
    const data: ProductFormData & { variants?: Array<{ name: string; code: string; barcode?: string; variantAttributes?: Array<{ name: string; value: string }> }>; variantGenerateAttributes?: Record<string, string[]> | Array<{ attributeName: string; values: string[] }> } = req.body as any;
    const userId = this.getUserId(req);
    const result = await this.productService.createProductWithVariants(data as any, userId);
    this.success(res, result, '产品及变体创建成功');
  }

  /**
   * 获取产品列表
   */
  @ErrorHandler
  async getProducts(req: Request, res: Response): Promise<void> {
    const paginationParams = this.parsePaginationParams(req);
    const params: ProductQueryParams = {
      page: paginationParams.page,
      pageSize: paginationParams.limit,
      keyword: req.query.keyword as string,
      code: req.query.code as string,
      name: req.query.name as string,
      type: req.query.type as any,
      categoryId: req.query.categoryId as string,
      unitId: req.query.unitId as string,
      defaultWarehouseId: req.query.defaultWarehouseId as string,
      status: req.query.status as any,
      acquisitionMethod: req.query.acquisitionMethod as any,
      isActive: this.parseBooleanParam(req.query.isActive),
      sortField: req.query.sortField as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc'
    };

    const result = await this.productService.getProducts(params);
    
    this.success(res, result);
  }

  /**
   * 根据ID获取产品详情
   */
  @ErrorHandler
  async getProductById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const product = await this.productService.getProductById(id);
    
    this.success(res, product, '获取产品详情成功');
  }

  /**
   * 根据编码获取产品详情
   */
  @ErrorHandler
  async getProductByCode(req: Request, res: Response): Promise<void> {
    const { code } = req.params;
    
    const product = await this.productService.getProductByCode(code);
    
    this.success(res, product, '获取产品详情成功');
  }

  /**
   * 获取产品选项（用于下拉选择）
   */
  @ErrorHandler
  async getProductOptions(req: Request, res: Response): Promise<void> {
    const params = {
      keyword: req.query.keyword as string,
      categoryId: req.query.categoryId as string,
      activeOnly: this.parseBooleanParam(req.query.activeOnly),
    };
    const options = await this.productService.getProductOptions(params);
    this.success(res, options, '获取产品选项成功');
  }

  /**
   * 更新产品
   */
  @ErrorHandler
  async updateProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const data: Partial<ProductFormData> = req.body;
    const userId = this.getUserId(req);
    
    const product = await this.productService.updateProduct(id, data, userId);
    
    this.success(res, product, '产品更新成功');
  }

  /**
   * 删除产品
   */
  @ErrorHandler
  async deleteProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = this.getUserId(req);
    
    await this.productService.deleteProduct(id, userId);
    
    this.success(res, null, '产品删除成功');
  }

  /**
   * 切换产品状态
   */
  @ErrorHandler
  async toggleProductStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = this.getUserId(req);
    
    const product = await this.productService.toggleProductStatus(id, userId);
    
    this.success(res, product, '产品状态切换成功');
  }

  /**
   * 批量删除产品
   */
  @ErrorHandler
  async batchDeleteProducts(req: Request, res: Response): Promise<void> {
    const { ids } = req.body;
    const userId = this.getUserId(req);
    
    if (!Array.isArray(ids) || ids.length === 0) {
      this.error(res, '请提供要删除的产品ID列表', '参数错误');
      return;
    }
    
    for (const id of ids) {
      await this.productService.deleteProduct(id, userId);
    }
    
    this.success(res, null, `成功删除 ${ids.length} 个产品`);
  }

  /**
   * 批量更新产品状态
   */
  @ErrorHandler
  async batchUpdateProductStatus(req: Request, res: Response): Promise<void> {
    const { ids, status } = req.body;
    const userId = this.getUserId(req);
    
    if (!Array.isArray(ids) || ids.length === 0) {
      this.error(res, '请提供要更新的产品ID列表', '参数错误');
      return;
    }
    
    if (!status) {
      this.error(res, '请提供要更新的状态', '参数错误');
      return;
    }
    
    const results = [];
    for (const id of ids) {
      const product = await this.productService.updateProduct(id, { status }, userId);
      results.push(product);
    }
    
    this.success(res, results, `成功更新 ${ids.length} 个产品状态`);
  }

  /**
   * 检查产品编码是否可用
   */
  @ErrorHandler
  async checkProductCode(req: Request, res: Response): Promise<void> {
    const { code } = req.params;
    const { excludeId } = req.query;
    
    try {
      const existingProduct = await this.productService.getProductByCode(code);
      
      // 如果找到产品且不是要排除的产品，则编码不可用
      if (existingProduct && existingProduct.id !== excludeId) {
        this.success(res, { available: false }, '产品编码已存在');
      } else {
        this.success(res, { available: true }, '产品编码可用');
      }
    } catch (error) {
      // 如果没找到产品，则编码可用
      this.success(res, { available: true }, '产品编码可用');
    }
  }

  /**
   * 获取产品规格参数
   */
  @ErrorHandler
  async getProductSpecifications(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const specifications = await this.productService.getProductSpecifications(id);
    this.success(res, specifications, '获取产品规格参数成功');
  }

  /**
   * 更新产品规格参数
   */
  @ErrorHandler
  async updateProductSpecifications(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const specifications = req.body.specifications;
    const result = await this.productService.updateProductSpecifications(id, specifications);
    this.success(res, result, '更新产品规格参数成功');
  }

  /**
   * 获取产品图片
   */
  @ErrorHandler
  async getProductImages(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const images = await this.productService.getProductImages(id);
    this.success(res, images, '获取产品图片成功');
  }

  /**
   * 上传产品图片
   */
  @ErrorHandler
  async uploadProductImage(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const imageData = req.body;
    const result = await this.productService.addProductImage(id, imageData);
    this.success(res, result, '上传产品图片成功');
  }

  /**
   * 删除产品图片
   */
  @ErrorHandler
  async deleteProductImage(req: Request, res: Response): Promise<void> {
    const { id, imageId } = req.params;
    await this.productService.deleteProductImage(id, imageId);
    this.success(res, null, '删除产品图片成功');
  }

  /**
   * 获取产品文档
   */
  @ErrorHandler
  async getProductDocuments(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const documents = await this.productService.getProductDocuments(id);
    this.success(res, documents, '获取产品文档成功');
  }

  /**
   * 上传产品文档
   */
  @ErrorHandler
  async uploadProductDocument(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const documentData = req.body;
    const result = await this.productService.addProductDocument(id, documentData);
    this.success(res, result, '上传产品文档成功');
  }

  /**
   * 删除产品文档
   */
  @ErrorHandler
  async deleteProductDocument(req: Request, res: Response): Promise<void> {
    const { id, documentId } = req.params;
    await this.productService.deleteProductDocument(id, documentId);
    this.success(res, null, '删除产品文档成功');
  }

  /**
   * 导出产品数据
   */
  @ErrorHandler
  async exportProducts(req: Request, res: Response): Promise<void> {
    const paginationParams = this.parsePaginationParams(req);
    const queryParams: ProductQueryParams = {
      page: paginationParams.page,
      pageSize: paginationParams.limit,
      keyword: req.query.keyword as string,
      code: req.query.code as string,
      name: req.query.name as string,
      type: req.query.type as any,
      categoryId: req.query.categoryId as string,
      unitId: req.query.unitId as string,
      defaultWarehouseId: req.query.defaultWarehouseId as string,
      status: req.query.status as any,
      acquisitionMethod: req.query.acquisitionMethod as any,
      isActive: this.parseBooleanParam(req.query.isActive),
      sortField: req.query.sortField as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc'
    };
    const format = req.query.format as string || 'excel';
    const result = await this.productService.exportProducts(queryParams, format);
    
    // 设置响应头
    const filename = `products_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv');
    
    res.send(result);
  }

  /**
   * 导入产品数据
   */
  @ErrorHandler
  async importProducts(req: Request, res: Response): Promise<void> {
    const file = req.file;
    if (!file) {
      return this.error(res, '请上传文件', 'FILE_REQUIRED');
    }

    const result = await this.productService.importProducts(file);
    this.success(res, result, '导入产品数据成功');
  }

  /**
   * 获取导入模板
   */
  @ErrorHandler
  async getImportTemplate(req: Request, res: Response): Promise<void> {
    const format = req.query.format as string || 'excel';
    const template = await this.productService.getImportTemplate(format);
    
    const filename = `product_import_template.${format === 'excel' ? 'xlsx' : 'csv'}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv');
    
    res.send(template);
  }
}
