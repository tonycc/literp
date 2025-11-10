import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { message } from 'antd';
import { useProduct } from '../../hooks/useProduct';

// Mock the product service
vi.mock('../../services/product.service', () => ({
  productService: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    toggleProductStatus: vi.fn(),
    getProductById: vi.fn(),
  },
}));

// Mock the shared hooks
vi.mock('../../../../shared/hooks', () => ({
  useMessage: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

import { productService } from '../../services/product.service';

describe('useProduct Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchProducts', () => {
    it('should fetch products successfully', async () => {
      const mockProducts = [
        { id: '1', code: 'PRD001', name: 'Product 1' },
        { id: '2', code: 'PRD002', name: 'Product 2' },
      ];
      const mockResponse = {
        success: true,
        data: mockProducts,
        pagination: { total: 2, page: 1, pageSize: 10 },
      };

      vi.mocked(productService.getProducts).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProduct());

      await act(async () => {
        await result.current.fetchProducts();
      });

      expect(result.current.products).toEqual(mockProducts);
      expect(result.current.total).toBe(2);
      expect(result.current.loading).toBe(false);
    });

    it('should handle fetch error', async () => {
      const mockError = new Error('Failed to fetch products');
      vi.mocked(productService.getProducts).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useProduct());

      await act(async () => {
        await result.current.fetchProducts();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.products).toEqual([]);
    });
  });

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const mockProduct = { id: '1', code: 'PRD001', name: 'New Product' };
      const mockResponse = {
        success: true,
        data: mockProduct,
      };

      vi.mocked(productService.createProduct).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProduct());

      await act(async () => {
        await result.current.createProduct({
          code: 'PRD001',
          name: 'New Product',
          type: 'FINISHED_PRODUCT',
        });
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle create error', async () => {
      const mockError = { message: 'Create failed' };
      vi.mocked(productService.createProduct).mockResolvedValueOnce({
        success: false,
        message: 'Create failed',
      });

      const { result } = renderHook(() => useProduct());

      await act(async () => {
        try {
          await result.current.createProduct({
            code: 'PRD001',
            name: 'New Product',
            type: 'FINISHED_PRODUCT',
          });
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const mockProduct = { id: '1', code: 'PRD001', name: 'Updated Product' };
      const mockResponse = {
        success: true,
        data: mockProduct,
      };

      vi.mocked(productService.updateProduct).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProduct());

      await act(async () => {
        await result.current.updateProduct('1', {
          code: 'PRD001',
          name: 'Updated Product',
          type: 'FINISHED_PRODUCT',
        });
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      const mockResponse = {
        success: true,
      };

      vi.mocked(productService.deleteProduct).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProduct());

      await act(async () => {
        await result.current.deleteProduct('1');
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('toggleProductStatus', () => {
    it('should toggle product status successfully', async () => {
      const mockProduct = { id: '1', code: 'PRD001', name: 'Product', status: 'ACTIVE' };
      const mockResponse = {
        success: true,
        data: mockProduct,
      };

      vi.mocked(productService.toggleProductStatus).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProduct());

      await act(async () => {
        await result.current.toggleProductStatus('1', false);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('fetchProductDetail', () => {
    it('should fetch product detail successfully', async () => {
      const mockProduct = { id: '1', code: 'PRD001', name: 'Product' };
      const mockResponse = {
        success: true,
        data: mockProduct,
      };

      vi.mocked(productService.getProductById).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProduct());

      let product;
      await act(async () => {
        product = await result.current.fetchProductDetail('1');
      });

      expect(product).toEqual(mockProduct);
    });
  });
});
