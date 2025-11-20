import { useCallback, useState } from 'react';
import { useMessage } from '@/shared/hooks';
import { operationService } from '../services/operation.service';
import type { 
  OperationInfo, 
  OperationFormData,
  OperationQueryParams
} from '@zyerp/shared';

export const useOperation = () => {
  // 状态定义
  const [operations, setOperations] = useState<OperationInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOperation, setSelectedOperation] = useState<OperationInfo | null>(null);

  // 共享hooks
  const message = useMessage();

  // 数据获取
  const fetchOperations = useCallback(async (params?: Partial<OperationQueryParams>) => {
    setLoading(true);
    try {
      const response = await operationService.getList({
        page: params?.page ?? page,
        pageSize: params?.pageSize ?? pageSize,
        ...params
      });
      
      if (response.success) {
        setOperations(response.data || []);
        setTotal(response.pagination?.total || 0);
      } else {
        message.error(response.message || '获取工序数据失败');
      }
    } catch (error) {
      console.error('获取工序数据失败:', error);
      message.error('获取工序数据失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, message]);

  // 获取选项列表
  const fetchOperationOptions = useCallback(async (params?: { isActive?: boolean }) => {
    try {
      const response = await operationService.getOptions(params);
      if (response.success) {
        return response.data || [];
      } else {
        message.error(response.message || '获取工序选项失败');
        return [];
      }
    } catch (error) {
      console.error('获取工序选项失败:', error);
      message.error('获取工序选项失败');
      return [];
    }
  }, [message]);

  // 根据ID获取工序
  const getOperationById = useCallback(async (id: string) => {
    try {
      const response = await operationService.getById(id);
      if (response.success) {
        return response.data;
      } else {
        message.error(response.message || '获取工序详情失败');
        return null;
      }
    } catch (error) {
      console.error('获取工序详情失败:', error);
      message.error('获取工序详情失败');
      return null;
    }
  }, [message]);

  // 创建工序
  const createOperation = useCallback(async (data: OperationFormData) => {
    try {
      const response = await operationService.create(data);
      if (response.success) {
        message.success('工序创建成功');
        return response.data;
      } else {
        message.error(response.message || '工序创建失败');
        return null;
      }
    } catch (error) {
      console.error('工序创建失败:', error);
      message.error('工序创建失败');
      return null;
    }
  }, [message]);

  // 更新工序
  const updateOperation = useCallback(async (id: string, data: Partial<OperationFormData>) => {
    try {
      const response = await operationService.update(id, data);
      if (response.success) {
        message.success('工序更新成功');
        return response.data;
      } else {
        message.error(response.message || '工序更新失败');
        return null;
      }
    } catch (error) {
      console.error('工序更新失败:', error);
      message.error('工序更新失败');
      return null;
    }
  }, [message]);

  // 删除工序
  const deleteOperation = useCallback(async (id: string) => {
    try {
      const response = await operationService.delete(id);
      if (response.success) {
        message.success('工序删除成功');
        return true;
      } else {
        message.error(response.message || '工序删除失败');
        return false;
      }
    } catch (error) {
      console.error('工序删除失败:', error);
      message.error('工序删除失败');
      return false;
    }
  }, [message]);

  // 切换工序状态
  const toggleOperationStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      const response = await operationService.toggleStatus(id, isActive);
      if (response.success) {
        message.success(isActive ? '工序已启用' : '工序已停用');
        return true;
      } else {
        message.error(response.message || (isActive ? '启用工序失败' : '停用工序失败'));
        return false;
      }
    } catch (error) {
      console.error(isActive ? '启用工序失败:' : '停用工序失败:', error);
      message.error(isActive ? '启用工序失败' : '停用工序失败');
      return false;
    }
  }, [message]);

  // 分页处理
  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
    void fetchOperations({ page: newPage, pageSize: newPageSize });
  }, [fetchOperations]);

  // 搜索处理
  const handleSearch = useCallback((keyword: string) => {
    setPage(1); // 搜索时重置到第一页
    void fetchOperations({ keyword, page: 1 });
  }, [fetchOperations]);

  // 重置搜索
  const handleResetSearch = useCallback(() => {
    setPage(1);
    void fetchOperations({ keyword: undefined, page: 1 });
  }, [fetchOperations]);

  // 返回接口
  return {
    // 状态
    operations,
    loading,
    total,
    page,
    pageSize,
    selectedOperation,
    // 方法
    fetchOperations,
    fetchOperationOptions,
    getOperationById,
    createOperation,
    updateOperation,
    deleteOperation,
    toggleOperationStatus,
    handlePageChange,
    handleSearch,
    handleResetSearch,
    setSelectedOperation,
    // 状态设置器
    setPage,
    setPageSize
  };
};