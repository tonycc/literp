import React, { useMemo } from 'react';
import { Button } from 'antd';
import { ProForm, ProFormList, ProFormSelect, ProFormDependency } from '@ant-design/pro-components';
import { useProductVariants } from '../hooks/useProductVariants';
import { useProductAttributeOptions } from '../hooks/useProductAttributeOptions';
import { useProductAttributeLines } from '../hooks/useProductAttributeLines';
import { useMessage } from '@/shared/hooks';

interface GenerateVariantsFormProps {
  productId: string;
}

interface FormValues {
  attributes: { attributeName: string; values: string[] }[];
}

const GenerateVariantsForm: React.FC<GenerateVariantsFormProps> = ({ productId }) => {
  const { generateVariants, loading } = useProductVariants(productId);
  const { attributeNameOptions, valuesMap, loading: loadingOptions } = useProductAttributeOptions();
  const message = useMessage();
  const { attributes: existingLines, save: saveLines } = useProductAttributeLines(productId);

  const initialValues = useMemo(() => ({ attributes: existingLines || [] }), [existingLines]);

  const onFinish = async (values: FormValues) => {
    if (!values?.attributes?.length) {
      message.error('请至少选择一个属性');
      return;
    }
    // 校验每个属性的取值
    for (const a of values.attributes) {
      if (!a.attributeName || !Array.isArray(a.values) || a.values.length === 0) {
        message.error('属性与取值均为必选');
        return;
      }
    }
    const saved = await saveLines(values.attributes);
    if (!saved) return;
    await generateVariants(values.attributes);
  };

  return (
    <ProForm<FormValues>
      initialValues={initialValues}
      onFinish={onFinish}
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
          rules={[{ required: true, message: '请选择属性' }]}
          options={attributeNameOptions}
          fieldProps={{
            showSearch: true,
            filterOption: (input, option) => (option?.label as string)?.includes(input),
          }}
        />
        <ProFormDependency key="attributeValues" name={["attributeName"]}>
          {(deps: { attributeName?: string }) => {
            const valueList: string[] = deps?.attributeName ? valuesMap[deps.attributeName] ?? [] : [];
            const options = valueList.map((v: string) => ({ label: v, value: v }));
            return (
              <ProFormSelect
                name={["values"]}
                label="取值"
                rules={[{ required: true, message: '请选择取值' }]}
                options={options}
                fieldProps={{ mode: 'multiple' }}
              />
            );
          }}
        </ProFormDependency>
      </ProFormList>
    </ProForm>
  );
};

export default GenerateVariantsForm;
