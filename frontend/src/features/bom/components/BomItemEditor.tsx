import React, { useEffect, useState } from 'react';
import { Form, Modal, InputNumber, Select, Button, Space } from 'antd';
import { ProForm } from '@ant-design/pro-components';
import type { BomItem, ProductInfo, VariantInfo, UnitInfo } from '@zyerp/shared';
import { useMessage } from '@/shared/hooks';

interface BomItemEditorProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<BomItem> & { materialId?: string; materialVariantId?: string }) => Promise<void>;
  products: ProductInfo[];
  getVariantsByProduct: (productId: string) => Promise<VariantInfo[]>;
  units: UnitInfo[];
  initial?: Partial<BomItem> & { materialVariantId?: string };
}

interface BomItemFormValues extends Partial<BomItem> {
  materialId?: string;
  materialVariantId?: string;
  quantity?: number;
  unitId?: string;
}

const BomItemEditor: React.FC<BomItemEditorProps> = ({ visible, onClose, onSubmit, products, getVariantsByProduct, units, initial }) => {
  const [form] = ProForm.useForm<BomItemFormValues>();
  const [useVariant, setUseVariant] = useState<boolean>(!!initial?.materialVariantId);
  const [variants, setVariants] = useState<VariantInfo[]>([]);
  const message = useMessage();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue(initial || {});
      setUseVariant(!!initial?.materialVariantId);
    }
  }, [visible, initial, form]);

  const handleProductChange = (pid: string) => {
    const loadVariants = async () => {
      try {
        const list = await getVariantsByProduct(pid);
        setVariants(list || []);
        form.setFieldsValue({ materialVariantId: undefined });
      } catch {
        message.error('加载变体失败');
      }
    };
    void loadVariants();
  };

  const submit = () => {
    const doSubmit = async () => {
      try {
        const values = await form.validateFields();
        if (!values.materialId && !values.materialVariantId) {
          message.error('请至少选择产品或变体作为物料');
          return;
        }
        await onSubmit(values);
      } catch (error) {
        // Form validation error or submit error
        console.error(error);
      }
    };
    void doSubmit();
  };

  return (
    <Modal open={visible} onCancel={onClose} title="编辑物料" footer={null} destroyOnClose>
      <Form layout="vertical" form={form}>
        <Form.Item label="使用变体作为物料">
          <Space>
            <Button type={useVariant ? 'primary' : 'default'} onClick={() => setUseVariant(true)}>变体</Button>
            <Button type={!useVariant ? 'primary' : 'default'} onClick={() => setUseVariant(false)}>产品</Button>
          </Space>
        </Form.Item>
        <Form.Item label="物料产品" name="materialId" rules={[{ required: !useVariant, message: '请选择物料产品' }]}>
          <Select
            showSearch
            placeholder="选择产品"
            options={products.map(p => ({ label: `${p.code} - ${p.name}`, value: p.id }))}
            onChange={handleProductChange}
            disabled={useVariant}
          />
        </Form.Item>
        {useVariant && (
          <Form.Item label="物料变体" name="materialVariantId" rules={[{ required: true, message: '请选择物料变体' }]}>
            <Select showSearch placeholder="选择变体" options={variants.map(v => ({ label: `${v.code} - ${v.name}`, value: v.id }))} />
          </Form.Item>
        )}
        <Form.Item label="数量" name="quantity" rules={[{ required: true, message: '请输入数量' }]}>
          <InputNumber min={0} precision={4} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="单位" name="unitId" rules={[{ required: true, message: '请选择单位' }]}>
          <Select showSearch placeholder="选择单位" options={units.map(u => ({ label: `${u.name} (${u.symbol})`, value: u.id }))} />
        </Form.Item>
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>取消</Button>
          <Button type="primary" onClick={submit}>保存</Button>
        </div>
      </Form>
    </Modal>
  );
};

export default BomItemEditor;

