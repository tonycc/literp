import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Form, Select } from 'antd';
import userEvent from '@testing-library/user-event';
import ProductForm from '../../components/ProductForm';

// Mock the services
vi.mock('../../services/product.service', () => ({
  productService: {
    validateProductCode: vi.fn(),
  },
}));

vi.mock('../../services/productCategory.service', () => ({
  productCategoryService: {
    getOptions: vi.fn().mockResolvedValue({
      success: true,
      data: [
        { value: 'cat1', label: 'Category 1' },
        { value: 'cat2', label: 'Category 2' },
      ],
    }),
  },
}));

vi.mock('../../../../shared/services/unit.service', () => ({
  unitService: {
    getOptions: vi.fn().mockResolvedValue([
      { value: 'unit1', label: 'Unit 1' },
      { value: 'unit2', label: 'Unit 2' },
    ]),
  },
}));

vi.mock('../../../../shared/services/warehouse.service', () => ({
  warehouseService: {
    getOptions: vi.fn().mockResolvedValue([
      { value: 'wh1', label: 'Warehouse 1' },
      { value: 'wh2', label: 'Warehouse 2' },
    ]),
  },
}));

vi.mock('../../../../shared/hooks', () => ({
  useMessage: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('../../components/ProductImageUpload', () => ({
  default: () => <div data-testid="product-image-upload">ProductImageUpload</div>,
}));

// Import after mocking
import { productService } from '../../services/product.service';
import { ProductType, ProductStatus } from '@zyerp/shared';

describe('ProductForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form in create mode', () => {
    render(
      <ProductForm
        visible={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText('产品编码')).toBeInTheDocument();
    expect(screen.getByLabelText('产品名称')).toBeInTheDocument();
    expect(screen.getByLabelText('产品属性')).toBeInTheDocument();
    expect(screen.getByText('新增产品')).toBeInTheDocument();
  });

  it('should render form in edit mode', () => {
    const mockProduct = {
      id: '1',
      code: 'PRD001',
      name: 'Test Product',
      type: ProductType.FINISHED_PRODUCT,
      status: ProductStatus.ACTIVE,
    };

    render(
      <ProductForm
        visible={true}
        product={mockProduct}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('编辑产品')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(
      <ProductForm
        visible={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Try to submit without filling required fields
    await user.click(screen.getByText('保存'));

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('请输入产品编码')).toBeInTheDocument();
      expect(screen.getByText('请输入产品名称')).toBeInTheDocument();
    });
  });

  it('should validate product code format', async () => {
    const user = userEvent.setup();
    render(
      <ProductForm
        visible={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const codeInput = screen.getByLabelText('产品编码');
    await user.type(codeInput, 'invalid-code');

    // Trigger blur event
    fireEvent.blur(codeInput);

    await waitFor(() => {
      expect(screen.getByText('产品编码格式不正确')).toBeInTheDocument();
    });
  });

  it('should validate product code uniqueness', async () => {
    const user = userEvent.setup();
    vi.mocked(productService.validateProductCode).mockResolvedValue({
      success: true,
      data: { isValid: false, message: '产品编码已存在' },
    });

    render(
      <ProductForm
        visible={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const codeInput = screen.getByLabelText('产品编码');
    await user.type(codeInput, 'PRD0012345678');

    // Trigger blur event
    fireEvent.blur(codeInput);

    await waitFor(() => {
      expect(screen.getByText('产品编码已存在，请使用其他编码')).toBeInTheDocument();
    });
  });

  it('should validate product name length', async () => {
    const user = userEvent.setup();
    render(
      <ProductForm
        visible={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText('产品名称');
    await user.type(nameInput, 'a'); // Less than 2 characters

    // Trigger blur event
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('产品名称至少需要2个字符')).toBeInTheDocument();
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProductForm
        visible={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByText('取消'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should call onSave with form data when submitted', async () => {
    const user = userEvent.setup();
    vi.mocked(productService.validateProductCode).mockResolvedValue({
      success: true,
      data: { isValid: true },
    });

    render(
      <ProductForm
        visible={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Fill form
    await user.type(screen.getByLabelText('产品编码'), 'PRD0012345678');
    await user.type(screen.getByLabelText('产品名称'), 'Test Product');

    // Select product type
    const typeSelect = screen.getByLabelText('产品属性');
    fireEvent.change(typeSelect, { target: { value: ProductType.FINISHED_PRODUCT } });

    // Submit form
    await user.click(screen.getByText('保存'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('should generate product code when generate button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProductForm
        visible={true}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const generateButton = screen.getByText('生成');
    await user.click(generateButton);

    const codeInput = screen.getByLabelText('产品编码') as HTMLInputElement;
    expect(codeInput.value).toBeTruthy();
    expect(codeInput.value.length).toBeGreaterThan(0);
  });

  it('should load product data in edit mode', async () => {
    const mockProduct = {
      id: '1',
      code: 'PRD001',
      name: 'Test Product',
      type: ProductType.FINISHED_PRODUCT,
      status: ProductStatus.ACTIVE,
      categoryId: 'cat1',
      unitId: 'unit1',
      defaultWarehouseId: 'wh1',
      specification: '500ml',
    };

    render(
      <ProductForm
        visible={true}
        product={mockProduct}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Wait for form to be populated
    await waitFor(() => {
      const codeInput = screen.getByLabelText('产品编码') as HTMLInputElement;
      expect(codeInput.value).toBe('PRD001');
    });
  });
});
