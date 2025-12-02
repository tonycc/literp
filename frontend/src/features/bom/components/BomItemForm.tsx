import React from 'react';
import { ModalForm, ProFormSelect } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { BomService } from '../services/bom.service';
import { useMessage } from '@/shared/hooks';

interface BomItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  initialChildBomId?: string;
  onSubmit: (payload: { childBomId: string }) => Promise<void> | void;
  form?: FormInstance;
}

interface BomItemFormValues {
  childBomId: string;
}

/**
 * 子BOM绑定表单
 * 使用 Pro 的 ModalForm + ProFormSelect，按规范 layout="horizontal"
 */
const BomItemForm: React.FC<BomItemFormProps> = ({
  open,
  onOpenChange,
  materialId,
  initialChildBomId,
  onSubmit,
  form,
}) => {
  const message = useMessage();

  return (
    <ModalForm<BomItemFormValues>
      form={form}
      open={open}
      onOpenChange={onOpenChange}
      title="绑定子BOM"
      layout="horizontal"
      width={480}
      modalProps={{ destroyOnClose: true }}
      initialValues={{ childBomId: initialChildBomId }}
      onFinish={async (values) => {
        try {
          await onSubmit({ childBomId: values.childBomId });
          return true;
        } catch (error) {
          console.error('绑定子BOM失败:', error);
          message.error('绑定子BOM失败');
          return false;
        }
      }}
    >
      <ProFormSelect
        name="childBomId"
        label="子BOM"
        placeholder={materialId ? '请选择子BOM' : '请先选择物料'}
        showSearch
        rules={[{ required: true, message: '请选择子BOM' }]}
        request={async () => {
          if (!materialId) return [];
          try {
            const res = await BomService.getList({ productId: materialId, status: 'active', pageSize: 100 });
            const options = res.data || [];
            return options.map((b) => ({
              value: b.id,
              label: `${b.code} ${b.name}（${b.version}）`,
            }));
          } catch (error) {
            console.error('加载子BOM选项失败:', error);
            message.error('加载子BOM选项失败');
            return [];
          }
        }}
      />
    </ModalForm>
  );
};

export default BomItemForm;