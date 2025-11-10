/**
 * 产品类别管理Hook
 */

import { useState, useCallback } from 'react';
import productCategoryService from '../services/productCategory.service';
import { useMessage } from '../../../shared/hooks/useMessage';
import type { 
  ProductCategoryInfo, 
  ProductCategoryQueryParams,
  ProductCategoryFormData 
} from '@zyerp/shared';

/**
 * 产品类别管理Hook
 */
export const useProductCategory = () => {
  const [categories, setCategories] = useState<ProductCategoryInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const message = useMessage();

  /**
   * 获取产品类别列表
   */
  const fetchCategories = useCallback(async (params?: ProductCategoryQueryParams) => {
    setLoading(true);
    try {
      const response = await productCategoryService.getList(params);
      
      if (response.success && response.data) {
        setCategories(response.data);
        setTotal(response.pagination?.total || 0);
      }
    } catch {
      message.error('获取产品类别列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 创建产品类别
   */
  const createCategory = useCallback(async (data: ProductCategoryFormData) => {
    try {
      const response = await productCategoryService.create(data);
      if (response.success) {
        message.success('创建产品类别成功');
        return response.data;
      }
    } catch (error) {
      message.error('创建产品类别失败');
      throw error;
    }
  }, []);

  /**
   * 更新产品类别
   */
  const updateCategory = useCallback(async (id: string, data: Partial<ProductCategoryFormData>) => {
    try {
      const response = await productCategoryService.update(id, data);
      if (response.success) {
        message.success('更新产品类别成功');
        return response.data;
      }
    } catch (error) {
      message.error('更新产品类别失败');
      throw error;
    }
  }, []);

  /**
   * 删除产品类别
   */
  const deleteCategory = useCallback(async (id: string) => {
    try {
      const response = await productCategoryService.delete(id);
      if (response.success) {
        message.success('删除产品类别成功');
        return true;
      }
    } catch (error) {
      message.error('删除产品类别失败');
      throw error;
    }
  }, []);

  /**
   * 切换产品类别状态
   */
  const toggleCategoryStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      const response = await productCategoryService.toggleStatus(id, isActive);
      if (response.success) {
        message.success(isActive ? '启用成功' : '停用成功');
        return true;
      }
    } catch (error) {
      message.error('操作失败');
      throw error;
    }
  }, []);

  /**
   * 生成产品类别编码
   */
  const generateCode = useCallback(async (parentCode?: string) => {
    try {
      const response = await productCategoryService.generateCode({ parentCode });
      if (response.success && response.data) {
        return response.data.code;
      }
    } catch (error) {
      message.error('生成编码失败');
      throw error;
    }
  }, []);

  /**
   * 获取产品类别选项（用于下拉选择）
   */
  const getCategoryOptions = useCallback(async (params?: { 
    level?: number; 
    parentCode?: string; 
    isActive?: boolean 
  }) => {
    try {
      const response = await productCategoryService.getOptions(params);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch {
      message.error('获取类别选项失败');
      return [];
    }
  }, []);

  /**
   * 获取产品类别树形结构
   */
  const getCategoryTree = useCallback(async (params?: { isActive?: boolean }) => {
    try {
      const response = await productCategoryService.getTree(params);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch {
      message.error('获取类别树失败');
      return [];
    }
  }, []);

  return {
    // 状态
    categories,
    loading,
    total,
    
    // 方法
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    generateCode,
    getCategoryOptions,
    getCategoryTree,
  };
};