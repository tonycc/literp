import React from 'react';
import {
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormSwitch,
  ProFormDatePicker,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import type { BomFormData, ProductInfo, UnitInfo, Routing } from '@zyerp/shared';

interface BomFormProps {
  form: FormInstance;
  initialValues?: Partial<BomFormData>;
  products: ProductInfo[];
  units: UnitInfo[];
  routings: Routing[];
}

const BomForm: React.FC<BomFormProps> = ({ form, initialValues, products, units, routings }) => {
  return (
    <ProForm
      form={form}
      layout="vertical"
      initialValues={initialValues}
      submitter={false}
    >
      <Row gutter={16}>
        <Col span={8}>
          <ProFormText
            name="code"
            label="BOM编码"
            placeholder="系统自动生成"
            disabled
          />
        </Col>
        <Col span={8}>
          <ProFormText
            name="name"
            label="BOM名称"
            placeholder="请输入BOM名称"
            rules={[{ required: true, message: '请输入BOM名称' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormSelect
            name="productId"
            label="产品"
            placeholder="请选择产品"
            options={products.map(product => ({
              value: product.id,
              label: `${product.code} - ${product.name}`
            }))}
            showSearch
            rules={[{ required: true, message: '请选择产品' }]}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <ProFormSelect
            name="type"
            label="BOM类型"
            placeholder="请选择BOM类型"
            options={[
              { value: 'production', label: '生产BOM' },
              { value: 'engineering', label: '工程BOM' },
              { value: 'sales', label: '销售BOM' }
            ]}
            rules={[{ required: true, message: '请选择BOM类型' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormText
            name="version"
            label="版本"
            placeholder="如：V1.0"
            rules={[{ required: true, message: '请输入版本' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormSelect
            name="status"
            label="状态"
            placeholder="请选择状态"
            options={[
              { value: 'draft', label: '草稿' },
              { value: 'active', label: '启用' },
              { value: 'inactive', label: '停用' },
              { value: 'archived', label: '归档' }
            ]}
            rules={[{ required: true, message: '请选择状态' }]}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <ProFormDigit
            name="baseQuantity"
            label="基准数量"
            placeholder="请输入基准数量"
            min={0}
            precision={2}
            rules={[{ required: true, message: '请输入基准数量' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormSelect
            name="baseUnitId"
            label="基准单位"
            placeholder="请选择基准单位"
            options={units.map(unit => ({
              value: unit.id,
              label: `${unit.name} (${unit.symbol})`
            }))}
            showSearch
            rules={[{ required: true, message: '请选择基准单位' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormSelect
            name="routingId"
            label="工艺路线"
            placeholder="请选择工艺路线"
            options={routings.map(routing => ({
              value: routing.id,
              label: `${routing.code} - ${routing.name}`
            }))}
            showSearch
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <ProFormDatePicker
            name="effectiveDate"
            label="生效日期"
            placeholder="请选择生效日期"
            rules={[{ required: true, message: '请选择生效日期' }]}
          />
        </Col>
        <Col span={8}>
          <ProFormDatePicker
            name="expiryDate"
            label="失效日期"
            placeholder="请选择失效日期"
          />
        </Col>
        <Col span={8}>
          <ProFormSwitch
            name="isDefault"
            label="默认BOM"
          />
        </Col>
      </Row>

      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入BOM描述"
        fieldProps={{ rows: 3 }}
      />

      <ProFormTextArea
        name="remark"
        label="备注"
        placeholder="请输入备注"
        fieldProps={{ rows: 2 }}
      />
    </ProForm>
  );
};

export default BomForm;