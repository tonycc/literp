/**
 * 产品管理API接口定义
 * 
 * 本接口定义了产品管理模块的所有API方法，包括：
 * - 产品基础CRUD操作
 * - 产品状态管理
 * - 产品查询和搜索
 * - 产品导入导出
 * - 产品规格管理
 * - 产品图片管理
 * - 产品替代单位管理
 */

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */

import type { ApiResponse, PaginatedResponse } from '../types/common';
import type {
  ProductInfo,
  ProductFormData,
  ProductQueryParams,
  ProductSpecification,
  ProductImage,
  ProductAlternativeUnit
} from '../types/product';

/**
 * 产品管理API接口
 */
export interface ProductApi {
  // ==================== 产品基础CRUD操作 ====================
  
  /**
   * 获取产品列表
   */
  getProducts(_params?: ProductQueryParams): Promise<PaginatedResponse<ProductInfo>>;
  
  /**
   * 根据ID获取产品详情
   */
  getProductById(_id: string): Promise<ApiResponse<ProductInfo>>;

  /**
   * 根据编码获取产品详情
   */
  getProductByCode(_code: string): Promise<ApiResponse<ProductInfo>>;

  /**
   * 创建产品
   */
  createProduct(_data: ProductFormData): Promise<ApiResponse<ProductInfo>>;

  /**
   * 更新产品
   */
  updateProduct(_id: string, _data: ProductFormData): Promise<ApiResponse<ProductInfo>>;

  /**
   * 删除产品
   */
  deleteProduct(_id: string): Promise<ApiResponse<void>>;

  /**
   * 切换产品状态
   */
  toggleProductStatus(_id: string): Promise<ApiResponse<ProductInfo>>;

  /**
   * 批量更新产品状态
   */
  batchUpdateProductStatus(_ids: string[], _status: boolean): Promise<ApiResponse<void>>;

  // 查询和搜索
  /**
   * 搜索产品
   */
  searchProducts(_keyword: string, _params?: ProductQueryParams): Promise<PaginatedResponse<ProductInfo>>;

  /**
   * 获取产品选项（用于下拉选择）
   */
  getProductOptions(_params?: { category?: string; isActive?: boolean }): Promise<ApiResponse<Array<{ value: string; label: string; code: string }>>>;

  /**
   * 验证产品编码唯一性
   */
  validateProductCode(_code: string, _excludeId?: string): Promise<ApiResponse<boolean>>;

  // 批量操作
  /**
   * 批量删除产品
   */
  batchDeleteProducts(_ids: string[]): Promise<ApiResponse<void>>;

  /**
   * 导入产品
   */
  importProducts(_file: File, _options?: { skipDuplicates?: boolean }): Promise<ApiResponse<any>>;

  /**
   * 导出产品
   */
  exportProducts(_params?: ProductQueryParams): Promise<ApiResponse<Blob>>;

  // 产品规格管理
  /**
   * 获取产品规格列表
   */
  getProductSpecifications(_productId: string): Promise<ApiResponse<ProductSpecification[]>>;

  /**
   * 创建产品规格
   */
  createProductSpecification(_productId: string, _data: any): Promise<ApiResponse<ProductSpecification>>;

  /**
   * 更新产品规格
   */
  updateProductSpecification(_specId: string, _data: any): Promise<ApiResponse<ProductSpecification>>;

  /**
   * 删除产品规格
   */
  deleteProductSpecification(_specId: string): Promise<ApiResponse<void>>;

  // 产品图片管理
  /**
   * 获取产品图片列表
   */
  getProductImages(_productId: string): Promise<ApiResponse<ProductImage[]>>;

  /**
   * 上传产品图片
   */
  uploadProductImage(_productId: string, _file: File): Promise<ApiResponse<ProductImage>>;

  /**
   * 批量上传产品图片
   */
  batchUploadProductImages(_productId: string, _files: File[]): Promise<ApiResponse<ProductImage[]>>;

  /**
   * 更新产品图片信息
   */
  updateProductImage(_imageId: string, _data: any): Promise<ApiResponse<ProductImage>>;

  /**
   * 删除产品图片
   */
  deleteProductImage(_imageId: string): Promise<ApiResponse<void>>;

  /**
   * 设置主图
   */
  setMainProductImage(_productId: string, _imageId: string): Promise<ApiResponse<void>>;

  /**
   * 更新图片排序
   */
  updateProductImageOrder(_productId: string, _imageIds: string[]): Promise<ApiResponse<void>>;

  // 产品替代单位管理
  /**
   * 获取产品替代单位列表
   */
  getProductAlternativeUnits(_productId: string): Promise<ApiResponse<ProductAlternativeUnit[]>>;

  /**
   * 创建产品替代单位
   */
  createProductAlternativeUnit(_productId: string, _data: any): Promise<ApiResponse<ProductAlternativeUnit>>;

  /**
   * 更新产品替代单位
   */
  updateProductAlternativeUnit(_unitId: string, _data: any): Promise<ApiResponse<ProductAlternativeUnit>>;

  /**
   * 删除产品替代单位
   */
  deleteProductAlternativeUnit(_unitId: string): Promise<ApiResponse<void>>;

  /**
   * 设置默认替代单位
   */
  setDefaultAlternativeUnit(_productId: string, _unitId: string): Promise<ApiResponse<void>>;

  /**
   * 下载导入模板
   */
  downloadImportTemplate(): Promise<ApiResponse<Blob>>;
}

// ==================== 导出接口 ====================

// 只导出接口定义，类型定义已在 types/product.ts 中导出