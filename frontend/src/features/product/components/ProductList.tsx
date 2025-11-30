import React from 'react';
import type { ActionType } from '@ant-design/pro-components';
import type { ProductInfo } from '@zyerp/shared';
import ProductVariantsList from '@/features/product-variants/components/ProductVariantsList'; // Direct reuse of list

interface ProductListProps {
  onAdd: () => void;
  onEdit: (product: ProductInfo) => void;
  onView: (product: ProductInfo) => void;
  onDelete: (id: string) => Promise<void>;
  onCopy?: (id: string) => Promise<void>;
  onRefresh: () => void;
  actionRef?: React.Ref<ActionType>;
}

const ProductList: React.FC<ProductListProps> = React.memo(({ onAdd, actionRef }) => {
  // Replaced ProductList with Global ProductVariantsList
  // But kept the wrapper to maintain page layout structure if needed
  return (
       <ProductVariantsList onAddProduct={onAdd} actionRef={actionRef as React.MutableRefObject<ActionType | undefined>} />
  );
});

export default ProductList;
