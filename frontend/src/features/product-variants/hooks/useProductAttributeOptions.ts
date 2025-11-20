import { useEffect, useState, useMemo } from 'react';
import { ProductAttributeService, type ProductAttributeOption } from '../services/product-attribute.service';
import { useMessage } from '@/shared/hooks';

export const useProductAttributeOptions = () => {
  const message = useMessage();
  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState<ProductAttributeOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const resp = await ProductAttributeService.getAttributes();
        if (resp.success) {
          setAttributes(resp.data);
        } else {
          message.error('获取属性配置失败');
        }
      } catch {
        message.error('获取属性配置失败');
      } finally {
        setLoading(false);
      }
    };
    void fetchOptions();
  }, [message]);

  const attributeNameOptions = useMemo(() => {
    const seen = new Set<string>();
    const uniq = [] as { label: string; value: string }[];
    for (const a of attributes) {
      const key = a.name;
      if (seen.has(key)) continue;
      seen.add(key);
      uniq.push({ label: a.name, value: a.name });
    }
    return uniq;
  }, [attributes]);

  const valuesMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const a of attributes) {
      const uniqVals = Array.from(new Set(a.values || []));
      map[a.name] = uniqVals;
    }
    return map;
  }, [attributes]);

  return {
    loading,
    attributes,
    attributeNameOptions,
    valuesMap,
  };
};
