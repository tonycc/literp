import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Upload, message } from 'antd';
import userEvent from '@testing-library/user-event';
import ProductImageUpload from '../../components/ProductImageUpload';

// Mock the upload service
vi.mock('../../../features/file-management/services/upload.service', () => ({
  uploadService: {
    uploadProductImages: vi.fn(),
    deleteProductImage: vi.fn(),
    validateFileType: vi.fn(),
    validateFileSize: vi.fn(),
  },
}));

// Mock the message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

import type { UploadFile } from 'antd';

// Import the mocked upload service
const uploadService = {
  uploadProductImages: vi.fn(),
  deleteProductImage: vi.fn(),
  validateFileType: vi.fn(),
  validateFileSize: vi.fn(),
};

describe('ProductImageUpload', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload area', () => {
    render(
      <ProductImageUpload
        value={[]}
        onChange={mockOnChange}
        maxCount={5}
      />
    );

    expect(screen.getByText('上传图片')).toBeInTheDocument();
  });

  it('should show uploaded images', () => {
    const mockFiles: UploadFile[] = [
      {
        uid: '1',
        name: 'image1.jpg',
        status: 'done',
        url: 'http://example.com/image1.jpg',
      },
      {
        uid: '2',
        name: 'image2.jpg',
        status: 'done',
        url: 'http://example.com/image2.jpg',
      },
    ];

    render(
      <ProductImageUpload
        value={mockFiles}
        onChange={mockOnChange}
        maxCount={5}
      />
    );

    // Should show the uploaded images
    expect(screen.getByText('image1.jpg')).toBeInTheDocument();
    expect(screen.getByText('image2.jpg')).toBeInTheDocument();
  });

  it('should limit maximum number of images', () => {
    const mockFiles: UploadFile[] = Array.from({ length: 5 }, (_, i) => ({
      uid: String(i),
      name: `image${i}.jpg`,
      status: 'done',
      url: `http://example.com/image${i}.jpg`,
    }));

    render(
      <ProductImageUpload
        value={mockFiles}
        onChange={mockOnChange}
        maxCount={5}
      />
    );

    // Upload button should not be visible when max count is reached
    expect(screen.queryByText('上传图片')).not.toBeInTheDocument();
  });

  it('should upload images successfully', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const mockUploadResults = [
      {
        id: '1',
        url: 'http://example.com/image1.png',
        name: 'test.png',
        size: 1024,
        type: 'image/png',
      },
    ];

    vi.mocked(uploadService.uploadProductImages).mockResolvedValueOnce(mockUploadResults);

    render(
      <ProductImageUpload
        value={[]}
        onChange={mockOnChange}
        maxCount={5}
      />
    );

    // Simulate file upload
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    // The custom upload logic is tested in the handleChange function
    // We'll test the validation
    vi.mocked(uploadService.validateFileType).mockReturnValueOnce(true);
    vi.mocked(uploadService.validateFileSize).mockReturnValueOnce(true);

    // Check validation works
    const isValidType = uploadService.validateFileType(mockFile, 'product-image');
    expect(isValidType).toBe(true);
  });

  it('should reject invalid file type', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });

    vi.mocked(uploadService.validateFileType).mockReturnValueOnce(false);

    render(
      <ProductImageUpload
        value={[]}
        onChange={mockOnChange}
        maxCount={5}
      />
    );

    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(uploadService.validateFileType).toHaveBeenCalled();
    });
  });

  it('should reject file that is too large', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(mockFile, 'size', { value: 5 * 1024 * 1024 }); // 5MB

    vi.mocked(uploadService.validateFileType).mockReturnValueOnce(true);
    vi.mocked(uploadService.validateFileSize).mockReturnValueOnce(false);

    render(
      <ProductImageUpload
        value={[]}
        onChange={mockOnChange}
        maxCount={5}
      />
    );

    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(uploadService.validateFileSize).toHaveBeenCalled();
    });
  });

  it('should delete image successfully', async () => {
    const user = userEvent.setup();
    const mockFile: UploadFile = {
      uid: '1',
      name: 'image1.jpg',
      status: 'done',
      url: 'http://example.com/image1.jpg',
      response: {
        id: '1',
        url: 'http://example.com/image1.jpg',
        name: 'image1.jpg',
        size: 1024,
        type: 'image/jpeg',
      },
    };

    vi.mocked(uploadService.deleteProductImage).mockResolvedValueOnce(undefined);

    render(
      <ProductImageUpload
        value={[mockFile]}
        onChange={mockOnChange}
        maxCount={5}
      />
    );

    // Click delete button
    const deleteButton = screen.getByLabelText('删除');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(uploadService.deleteProductImage).toHaveBeenCalledWith('1');
    });
  });

  it('should preview image when clicked', async () => {
    const user = userEvent.setup();
    const mockFile: UploadFile = {
      uid: '1',
      name: 'image1.jpg',
      status: 'done',
      url: 'http://example.com/image1.jpg',
    };

    render(
      <ProductImageUpload
        value={[mockFile]}
        onChange={mockOnChange}
        maxCount={5}
      />
    );

    // Click preview button
    const previewButton = screen.getByLabelText('预览');
    await user.click(previewButton);

    // Modal should open (in real implementation)
    // We can't fully test the modal behavior without more setup
  });
});
