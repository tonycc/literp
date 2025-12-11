import React, { useEffect, useState } from 'react';
import { ModalForm, ProFormSelect, ProFormDigit, ProForm } from '@ant-design/pro-components';
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

interface VariantStockAdjustFormValues {
  type: 'inbound' | 'outbound' | 'reserve' | 'release';
  delta: number;
  warehouseId: string;
  unitId: string;
}

const VariantStockAdjustModal: React.FC<VariantStockAdjustModalProps> = ({ productId, variantId, visible, onClose, onUpdated }) => {
  const [form] = ProForm.useForm<VariantStockAdjustFormValues>();
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
      void fetchOptions();
    }
  }, [visible, form, message]);

  const handleSubmit = async (values: VariantStockAdjustFormValues) => {
    try {
      const resp = await ProductVariantsService.adjustVariantStock(productId, variantId, {
        type: values.type,
        delta: Number(values.delta),
        warehouseId: values.warehouseId,
        unitId: values.unitId,
      });
      if (resp.success) {
        message.success('库存调整成功');
        onUpdated?.();
        return true;
      } else {
        message.error(resp.message || '库存调整失败');
        return false;
      }
    } catch {
      message.error('提交失败，请重试');
      return false;
    }
  };

  return (
    <ModalForm<VariantStockAdjustFormValues>
      title="库存调整"
      open={visible}
      onOpenChange={(open) => !open && onClose()}
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      width={500}
      modalProps={{ destroyOnClose: true }}
    >
      <ProFormSelect
        name="type"
        label="操作类型"
        rules={[{ required: true, message: '请选择操作类型' }]}
        options={[
          { label: '入库', value: 'inbound' },
          { label: '出库', value: 'outbound' },
          { label: '锁定', value: 'reserve' },
          { label: '释放锁定', value: 'release' },
        ]}
      />
      <ProFormDigit
        name="delta"
        label="数量"
        rules={[{ required: true, message: '请输入数量' }]}
        min={1}
        fieldProps={{ precision: 0, style: { width: '100%' } }}
      />
      <ProFormSelect
        name="warehouseId"
        label="仓库"
        rules={[{ required: true, message: '请选择仓库' }]}
        options={warehouses}
        fieldProps={{ showSearch: true }}
      />
      <ProFormSelect
        name="unitId"
        label="计量单位"
        rules={[{ required: true, message: '请选择计量单位' }]}
        options={units}
        fieldProps={{ showSearch: true }}
      />
    </ModalForm>
  );
};

export default VariantStockAdjustModal;
