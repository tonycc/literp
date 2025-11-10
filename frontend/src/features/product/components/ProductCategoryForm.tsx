import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Switch,
  Select,
  Button,
  Space,
  Row,
  Col,
  Card
} from 'antd';
import { SaveOutlined, UndoOutlined } from '@ant-design/icons';
import type { ProductCategoryInfo, ProductCategoryFormData } from '@zyerp/shared';
import { useProductCategory } from '../hooks/useProductCategory';
import { 
  PRODUCT_CATEGORY_VALIDATION,
  PRODUCT_CATEGORY_DEFAULTS 
} from '../constants/productCategory';

const { TextArea } = Input;
const { Option } = Select;

interface ProductCategoryFormProps {
  initialValues?: ProductCategoryInfo;
  onSubmit?: (values: ProductCategoryFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

const ProductCategoryForm: React.FC<ProductCategoryFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create'
}) => {
  const [form] = Form.useForm();
  const [categoryOptions, setCategoryOptions] = useState<Array<{value: string, label: string}>>([]);
  
  const { 
    getCategoryOptions
  } = useProductCategory();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        sortOrder: initialValues.sortOrder,
        isActive: initialValues.isActive,
        parentCode: initialValues.parentCode
      });
    }
    
    // 加载类别选项
    loadCategoryOptions();
  }, [initialValues, form]);

  const loadCategoryOptions = async () => {
    try {
      const options = await getCategoryOptions({ level: 1, isActive: true });
      setCategoryOptions(options.map(opt => ({
        value: opt.value,
        label: opt.label
      })));
    } catch {
      // 加载类别选项失败时的错误处理
    }
  };



  const handleSubmit = async (values: ProductCategoryFormData) => {
    try {
      // 只调用onSubmit回调，由父组件处理创建/更新逻辑
      onSubmit?.(values);
      
      if (mode === 'create') {
        form.resetFields();
      }
    } catch {
      // 表单提交失败时的错误处理
    }
  };



  const handleReset = () => {
    form.resetFields();
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        sortOrder: initialValues.sortOrder,
        isActive: initialValues.isActive
      });
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isActive: PRODUCT_CATEGORY_DEFAULTS.IS_ACTIVE,
          sortOrder: PRODUCT_CATEGORY_DEFAULTS.SORT_ORDER
        }}
        autoComplete="off"
      >
      
        <Row gutter={16}>
           <Col span={12}>
            <Form.Item
              label="上级类目"
              name="parentCode"
            >
              <Select 
                placeholder="请选择上级类别（可选）"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {categoryOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
           <Form.Item
            label="上级类目编码"
            name="parentCode"
          >
            <Input 
              placeholder="上级类目编码"
              allowClear
              disabled
            />
           </Form.Item>
          </Col>
         
        
        </Row>
          <Row gutter={16}>
          
          <Col span={12}>
            <Form.Item
              label="类目名称"
              name="name"
              rules={[
                { required: true, message: PRODUCT_CATEGORY_VALIDATION.NAME.message.required },
                { min: PRODUCT_CATEGORY_VALIDATION.NAME.min, message: PRODUCT_CATEGORY_VALIDATION.NAME.message.min },
                { max: PRODUCT_CATEGORY_VALIDATION.NAME.max, message: PRODUCT_CATEGORY_VALIDATION.NAME.message.max }
              ]}
            >
              <Input placeholder="请输入类型名称，如：电子产品" />
            </Form.Item>
          </Col>
            <Col span={12}>
            <Form.Item
              label="状态"
              name="isActive"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="启用"
                unCheckedChildren="停用"
              />
            </Form.Item>
          </Col>
          
        </Row>

        <Form.Item
          label="描述"
          name="description"
          rules={[
            { max: PRODUCT_CATEGORY_VALIDATION.DESCRIPTION.max, message: PRODUCT_CATEGORY_VALIDATION.DESCRIPTION.message.max }
          ]}
        >
          <TextArea
            placeholder="请输入类型描述"
            rows={4}
            showCount
            maxLength={PRODUCT_CATEGORY_VALIDATION.DESCRIPTION.max}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              {mode === 'create' ? '创建' : '保存'}
            </Button>
            <Button
              icon={<UndoOutlined />}
              onClick={handleReset}
            >
              重置
            </Button>
            {onCancel && (
              <Button onClick={onCancel}>
                取消
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProductCategoryForm;