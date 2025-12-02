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
  CloseOutlined,
} from '@ant-design/icons';
import { ProductType, ProductStatus } from '@zyerp/shared';
import { PRODUCT_TYPE_OPTIONS, ACQUISITION_METHOD_OPTIONS } from '@/shared/constants/product';
import type { ProductInfo, ProductFormData, ProductCategoryOption } from '@zyerp/shared';
import { productCategoryService } from '../services/productCategory.service';
import { productService } from '../services/product.service';
import { unitService, type UnitOption } from '@/shared/services/unit.service';
import { warehouseService, type WarehouseOption } from '@/shared/services/warehouse.service';
import { useMessage } from '@/shared/hooks';
import ProductImageUpload from './ProductImageUpload';
import { AttributesService } from '../../attributes/services/attributes.service';

const { Option } = Select;

interface ProductFormProps {
  product?: ProductInfo;
  visible: boolean;
  onSave: (data: ProductFormData & { singleAttributeId?: string; singleAttributeName?: string; singleAttributeValue?: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  visible,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const singleAttrId = Form.useWatch('singleAttributeId', form) as string;
  const message = useMessage();

  const [codeGenerated, setCodeGenerated] = useState(false);

  // 产品类目选项状态
  const [productCategoryOptions, setProductCategoryOptions] = useState<ProductCategoryOption[]>([]);
  // 单位选项状态
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);
  // 仓库选项状态
  const [warehouseOptions, setWarehouseOptions] = useState<WarehouseOption[]>([]);
  const [attributeOptions, setAttributeOptions] = useState<{ label: string; value: string }[]>([]);
  const [attributeValuesMap, setAttributeValuesMap] = useState<Record<string, { label: string; value: string }[]>>({});
  // 使用共享包统一选项定义
  const productTypeOptions = PRODUCT_TYPE_OPTIONS;
  const acquisitionMethodOptions = ACQUISITION_METHOD_OPTIONS;





  // 获取产品类别、单位和仓库选项
  useEffect(() => {
    const fetchOptions = async () => {
      // 并行请求，互不阻塞，且单独捕获错误
      const loadCategories = async () => {
        try {
          const response = await productCategoryService.getOptions({ isActive: true });
          if (response.success && response.data) {
            setProductCategoryOptions(response.data);
          }
        } catch (error) {
          console.error('获取产品类别选项失败:', error);
        }
      };

      const loadUnits = async () => {
        try {
          const unitOpts = await unitService.getOptions();
          setUnitOptions(unitOpts);
        } catch (error) {
          console.error('获取单位选项失败:', error);
        }
      };

      const loadWarehouses = async () => {
        try {
          const warehouseOpts = await warehouseService.getOptions();
          setWarehouseOptions(warehouseOpts);
        } catch (error) {
          console.error('获取仓库选项失败:', error);
        }
      };

      const loadAttributes = async () => {
        try {
          const attrResp = await AttributesService.getAttributes({ page: 1, pageSize: 1000 });
          if (attrResp.success) {
            const opts = (attrResp.data || []).map(a => ({ label: a.name, value: a.id }));
            const seen = new Set<string>();
            setAttributeOptions(opts.filter(o => { if (seen.has(o.value)) return false; seen.add(o.value); return true; }));
          }
        } catch (error) {
          console.error('获取属性选项失败:', error);
        }
      };

      await Promise.all([
        loadCategories(),
        loadUnits(),
        loadWarehouses(),
        loadAttributes()
      ]);
    };

    if (visible) {
      void fetchOptions();
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
          categoryCode: product.category?.code || product.categoryId,
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
          remark: product.remark,
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
  }, [visible, product, form, message]);

  // 生成产品编码
  const generateProductCode = () => {
    const type = form.getFieldValue('type') as ProductType;
    
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
      const values = await form.validateFields() as ProductFormData;
      const formData: ProductFormData = {
        ...values,
      };
      await onSave(formData);
    } catch (error) {
      console.error('表单验证失败:', error);
      console.error('[ProductForm] handleSubmit error:', error);
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
        onFinish={() => void handleSubmit()}
      >
        <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="产品编码"
                required
                style={{ marginBottom: 0 }}
              >
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item
                    name="code"
                    rules={[
                      { required: true, message: '请输入产品编码' },
                      { validator: validateProductCode }
                    ]}
                    validateTrigger="onBlur"
                    noStyle
                  >
                    <Input placeholder="产品编码，格式：字母+数字" />
                  </Form.Item>
                  {!product && (
                    <Button
                      type="primary"
                      onClick={generateProductCode}
                      disabled={codeGenerated}
                    >
                      生成
                    </Button>
                  )}
                </Space.Compact>
              </Form.Item>
            </Col>
            {!product && (
              <Col span={8}>
                <Form.Item
                  name="sku"
                  label="SKU"
                  tooltip="如果不填将自动生成"
                >
                  <Input placeholder="请输入SKU" />
                </Form.Item>
              </Col>
            )}
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
           
          
          </Row>

          <Row gutter={16}>
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
              <Col span={8}>
              <Form.Item
              label="产品类目"
              name="categoryCode"
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
        </Card>

        <Card title="成本与价格" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            {!product && (
              <>
                <Col span={8}>
                  <Form.Item
                    label="标准价格"
                    name="standardPrice"
                    rules={[
                      { validator: validateCost('标准价格') }
                    ]}
                    validateTrigger="onChange"
                  >
                    <InputNumber
                      placeholder="标准价格"
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
                    label="销售价格"
                    name="salePrice"
                    rules={[
                      { validator: validateCost('销售价格') }
                    ]}
                    validateTrigger="onChange"
                  >
                    <InputNumber
                      placeholder="销售价格"
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
                    label="采购价格"
                    name="purchasePrice"
                    rules={[
                      { validator: validateCost('采购价格') }
                    ]}
                    validateTrigger="onChange"
                  >
                    <InputNumber
                      placeholder="采购价格"
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
                    label="安全库存"
                    name="safetyStock"
                    rules={[
                      { validator: validateStock('安全库存') }
                    ]}
                    validateTrigger="onChange"
                  >
                    <InputNumber
                      placeholder="安全库存"
                      style={{ width: '100%' }}
                      precision={2}
                      min={0}
                      max={99999999.99}
                      addonAfter={unitOptions.find(u => u.value === form.getFieldValue('unitId'))?.label || '件'}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="最低库存"
                    name="minStock"
                    rules={[
                      { validator: validateStock('最低库存') }
                    ]}
                    validateTrigger="onChange"
                  >
                    <InputNumber
                      placeholder="最低库存"
                      style={{ width: '100%' }}
                      precision={2}
                      min={0}
                      max={99999999.99}
                      addonAfter={unitOptions.find(u => u.value === form.getFieldValue('unitId'))?.label || '件'}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="最高库存"
                    name="maxStock"
                    rules={[
                      { validator: validateStock('最高库存') }
                    ]}
                    validateTrigger="onChange"
                  >
                    <InputNumber
                      placeholder="最高库存"
                      style={{ width: '100%' }}
                      precision={2}
                      min={0}
                      max={99999999.99}
                      addonAfter={unitOptions.find(u => u.value === form.getFieldValue('unitId'))?.label || '件'}
                    />
                  </Form.Item>
                </Col>
              </>
            )}
          </Row>
        </Card>

        {!product && (
          <Card title="产品属性" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="属性名称" name="singleAttributeId">
                  <Select
                    placeholder="选择属性名称"
                    options={attributeOptions}
                    onChange={(attrId: string) => {
                      form.setFieldsValue({ singleAttributeValue: undefined });
                      void (async () => {
                        const resp = await AttributesService.getAttributeValues(attrId);
                        if (resp.success) {
                          const opts = (resp.data || []).map(v => ({ label: v.name, value: v.name }));
                          setAttributeValuesMap(prev => ({ ...prev, [attrId]: opts }));
                          const found = attributeOptions.find(o => o.value === attrId);
                          form.setFieldsValue({ singleAttributeName: found?.label });
                        } else {
                          message.error('获取属性值失败');
                        }
                      })();
                    }}
                    allowClear
                    showSearch
                  />
                </Form.Item>
                <Form.Item name="singleAttributeName" hidden>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="属性值" name="singleAttributeValue">
                  <Select
                    placeholder="选择属性值"
                    options={attributeValuesMap[singleAttrId] || []}
                    allowClear
                    showSearch
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

        <Card title="产品图片" size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="产品图片"
                name="images"
                valuePropName="fileList"
                getValueFromEvent={(e: unknown) => {
                  if (Array.isArray(e)) {
                    return e as unknown[];
                  }
                  return (e as { fileList: unknown[] })?.fileList;
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
