import React from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@ant-design/pro-components';
import { Card } from 'antd';
import GenerateVariantsForm from '../components/GenerateVariantsForm';
import ProductVariantsList from '../components/ProductVariantsList';
import AttributeLinesForm from '../components/AttributeLinesForm';

const ProductVariantsManagement: React.FC = () => {
  const params = useParams();
  const productId = params.id as string;

  return (
    <PageContainer>
      <Card title="Generate Variants">
        <GenerateVariantsForm productId={productId} />
      </Card>
      <Card title="Attribute Lines" style={{ marginTop: 16 }}>
        <AttributeLinesForm productId={productId} />
      </Card>
      <Card title="Variants List" style={{ marginTop: 16 }}>
        <ProductVariantsList productId={productId} />
      </Card>
    </PageContainer>
  );
};

export default ProductVariantsManagement;
