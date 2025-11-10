import { useCallback, useState } from 'react';
import { useMessage } from '../../../shared/hooks';
import { routingService } from '../services/routing.service';
import type { 
  RoutingInfo, 
  RoutingFormData,
  RoutingQueryParams
} from '@zyerp/shared';

export const useRouting = () => {
  // 状态定义
  const [routings, setRoutings] = useState<RoutingInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRouting, setSelectedRouting] = useState<RoutingInfo | null>(null);

  // 共享hooks
  const message = useMessage();

  // 数据获取
  const fetchRoutings = useCallback(async (params?: Partial<RoutingQueryParams>) => {
    setLoading(true);
    try {
      const response = await routingService.getList({
        page: params?.page ?? page,
        pageSize: params?.pageSize ?? pageSize,
        ...params
      });
      
      if (response.success) {
        setRoutings(response.data || []);
        setTotal(response.pagination?.total || 0);
      } else {
        message.error(response.message || '获取工艺路线数据失败');
      }
    } catch (error) {
      console.error('获取工艺路线数据失败:', error);
      message.error('获取工艺路线数据失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, message]);

  // 获取选项列表
  const fetchRoutingOptions = useCallback(async (params?: { isActive?: boolean }) => {
    try {
      const response = await routingService.getOptions(params);
      if (response.success) {
        return response.data || [];
      } else {
        message.error(response.message || '获取工艺路线选项失败');
        return [];
      }
    } catch (error) {
      console.error('获取工艺路线选项失败:', error);
      message.error('获取工艺路线选项失败');
      return [];
    }
  }, [message]);

  // 根据ID获取工艺路线
  const getRoutingById = useCallback(async (id: string) => {
    try {
      const response = await routingService.getById(id);
      if (response.success) {
        return response.data;
      } else {
        message.error(response.message || '获取工艺路线详情失败');
        return null;
      }
    } catch (error) {
      console.error('获取工艺路线详情失败:', error);
      message.error('获取工艺路线详情失败');
      return null;
    }
  }, [message]);

  // 创建工艺路线
  const createRouting = useCallback(async (data: RoutingFormData) => {
    try {
      const response = await routingService.create(data);
      if (response.success) {
        message.success('工艺路线创建成功');
        return response.data;
      } else {
        message.error(response.message || '工艺路线创建失败');
        return null;
      }
    } catch (error) {
      console.error('工艺路线创建失败:', error);
      message.error('工艺路线创建失败');
      return null;
    }
  }, [message]);

  // 更新工艺路线
  const updateRouting = useCallback(async (id: string, data: Partial<RoutingFormData>) => {
    try {
      const response = await routingService.update(id, data);
      if (response.success) {
        message.success('工艺路线更新成功');
        return response.data;
      } else {
        message.error(response.message || '工艺路线更新失败');
        return null;
      }
    } catch (error) {
      console.error('工艺路线更新失败:', error);
      message.error('工艺路线更新失败');
      return null;
    }
  }, [message]);

  // 删除工艺路线
  const deleteRouting = useCallback(async (id: string) => {
    try {
      const response = await routingService.delete(id);
      if (response.success) {
        message.success('工艺路线删除成功');
        return true;
      } else {
        message.error(response.message || '工艺路线删除失败');
        return false;
      }
    } catch (error) {
      console.error('工艺路线删除失败:', error);
      message.error('工艺路线删除失败');
      return false;
    }
  }, [message]);

  // 切换工艺路线状态
  const toggleRoutingStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      const response = await routingService.toggleStatus(id, isActive);
      if (response.success) {
        message.success(isActive ? '工艺路线已启用' : '工艺路线已停用');
        return true;
      } else {
        message.error(response.message || (isActive ? '启用工艺路线失败' : '停用工艺路线失败'));
        return false;
      }
    } catch (error) {
      console.error(isActive ? '启用工艺路线失败:' : '停用工艺路线失败:', error);
      message.error(isActive ? '启用工艺路线失败' : '停用工艺路线失败');
      return false;
    }
  }, [message]);

  // 分页处理
  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
    fetchRoutings({ page: newPage, pageSize: newPageSize });
  }, [fetchRoutings]);

  // 搜索处理
  const handleSearch = useCallback((keyword: string) => {
    setPage(1); // 搜索时重置到第一页
    fetchRoutings({ keyword, page: 1 });
  }, [fetchRoutings]);

  // 重置搜索
  const handleResetSearch = useCallback(() => {
    setPage(1);
    fetchRoutings({ keyword: undefined, page: 1 });
  }, [fetchRoutings]);

  // 返回接口
  return {
    // 状态
    routings,
    loading,
    total,
    page,
    pageSize,
    selectedRouting,
    // 方法
    fetchRoutings,
    fetchRoutingOptions,
    getRoutingById,
    createRouting,
    updateRouting,
    deleteRouting,
    toggleRoutingStatus,
    handlePageChange,
    handleSearch,
    handleResetSearch,
    setSelectedRouting,
    // 状态设置器
    setPage,
    setPageSize
  };
};