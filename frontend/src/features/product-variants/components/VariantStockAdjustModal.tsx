import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, InputNumber, Button } from 'antd';
import { useMessage } from '@/shared/hooks';
import { ProductVariantsService } from '../services/product-variants.service';
import { warehouseService } from '@/shared/services/warehouse.service';
import { unitService } from '@/shared/services/unit.service';

interface VariantStockAdjustModalProps {
  productId: string;
  variantId: string;
  visible: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const VariantStockAdjustModal: React.FC<VariantStockAdjustModalProps> = ({ productId, variantId, visible, onClose, onUpdated }) => {
  const [form] = Form.useForm();
  const message = useMessage();
  const [warehouses, setWarehouses] = useState<Array<{ label: string; value: string }>>([]);
  const [units, setUnits] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const w = await warehouseService.getOptions();
        setWarehouses((w || []).map((it) => ({ label: it.label ?? (it as { name?: string }).name ?? '', value: it.value })));
        const u = await unitService.getOptions();
        setUnits((u || []).map((it) => ({ label: it.label ?? (it as { name?: string }).name ?? '', value: it.value })));
      } catch {
        message.error('加载仓库/单位选项失败');
      }
    };
    if (visible) {
      form.resetFields();
      fetchOptions();
    }
  }, [visible, form, message]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const resp = await ProductVariantsService.adjustVariantStock(productId, variantId, {
        type: values.type,
        delta: Number(values.delta),
        warehouseId: values.warehouseId,
        unitId: values.unitId,
      });
      if (resp.success) {
        message.success('库存调整成功');
        onUpdated?.();
        onClose();
      } else {
        message.error(resp.message || '库存调整失败');
      }
    } catch {
      message.error('提交失败，请重试');
    }
  };

  return (
    <Modal title="库存调整" open={visible} onCancel={onClose} footer={null} destroyOnHidden>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="操作类型" name="type" rules={[{ required: true, message: '请选择操作类型' }]}>
          <Select
            placeholder="选择类型"
            options={[
              { label: '入库', value: 'inbound' },
              { label: '出库', value: 'outbound' },
              { label: '锁定', value: 'reserve' },
              { label: '释放锁定', value: 'release' },
            ]}
          />
        </Form.Item>
        <Form.Item label="数量" name="delta" rules={[{ required: true, message: '请输入数量' }]}>
          <InputNumber style={{ width: '100%' }} min={1} precision={0} />
        </Form.Item>
        <Form.Item label="仓库" name="warehouseId" rules={[{ required: true, message: '请选择仓库' }]}>
          <Select placeholder="选择仓库" options={warehouses} showSearch />
        </Form.Item>
        <Form.Item label="计量单位" name="unitId" rules={[{ required: true, message: '请选择计量单位' }]}>
          <Select placeholder="选择单位" options={units} showSearch />
        </Form.Item>
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>取消</Button>
          <Button type="primary" htmlType="submit">确认</Button>
        </div>
      </Form>
    </Modal>
  );
};

export default VariantStockAdjustModal;
