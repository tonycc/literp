import React, { useEffect, useRef } from 'react';
import { Button } from 'antd';
import { ProForm, ProFormList, ProFormSelect, ProFormDependency } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useProductVariants } from '../hooks/useProductVariants';
import { useProductAttributeOptions } from '../hooks/useProductAttributeOptions';
import { useProductAttributeLines } from '../hooks/useProductAttributeLines';

import { useMessage } from '@/shared/hooks';

interface GenerateVariantsFormProps {
  productId: string;
}

interface FormValues {
  attributes: { attributeName: string | string[]; values: string[] }[];
}

const GenerateVariantsForm: React.FC<GenerateVariantsFormProps> = ({ productId }) => {
  const { attributeNameOptions, valuesMap, loading: loadingOptions } = useProductAttributeOptions();
  const { attributes: existingLines, save: saveLines } = useProductAttributeLines(productId);
  const message = useMessage();
  const { generateVariants, loading } = useProductVariants(productId);

  const onFinish = async (values: FormValues) => {
    if (!values?.attributes?.length) {
      message.error('请至少选择一个属性');
      return;
    }
    
    // 处理属性名可能为数组的情况（tags模式）
    const normalizedAttributes = values.attributes.map(a => ({
      ...a,
      attributeName: Array.isArray(a.attributeName) ? a.attributeName[0] : a.attributeName
    }));

    // 校验每个属性的取值
    for (const a of normalizedAttributes) {
      if (!a.attributeName || !Array.isArray(a.values) || a.values.length === 0) {
        message.error('属性与取值均为必选');
        return;
      }
    }
    
    const saved = await saveLines(normalizedAttributes as { attributeName: string; values: string[] }[]);
    if (!saved) return;
    await generateVariants(normalizedAttributes as { attributeName: string; values: string[] }[]);
  };
  const formRef = useRef<ProFormInstance<FormValues> | undefined>(undefined);

  // 监听数据变化，动态更新表单值
  useEffect(() => {
    if (existingLines && formRef.current) {
      formRef.current.setFieldsValue({ attributes: existingLines });
    }
  }, [existingLines]);

  return (
    <ProForm<FormValues>
      formRef={formRef} // 绑定 ref
      // initialValues={initialValues} // 移除不可靠的 initialValues
      onFinish={async (values) => {
        await onFinish(values);
        return true;
      }}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      submitter={{
        searchConfig: {
          submitText: '生成变体',
        },
        render: () => (
          <Button type="primary" htmlType="submit" loading={loading || loadingOptions}>
            生成变体
          </Button>
        ),
      }}
    >
      <ProFormList name="attributes" creatorButtonProps={{ creatorButtonText: '添加属性' }}>
        <ProFormSelect
          key="attributeName"
          name={["attributeName"]}
          label="属性"
          rules={[{ required: true, message: '请选择或输入属性' }]}
          options={attributeNameOptions}
          fieldProps={{
            mode: 'tags',
            maxTagCount: 1,
            showSearch: true,
            filterOption: (input, option) => (option?.label as string)?.includes(input),
          }}
        />
        <ProFormDependency key="attributeValues" name={["attributeName"]}>
          {(deps: { attributeName?: string | string[] }) => {
            const rawName = deps?.attributeName;
            const name = Array.isArray(rawName) ? rawName[0] : rawName;
            const valueList: string[] = name ? valuesMap[name] ?? [] : [];
            const options = valueList.map((v: string) => ({ label: v, value: v }));
            return (
              <ProFormSelect
                name={["values"]}
                label="取值"
                rules={[{ required: true, message: '请选择或输入取值' }]}
                options={options}
                fieldProps={{ mode: 'tags' }}
              />
            );
          }}
        </ProFormDependency>
      </ProFormList>
    </ProForm>
  );
};

export default GenerateVariantsForm;