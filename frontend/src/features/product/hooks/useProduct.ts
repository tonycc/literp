import { useState, useCallback } from 'react';
import type { ProductInfo, ProductFormData } from '@zyerp/shared';
import { productService } from '../services/product.service';
import { useMessage } from '@/shared/hooks';
import type { ProductListParams } from '../services/product.service';
import type { ProductCreateWithVariantsInput } from '@zyerp/shared';

export const useProduct = () => {
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const message = useMessage();

  // 获取产品列表
  const fetchProducts = useCallback(async (params?: Partial<ProductListParams>) => {
    setLoading(true);
    try {
      // 使用传入的参数或当前状态的分页参数
      const currentPage = params?.page ?? page;
      const currentPageSize = params?.pageSize ?? pageSize;
      
      const response = await productService.getProducts({
        page: currentPage,
        pageSize: currentPageSize,
        ...params
      });
      
      if (response.success) {
        setProducts(response.data || []);
        setTotal(response.pagination?.total || 0);
        // 不重新设置page和pageSize，保持用户选择的分页状态
        // setPage(response.pagination?.page || 1);
        // setPageSize(response.pagination?.pageSize || 10);
      } else {
        message.error(response.message || '获取产品列表失败');
      }
    } catch (error) {
      console.error('获取产品列表失败:', error);
      message.error('获取产品列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, message]);

  // 创建产品
  const handleCreateProduct = useCallback(async (data: ProductFormData) => {
    setLoading(true);
    try {
      const response = await productService.createProduct(data);
      if (response.success) {
        return response.data;
      } else {
        message.error(response.message || '创建产品失败');
        throw new Error(response.message || '创建产品失败');
      }
    } catch (error) {
      console.error('创建产品失败:', error);
      message.error('创建产品失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [message]);

  const handleCreateProductWithVariants = useCallback(async (data: ProductCreateWithVariantsInput) => {
    setLoading(true);
    try {
      const response = await productService.createProductWithVariants(data);
      if (response.success) {
        return response.data;
      } else {
        message.error(response.message || '创建产品及变体失败');
        throw new Error(response.message || '创建产品及变体失败');
      }
    } catch (error) {
      console.error('创建产品及变体失败:', error);
      message.error('创建产品及变体失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [message]);

  // 更新产品
  const handleUpdateProduct = useCallback(async (id: string, data: ProductFormData) => {
    setLoading(true);
    try {
      const response = await productService.updateProduct(id, data);
      if (response.success) {
        return response.data;
      } else {
        message.error(response.message || '更新产品失败');
        throw new Error(response.message || '更新产品失败');
      }
    } catch (error) {
      console.error('更新产品失败:', error);
      message.error('更新产品失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [message]);

  // 删除产品
  const handleDeleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await productService.deleteProduct(id);
      if (response.success) {
        message.success('删除产品成功');
        return response;
      } else {
        message.error(response.message || '删除产品失败');
        throw new Error(response.message || '删除产品失败');
      }
    } catch (error) {
      console.error('删除产品失败:', error);
      message.error('删除产品失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [message]);

  // 切换产品状态
  const handleToggleProductStatus = useCallback(async (id: string, isActive: boolean) => {
    setLoading(true);
    try {
      const response = await productService.toggleProductStatus(id);
      if (response.success) {
        message.success(`${isActive ? '启用' : '禁用'}产品成功`);
        return response.data;
      } else {
        message.error(response.message || '切换产品状态失败');
        throw new Error(response.message || '切换产品状态失败');
      }
    } catch (error) {
      console.error('切换产品状态失败:', error);
      message.error('切换产品状态失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [message]);

  // 获取产品详情
  const fetchProductDetail = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await productService.getProductById(id);
      if (response.success) {
        return response.data;
      } else {
        message.error(response.message || '获取产品详情失败');
        throw new Error(response.message || '获取产品详情失败');
      }
    } catch (error) {
      console.error('获取产品详情失败:', error);
      message.error('获取产品详情失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [message]);

  // 复制产品
  const handleCopyProduct = useCallback(async (id: string, changes?: Partial<ProductFormData>) => {
    setLoading(true);
    try {
      const response = await productService.copyProduct(id, changes);
      if (response.success) {
        message.success('复制产品成功');
        // 刷新产品列表
        await fetchProducts();
        return response.data;
      } else {
        message.error(response.message || '复制产品失败');
        throw new Error(response.message || '复制产品失败');
      }
    } catch (error) {
      console.error('复制产品失败:', error);
      message.error('复制产品失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [message, fetchProducts]);

  

  return {
    products,
    loading,
    total,
    page,
    pageSize,
    fetchProducts,
    createProduct: handleCreateProduct,
    createProductWithVariants: handleCreateProductWithVariants,
    updateProduct: handleUpdateProduct,
    deleteProduct: handleDeleteProduct,
    toggleProductStatus: handleToggleProductStatus,
    fetchProductDetail,
    copyProduct: handleCopyProduct,
    setPage,
    setPageSize
  };
};
