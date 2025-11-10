import { useState, useCallback } from 'react';
import type { ProductBom, ProductInfo, UnitInfo, BomFormData } from '@zyerp/shared';
import { bomService } from '../services/bom.service';
import { productService } from '../../product/services/product.service';
import unitService from '../../../shared/services/unit.service';
import { useMessage } from '../../../shared/hooks';

export const useBom = () => {
  const [boms, setBoms] = useState<ProductBom[]>([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [units, setUnits] = useState<UnitInfo[]>([]);
  // const [routings, setRoutings] = useState<Routing[]>([]);
  const message = useMessage();

  // 获取BOM列表
  const fetchBoms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bomService.getBoms();
      if (response.success) {
        setBoms(response.data || []);
      } else {
        message.error(response.message || '获取BOM列表失败');
      }
    } catch (error) {
      console.error('获取BOM列表失败:', error);
      message.error('获取BOM列表失败');
    } finally {
      setLoading(false);
    }
  }, [message]);

  // 获取下拉选项数据
  const fetchSelectOptions = useCallback(async () => {
    try {
      // 加载产品列表
      const productResponse = await productService.getProducts({ page: 1, pageSize: 1000 });
      if (productResponse.success) {
        setProducts(productResponse.data || []);
      }

      // 加载单位列表
      const unitResponse = await unitService.getUnits({ page: 1, pageSize: 1000 });
      if (unitResponse.success) {
        setUnits(unitResponse.data || []);
      }

      // 加载工艺路线列表
      // 注意：工艺路线功能尚未实现，暂时注释掉
      // const routingResponse = await routingService.getRoutings({ page: 1, pageSize: 1000 });
      // if (routingResponse.success) {
      //   setRoutings(routingResponse.data);
      // }
    } catch (error) {
      console.error('加载下拉选项数据失败:', error);
    }
  }, []);

  // 创建BOM
  const createBom = useCallback(async (bomData: BomFormData) => {
    try {
      const response = await bomService.createBom(bomData);
      if (response.success) {
        message.success('创建成功');
        fetchBoms(); // 重新加载列表
        return response.data;
      } else {
        message.error(response.message || '创建失败');
        return null;
      }
    } catch (error) {
      console.error('创建BOM失败:', error);
      message.error('创建失败');
      return null;
    }
  }, [message, fetchBoms]);

  // 更新BOM
  const updateBom = useCallback(async (id: string, bomData: BomFormData) => {
    try {
      const response = await bomService.updateBom(id, bomData);
      if (response.success) {
        message.success('更新成功');
        fetchBoms(); // 重新加载列表
        return response.data;
      } else {
        message.error(response.message || '更新失败');
        return null;
      }
    } catch (error) {
      console.error('更新BOM失败:', error);
      message.error('更新失败');
      return null;
    }
  }, [message, fetchBoms]);

  // 删除BOM
  const deleteBom = useCallback(async (id: string) => {
    try {
      const response = await bomService.deleteBom(id);
      if (response.success) {
        message.success('删除成功');
        fetchBoms(); // 重新加载列表
        return true;
      } else {
        message.error(response.message || '删除失败');
        return false;
      }
    } catch (error) {
      console.error('删除BOM失败:', error);
      message.error('删除失败');
      return false;
    }
  }, [message, fetchBoms]);

  return {
    boms,
    loading,
    products,
    units,
    // routings,
    fetchBoms,
    fetchSelectOptions,
    createBom,
    updateBom,
    deleteBom
  };
};