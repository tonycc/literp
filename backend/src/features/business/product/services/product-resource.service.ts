import { 
  ProductSpecification,
  SpecificationType,
  ProductImage,
  ProductDocument
} from '@zyerp/shared';
import { ProductBaseService } from './product-base.service';

export class ProductResourceService extends ProductBaseService {
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
}
