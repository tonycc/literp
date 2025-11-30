import { Request, Response } from 'express';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ProductVariantsService } from './product-variants.service';
import { ProductService } from '../product/product.service';

/**
 * 产品变体控制器（Express风格）
 * 统一使用 BaseController 响应与错误处理
 */
export class ProductVariantsController extends BaseController {
  private readonly productVariantsService: ProductVariantsService;

  constructor(productVariantsService: ProductVariantsService) {
    super();
    this.productVariantsService = productVariantsService;
  }

  /**
   * 生成产品变体
   */
  public generateVariants = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const attributes = req.body || {};
    const result = await this.productVariantsService.generateVariants(productId, attributes);
    this.success(res, result, '生成产品变体成功');
  });

  /**
   * 获取产品变体列表（分页）
   */
  public getVariants = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const queryParams = req.query || {};

    const paged = await this.productVariantsService.getVariants(productId, queryParams);
    this.success(res, paged, '获取产品变体列表成功');
  });

  public updateVariant = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId, variantId } = req.params as { productId: string; variantId: string };
    const data = req.body || {};
    const userId = this.getUserId(req);
    const updated = await this.productVariantsService.updateVariant(productId, variantId, { ...data, updatedBy: userId } as any);
    this.success(res, updated, '更新产品变体成功');
  });

  public deleteVariant = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId, variantId } = req.params as { productId: string; variantId: string };
    await this.productVariantsService.deleteVariant(productId, variantId);
    this.success(res, null, '删除产品变体成功');
  });

  public batchCreateVariants = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const variants = (req.body?.variants || req.body || []) as Array<{ name: string; code: string; variantAttributes?: Array<{ name: string; value: string }>; barcode?: string }>;
    const productService = new ProductService();
    const result = await productService.createVariantsBatchByProduct(productId, variants as any);
    this.success(res, result, '批量创建产品变体成功');
  });

  public getVariantStock = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId, variantId } = req.params as { productId: string; variantId: string };
    const result = await this.productVariantsService.getVariantStock(productId, variantId);
    this.success(res, result, '获取变体库存成功');
  });

  public adjustVariantStock = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId, variantId } = req.params as { productId: string; variantId: string };
    const payload = req.body as { type: 'inbound' | 'outbound' | 'reserve' | 'release'; delta: number; warehouseId: string; unitId: string };
    const result = await this.productVariantsService.adjustVariantStock(productId, variantId, payload);
    this.success(res, result, '变体库存调整成功');
  });

  public listVariantImages = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId, variantId } = req.params as { productId: string; variantId: string };
    const result = await this.productVariantsService.listVariantImages(productId, variantId);
    this.success(res, result, '获取变体图片成功');
  });

  public uploadVariantImage = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId, variantId } = req.params as { productId: string; variantId: string };
    const file = (req as any).file;
    const body = file ? { url: `/uploads/variants/${file.filename}` } : req.body;
    const result = await this.productVariantsService.uploadVariantImage(productId, variantId, body);
    this.success(res, result, '上传变体图片成功');
  });

  public deleteVariantImage = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId, variantId, imageId } = req.params as { productId: string; variantId: string; imageId: string };
    const result = await this.productVariantsService.deleteVariantImage(productId, variantId, imageId);
    this.success(res, result, '删除变体图片成功');
  });
}
