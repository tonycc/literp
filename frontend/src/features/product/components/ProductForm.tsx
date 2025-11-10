import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Space,
  Divider,
  Modal
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { ProductType, ProductStatus, PRODUCT_TYPE_OPTIONS, PRODUCT_STATUS_OPTIONS, ACQUISITION_METHOD_OPTIONS } from '@zyerp/shared';
import type { ProductInfo, ProductFormData, ProductCategoryOption } from '@zyerp/shared';
import { productCategoryService } from '../services/productCategory.service';
import { productService } from '../services/product.service';
import { unitService, type UnitOption } from '../../../shared/services/unit.service';
import { warehouseService, type WarehouseOption } from '../../../shared/services/warehouse.service';
import { useMessage } from '../../../shared/hooks';
import ProductImageUpload from './ProductImageUpload';

const { Option } = Select;

interface ProductFormProps {
  product?: ProductInfo;
  visible: boolean;
  onSave: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  visible,
  onSave,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm();
  const message = useMessage();

  const [codeGenerated, setCodeGenerated] = useState(false);

  // 产品类目选项状态
  const [productCategoryOptions, setProductCategoryOptions] = useState<ProductCategoryOption[]>([]);
  // 单位选项状态
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);
  // 仓库选项状态
  const [warehouseOptions, setWarehouseOptions] = useState<WarehouseOption[]>([]);
  // 使用共享包统一选项定义
  const productTypeOptions = PRODUCT_TYPE_OPTIONS;
  const productStatusOptions = PRODUCT_STATUS_OPTIONS;
  const acquisitionMethodOptions = ACQUISITION_METHOD_OPTIONS;





  // 获取产品类别、单位和仓库选项
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // 获取产品类别选项
        const response = await productCategoryService.getOptions({ isActive: true });
        if (response.success && response.data) {
          setProductCategoryOptions(response.data);
        }
        
        // 获取单位选项
        const unitOpts = await unitService.getOptions();
        setUnitOptions(unitOpts);
        
        // 获取仓库选项
        const warehouseOpts = await warehouseService.getOptions();
        setWarehouseOptions(warehouseOpts);
      } catch (error) {
        console.error('获取选项数据失败:', error);
      }
    };

    if (visible) {
      fetchOptions();
    }
  }, [visible]);

  // 初始化表单数据
  useEffect(() => {
    if (visible) {
      if (product) {
        // 编辑模式
        form.setFieldsValue({
          code: product.code,
          name: product.name,
          type: product.type,
          categoryId: product.categoryId,
          unitId: product.unitId,
          defaultWarehouseId: product.warehouse?.id,
          model: product.model,
          barcode: product.barcode,
          qrCode: product.qrCode,
          acquisitionMethod: product.acquisitionMethod,
          standardCost: product.standardCost,
          averageCost: product.averageCost,
          latestCost: product.latestCost,
          safetyStock: product.safetyStock,
          safetyStockMin: product.safetyStockMin,
          safetyStockMax: product.safetyStockMax,
          minStock: product.minStock,
          maxStock: product.maxStock,
          reorderPoint: product.reorderPoint,
          status: product.status,
          description: product.description,
          remark: product.remark
        });
        setCodeGenerated(true);
      } else {
        // 新增模式
        form.resetFields();
        form.setFieldsValue({
          type: ProductType.RAW_MATERIAL,
          status: ProductStatus.ACTIVE,
          acquisitionMethod: 'purchase',  // 设置获取方式的默认值为"采购"
        });
        setCodeGenerated(false);
      }
    }
  }, [visible, product, form]);

  // 生成产品编码
  const generateProductCode = () => {
    const type = form.getFieldValue('type');
    
    let prefix = 'PRD';
    if (type === ProductType.RAW_MATERIAL) prefix = 'RM';
    else if (type === ProductType.SEMI_FINISHED_PRODUCT) prefix = 'SF';
    else if (type === ProductType.FINISHED_PRODUCT) prefix = 'FP';
    
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const serial = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const code = `${prefix}${date}${serial}`;
    form.setFieldsValue({ code });
    setCodeGenerated(true);
    message.success('产品编码已生成');
  };

  // 表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: ProductFormData = {
        ...values,
      };
      await onSave(formData);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 产品编码验证器
  const validateProductCode = async (_rule: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入产品编码'));
    }

    // 基础格式验证
    const codePattern = /^[A-Z]{2,4}\d{8,12}$/;
    if (!codePattern.test(value)) {
      return Promise.reject(new Error('产品编码格式不正确，应为：2-4位大写字母+8-12位数字'));
    }

    try {
      const response = await productService.validateProductCode(value, product?.id);
      if (!response.success || !response.data?.isValid) {
        return Promise.reject(new Error(response.data?.message || '产品编码已存在，请使用其他编码'));
      }
      return Promise.resolve();
    } catch (error) {
      console.error('验证产品编码失败:', error);
      return Promise.reject(new Error('验证产品编码失败，请检查网络连接'));
    }
  };

  // 产品名称验证器
  const validateProductName = async (_rule: unknown, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请输入产品名称'));
    }

    if (value.length < 2) {
      return Promise.reject(new Error('产品名称至少需要2个字符'));
    }

    if (value.length > 100) {
      return Promise.reject(new Error('产品名称不能超过100个字符'));
    }

    return Promise.resolve();
  };

  // 成本验证器
  const validateCost = (fieldName: string) => async (_rule: unknown, value: number | undefined) => {
    if (value !== undefined && value !== null) {
      if (value < 0) {
        return Promise.reject(new Error(`${fieldName}不能为负数`));
      }
      if (value > 99999999.99) {
        return Promise.reject(new Error(`${fieldName}不能超过99,999,999.99`));
      }
    }
    return Promise.resolve();
  };

  // 库存验证器
  const validateStock = (fieldName: string) => async (_rule: unknown, value: number | undefined) => {
    if (value !== undefined && value !== null) {
      if (value < 0) {
        return Promise.reject(new Error(`${fieldName}不能为负数`));
      }
      if (!Number.isInteger(value)) {
        return Promise.reject(new Error(`${fieldName}必须为整数`));
      }
      if (value > 9999999) {
        return Promise.reject(new Error(`${fieldName}不能超过9,999,999`));
      }
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title={product ? '编辑产品' : '新增产品'}
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="产品编码"
                name="code"
                rules={[
                  { required: true, message: '请输入产品编码' },
                  { validator: validateProductCode }
                ]}
                validateTrigger="onBlur"
              >
                <Input
                  placeholder="产品编码，格式：字母+数字"
                  addonAfter={
                    !product && (
                      <Button
                        type="link"
                        size="small"
                        onClick={generateProductCode}
                        disabled={codeGenerated}
                      >
                        生成
                      </Button>
                    )
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="产品名称"
                name="name"
                rules={[
                  { required: true, message: '请输入产品名称' },
                  { validator: validateProductName }
                ]}
                validateTrigger="onBlur"
              >
                <Input placeholder="产品名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="产品属性"
                name="type"
                rules={[{ required: true, message: '请选择产品属性' }]}
              >
                <Select placeholder="选择产品属性">
                  {productTypeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          
          </Row>

          <Row gutter={16}>
              <Col span={8}>
              <Form.Item
              label="产品类目"
              name="categoryId"
              rules={[{ required: true, message: '请选择产品类目' }]}
            >
              <Select placeholder="选择产品类目">
                  {productCategoryOptions.map((option, index) => (
                    <Option key={option.value || `category-${index}`} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
               label='产品规格'
               name="specification"
               rules={[
                 { required: true, message: '请输入产品规格' },
               ]}
            >
              <Input placeholder="如：500ml、1kg、XL等" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="计量单位"
                name="unitId"
                rules={[{ required: true, message: '请选择计量单位' }]}
              >
                <Select placeholder="选择计量单位" showSearch>
                  {unitOptions.map((unit, index) => (
                    <Option key={unit.value || `unit-${index}`} value={unit.value}>
                      {unit.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
           
          </Row>

          <Row gutter={16}>
             <Col span={8}>
              <Form.Item 
                label="默认仓库" 
                name="defaultWarehouseId"
                rules={[{ required: true, message: '请选择默认仓库' }]}
              >
                <Select placeholder="选择默认仓库" showSearch>
                  {warehouseOptions.map((warehouse, index) => (
                    <Option key={warehouse.value || `warehouse-${index}`} value={warehouse.value}>
                      {warehouse.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
             <Col span={8}>
              <Form.Item
                label="获取方式"
                name="acquisitionMethod"
                rules={[{ required: true, message: '请选择获取方式' }]}
              >
                <Select placeholder="选择获取方式">
                  {acquisitionMethodOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
             <Col span={8}>
              <Form.Item
                label="产品状态"
                name="status"
                rules={[{ required: true, message: '请选择产品状态' }]}
              >
                <Select placeholder="选择产品状态">
                  {productStatusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Card title="成本与库存" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="标准成本"
                name="standardCost"
                rules={[
                  { validator: validateCost('标准成本') }
                ]}
                validateTrigger="onChange"
              >
                <InputNumber
                  placeholder="标准成本"
                  style={{ width: '100%' }}
                  precision={2}
                  min={0}
                  max={99999999.99}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="安全库存下限"
                name="safetyStockMin"
                rules={[
                  { validator: validateStock('安全库存下限') }
                ]}
                validateTrigger="onChange"
              >
                <InputNumber
                  placeholder="安全库存下限"
                  min={0}
                  max={9999999}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="安全库存上限"
                name="safetyStockMax"
                rules={[
                  { validator: validateStock('安全库存上限') }
                ]}
                validateTrigger="onChange"
              >
                <InputNumber
                  placeholder="安全库存上限"
                  min={0}
                  max={9999999}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="产品图片" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="产品图片"
                name="images"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                }}
              >
                <ProductImageUpload maxCount={5} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider />

        <Row justify="end">
          <Space>
            <Button onClick={onCancel} icon={<CloseOutlined />}>
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              保存
            </Button>
          </Space>
        </Row>
      </Form>
    </Modal>
  );
};

export default ProductForm;