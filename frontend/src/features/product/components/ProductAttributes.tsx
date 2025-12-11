import React from 'react';
import { Form, Input, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

interface FormListFieldData {
  name: number;
  key: number;
}

interface FormListOperation {
  add: (defaultValue?: unknown, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

const ProductAttributes: React.FC = () => {
  return (
    <Form.List name="attributes">
      {(fields: FormListFieldData[], { add, remove }: FormListOperation) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <Form.Item
                {...restField}
                name={[name, 'name']}
                rules={[{ required: true, message: '请输入属性名称' }]}
              >
                <Input placeholder="属性名称（例如：颜色）" />
              </Form.Item>
              <Form.Item
                {...restField}
                name={[name, 'values']}
                rules={[{ required: true, message: '请输入属性值' }]}
              >
                <Input placeholder="属性值（用逗号分隔，例如：红色,蓝色）" />
              </Form.Item>
              <MinusCircleOutlined onClick={() => remove(name)} />
            </Space>
          ))}
          <Form.Item>
            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
              添加属性
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};

export default ProductAttributes;