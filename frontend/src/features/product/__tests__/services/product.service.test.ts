import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create hoisted mock functions
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
const mockPatch = vi.fn();

// Export them for use in vi.mock
const apiModule = {
  default: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    patch: mockPatch,
  },
};

export { mockGet, mockPost, mockPut, mockDelete, mockPatch };
export default apiModule.default;

// Mock the API module
vi.mock('../../../shared/services/api', () => {
  return {
    default: {
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
      patch: mockPatch,
    },
  };
});

import { ProductService } from '../../services/product.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProductService();
  });

  describe('getProducts', () => {
    it('should fetch products successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            data: [
              { id: '1', code: 'PRD001', name: 'Product 1' },
              { id: '2', code: 'PRD002', name: 'Product 2' },
            ],
            pagination: {
              page: 1,
              pageSize: 10,
              total: 2,
            },
          },
        },
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.getProducts({ page: 1, pageSize: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.pagination?.total).toBe(2);
    });

    it('should handle error when data is missing', async () => {
      const mockResponse = {
        data: {
          success: false,
        },
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      await expect(service.getProducts()).rejects.toThrow('后端返回的数据结构异常：缺少data字段');
    });
  });

  describe('getProductById', () => {
    it('should fetch product by id successfully', async () => {
      const mockProduct = { id: '1', code: 'PRD001', name: 'Product 1' };
      const mockResponse = {
        data: {
          success: true,
          data: mockProduct,
        },
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.getProductById('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });
  });

  describe('getProductByCode', () => {
    it('should fetch product by code successfully', async () => {
      const mockProduct = { id: '1', code: 'PRD001', name: 'Product 1' };
      const mockResponse = {
        data: {
          success: true,
          data: mockProduct,
        },
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.getProductByCode('PRD001');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });
  });

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const mockProduct = { id: '1', code: 'PRD001', name: 'New Product' };
      const mockResponse = {
        data: {
          success: true,
          data: mockProduct,
        },
      };

      mockPost.mockResolvedValueOnce(mockResponse);

      const result = await service.createProduct({
        code: 'PRD001',
        name: 'New Product',
        type: 'FINISHED_PRODUCT',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const mockProduct = { id: '1', code: 'PRD001', name: 'Updated Product' };
      const mockResponse = {
        data: {
          success: true,
          data: mockProduct,
        },
      };

      mockPut.mockResolvedValueOnce(mockResponse);

      const result = await service.updateProduct('1', {
        code: 'PRD001',
        name: 'Updated Product',
        type: 'FINISHED_PRODUCT',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
        },
      };

      mockDelete.mockResolvedValueOnce(mockResponse);

      const result = await service.deleteProduct('1');

      expect(result.success).toBe(true);
    });
  });

  describe('toggleProductStatus', () => {
    it('should toggle product status successfully', async () => {
      const mockProduct = { id: '1', code: 'PRD001', name: 'Product', status: 'ACTIVE' };
      const mockResponse = {
        data: {
          success: true,
          data: mockProduct,
        },
      };

      mockPatch.mockResolvedValueOnce(mockResponse);

      const result = await service.toggleProductStatus('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });
  });

  describe('batchUpdateStatus', () => {
    it('should batch update status successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { success: 3, failed: 0 },
        },
      };

      mockPatch.mockResolvedValueOnce(mockResponse);

      const result = await service.batchUpdateStatus(['1', '2', '3'], 'active');

      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(3);
      expect(result.data?.failed).toBe(0);
    });
  });

  describe('searchProducts', () => {
    it('should search products successfully', async () => {
      const mockProducts = [
        { id: '1', code: 'PRD001', name: 'Product 1' },
      ];
      const mockResponse = {
        data: {
          success: true,
          data: {
            data: mockProducts,
            pagination: {
              page: 1,
              pageSize: 10,
              total: 1,
            },
          },
        },
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.searchProducts('Product 1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getProductOptions', () => {
    it('should get product options successfully', async () => {
      const mockOptions = [
        { id: '1', code: 'PRD001', name: 'Product 1' },
        { id: '2', code: 'PRD002', name: 'Product 2' },
      ];
      const mockResponse = {
        data: {
          success: true,
          data: mockOptions,
        },
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.getProductOptions();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('validateProductCode', () => {
    it('should validate product code successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { isValid: true },
        },
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.validateProductCode('PRD001');

      expect(result.success).toBe(true);
      expect(result.data?.isValid).toBe(true);
    });

    it('should return invalid for duplicate code', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { isValid: false, message: '产品编码已存在' },
        },
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await service.validateProductCode('PRD001');

      expect(result.success).toBe(true);
      expect(result.data?.isValid).toBe(false);
      expect(result.data?.message).toBe('产品编码已存在');
    });
  });

  describe('batchDeleteProducts', () => {
    it('should batch delete products successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { success: 2, failed: 0 },
        },
      };

      mockDelete.mockResolvedValueOnce(mockResponse);

      const result = await service.batchDeleteProducts(['1', '2']);

      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(2);
    });
  });
});
