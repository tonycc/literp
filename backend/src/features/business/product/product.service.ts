import { 
  ProductQueryParams,
  ProductSpecification,
  ProductImage,
  ProductDocument
} from '@zyerp/shared';
import { AppError } from '../../../shared/middleware/error';
import { ProductBaseService } from './services/product-base.service';
import { ProductQueryService } from './services/product-query.service';
import { ProductMutationService } from './services/product-mutation.service';
import { ProductVariantService } from './services/product-variant.service';
import { ProductResourceService } from './services/product-resource.service';
import { ProductImportExportService } from './services/product-import-export.service';

export class ProductService extends ProductBaseService {
  private queryService = new ProductQueryService();
  private mutationService = new ProductMutationService();
  private variantService = new ProductVariantService();
  private resourceService = new ProductResourceService();
  private importExportService = new ProductImportExportService();

  // ==================== 查询相关 ====================

  async getProducts(params: ProductQueryParams) {
    return this.queryService.getProducts(params);
  }

  async getProductById(id: string) {
    return this.queryService.getProductById(id);
  }

  async getProductByCode(code: string) {
    return this.queryService.getProductByCode(code);
  }

  async getProductOptions(params: { keyword?: string; categoryId?: string; activeOnly?: boolean }) {
    return this.queryService.getProductOptions(params);
  }

  async checkProductCode(code: string) {
    return this.mutationService.checkProductCode(code);
  }

  // ==================== 增删改相关 ====================

  async createProduct(data: any, createdBy: string) {
    return this.mutationService.createProduct(data, createdBy);
  }

  async updateProduct(id: string, data: any, updatedBy: string) {
    return this.mutationService.updateProduct(id, data, updatedBy);
  }

  async deleteProduct(id: string, deletedBy?: string) {
    return this.mutationService.deleteProduct(id, deletedBy);
  }

  async toggleProductStatus(id: string, updatedBy: string) {
    return this.mutationService.toggleProductStatus(id, updatedBy);
  }

  async batchDelete(productIds: string[]) {
    return this.mutationService.batchDelete(productIds);
  }

  async batchUpdateStatus(productIds: string[], status: 'active' | 'inactive') {
    return this.mutationService.batchUpdateStatus(productIds, status);
  }

  // ==================== 变体相关 ====================

  async createProductWithVariants(
    data: any,
    createdBy: string
  ): Promise<{ product: any; variants: any[] }> {
    console.log('ProductService.createProductWithVariants called');
    return this.prisma.$transaction(async (tx) => {
      try {
        const product = await this.mutationService.createProduct(data, createdBy, tx);
        const variantsCreated: any[] = [];
        
        const manual = Array.isArray(data?.variants) ? data.variants : [];
        if (manual.length && product?.id) {
          const result = await this.variantService.createVariantsBatchByProduct(product.id, manual as any, tx);
          if (result.failed > 0) {
             throw new AppError('Failed to create variants. Check for duplicate Code or SKU.', 400, 'VARIANT_CREATION_FAILED');
          }
          variantsCreated.push(...(result?.variants || []));
        }
        return { product, variants: variantsCreated };
      } catch (error) {
        console.error('ProductService.createProductWithVariants failed:', error);
        throw error;
      }
    });
  }

  async getProductVariants(productId: string, params?: {
    page?: number;
    pageSize?: number;
    isActive?: boolean;
  }) {
    return this.queryService.getProductVariants(productId, params);
  }

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
  ) {
    return this.variantService.createVariantsBatchByProduct(productId, variants);
  }

  async previewVariantCombinationsByProduct(
    productId: string,
    attributes: {
      [name: string]: {
        type: string;
        values: string[];
      };
    }
  ) {
    return this.variantService.previewVariantCombinationsByProduct(productId, attributes);
  }

  // ==================== 资源相关 (图片/文档/规格) ====================

  async getProductSpecifications(productId: string) {
    return this.resourceService.getProductSpecifications(productId);
  }

  async updateProductSpecifications(productId: string, specifications: Partial<ProductSpecification>[]) {
    return this.resourceService.updateProductSpecifications(productId, specifications);
  }

  async getProductImages(productId: string) {
    return this.resourceService.getProductImages(productId);
  }

  async addProductImage(productId: string, imageData: Partial<ProductImage>) {
    return this.resourceService.addProductImage(productId, imageData);
  }

  async deleteProductImage(productId: string, imageId: string) {
    return this.resourceService.deleteProductImage(productId, imageId);
  }

  async getProductDocuments(productId: string) {
    return this.resourceService.getProductDocuments(productId);
  }

  async addProductDocument(productId: string, documentData: Partial<ProductDocument>) {
    return this.resourceService.addProductDocument(productId, documentData);
  }

  async deleteProductDocument(productId: string, documentId: string) {
    return this.resourceService.deleteProductDocument(productId, documentId);
  }

  // ==================== 导入导出 ====================

  async exportProducts(queryParams: ProductQueryParams, format: string) {
    return this.importExportService.exportProducts(queryParams, format);
  }

  async importProducts(file: any) {
    return this.importExportService.importProducts(file);
  }

  async getImportTemplate(format: string) {
    return this.importExportService.getImportTemplate(format);
  }
}
