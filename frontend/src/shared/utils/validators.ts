/**
 * 通用表单校验工具方法
 */

 

/**
 * 校验成本字段
 * @param fieldName 字段名称，用于错误提示
 * @returns 校验函数
 */
export const validateCost = (fieldName: string) => async (_rule: unknown, value: number | undefined) => {
  if (value !== undefined && value !== null) {
    if (value < 0) return Promise.reject(new Error(`${fieldName}不能为负数`));
    if (value > 99999999.99) return Promise.reject(new Error(`${fieldName}不能超过99,999,999.99`));
  }
  return Promise.resolve();
};

/**
 * 校验库存字段
 * @param fieldName 字段名称，用于错误提示
 * @returns 校验函数
 */
export const validateStock = (fieldName: string) => async (_rule: unknown, value: number | undefined) => {
  if (value !== undefined && value !== null) {
    if (value < 0) return Promise.reject(new Error(`${fieldName}不能为负数`));
    if (!Number.isInteger(value)) return Promise.reject(new Error(`${fieldName}必须为整数`));
    if (value > 9999999) return Promise.reject(new Error(`${fieldName}不能超过9,999,999`));
  }
  return Promise.resolve();
};

/**
 * 校验JSON格式
 * @returns 校验函数
 */
export const validateJson = async (_rule: unknown, value: string | undefined) => {
  if (!value || !value.trim()) return Promise.resolve();
  try {
    JSON.parse(value);
    return Promise.resolve();
  } catch {
    return Promise.reject(new Error('JSON 格式不合法，请检查键值和逗号'));
  }
};

/**
 * 校验产品编码格式
 * @returns 校验函数
 */
export const validateProductCode = async (_rule: unknown, value: string) => {
  if (!value || !value.trim()) return Promise.resolve();
  if (value.length > 50) return Promise.reject(new Error('编码长度不能超过50个字符'));
  if (!/^[A-Za-z0-9\-_]+$/.test(value)) return Promise.reject(new Error('编码只能包含字母、数字、连字符和下划线'));
  return Promise.resolve();
};

/**
 * 校验产品名称格式
 * @returns 校验函数
 */
export const validateProductName = async (_rule: unknown, value: string) => {
  if (!value || !value.trim()) return Promise.resolve();
  if (value.length > 100) return Promise.reject(new Error('名称长度不能超过100个字符'));
  return Promise.resolve();
};

/**
 * 校验工序编码格式
 * @returns 校验函数
 */
export const validateOperationCode = async (_rule: unknown, value: string) => {
  if (!value || !value.trim()) return Promise.resolve();
  if (value.length > 50) return Promise.reject(new Error('工序编码长度不能超过50个字符'));
  if (!/^[A-Za-z0-9\-_]+$/.test(value)) return Promise.reject(new Error('工序编码只能包含字母、数字、连字符和下划线'));
  return Promise.resolve();
};

/**
 * 校验工序名称格式
 * @returns 校验函数
 */
export const validateOperationName = async (_rule: unknown, value: string) => {
  if (!value || !value.trim()) return Promise.resolve();
  if (value.length > 100) return Promise.reject(new Error('工序名称长度不能超过100个字符'));
  return Promise.resolve();
};

/**
 * 校验工艺路线编码格式
 * @returns 校验函数
 */
export const validateRoutingCode = async (_rule: unknown, value: string) => {
  if (!value || !value.trim()) return Promise.resolve();
  if (value.length > 50) return Promise.reject(new Error('工艺路线编码长度不能超过50个字符'));
  if (!/^[A-Za-z0-9\-_]+$/.test(value)) return Promise.reject(new Error('工艺路线编码只能包含字母、数字、连字符和下划线'));
  return Promise.resolve();
};

/**
 * 校验工作中心编码格式
 * @returns 校验函数
 */
export const validateWorkcenterCode = async (_rule: unknown, value: string) => {
  if (!value || !value.trim()) return Promise.resolve();
  if (value.length > 50) return Promise.reject(new Error('工作中心编码长度不能超过50个字符'));
  if (!/^[A-Za-z0-9\-_]+$/.test(value)) return Promise.reject(new Error('工作中心编码只能包含字母、数字、连字符和下划线'));
  return Promise.resolve();
};
