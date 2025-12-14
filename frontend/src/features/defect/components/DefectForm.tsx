import React, { useEffect } from 'react';
import { Modal, Form } from 'antd';
import { ProForm, ProFormText, ProFormTextArea, ProFormSwitch } from '@ant-design/pro-components';
import type { Defect } from '../services/defect.service';

interface DefectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values?: Partial<Defect> | null;
  onSubmit: (values: Partial<Defect>) => Promise<void>;
}

export const DefectForm: React.FC<DefectFormProps> = ({
  open,
  onOpenChange,
  values,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (values) {
        form.setFieldsValue(values);
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true });
      }
    }
  }, [open, values, form]);

  return (
    <Modal
      title={values ? '编辑不良品项' : '新建不良品项'}
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={null}
      destroyOnClose
    >
      <ProForm<Partial<Defect>>
        form={form}
        onFinish={onSubmit}
        submitter={{
          searchConfig: {
            submitText: '提交',
            resetText: '取消',
          },
          onReset: () => onOpenChange(false),
        }}
      >
        <ProFormText
          name="code"
          label="不良品项代码"
          placeholder="不填写则系统自动生成"
          disabled={!!values?.id}
        />
        <ProFormText
          name="name"
          label="不良品项名称"
          placeholder="请输入不良品项名称"
          rules={[{ required: true, message: '请输入不良品项名称' }]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入描述"
        />
        <ProFormSwitch
          name="isActive"
          label="状态"
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      </ProForm>
    </Modal>
  );
};
