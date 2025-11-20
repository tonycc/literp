export const getErrorMessage = (
  source?: { message?: string },
  err?: unknown,
  fallback = '操作失败'
) => {
  const map: Record<string | number, string> = {
    400: '请求参数错误',
    401: '未登录或登录已过期',
    403: '没有权限',
    404: '资源不存在',
    409: '资源冲突',
    422: '数据校验失败',
    500: '服务器内部错误',
    DUPLICATE_CODE: 'BOM编码已存在',
    NOT_FOUND: '资源不存在',
    VALIDATION_ERROR: '数据校验失败',
  };
  if (source?.message) return source.message;
  const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
  let status: number | undefined;
  let apiCode: string | number | undefined;
  if (isObj(err)) {
    const respVal = getField(err, 'response');
    const resp = isObj(respVal) ? respVal : undefined;
    if (resp) {
      const s = getField(resp, 'status');
      status = typeof s === 'number' ? s : undefined;
      const data = getField(resp, 'data');
      const code = isObj(data) ? getField(data, 'code') : undefined;
      apiCode = typeof code === 'string' || typeof code === 'number' ? code : undefined;
    }
    const directCode = getField(err, 'code');
    if (apiCode === undefined && (typeof directCode === 'string' || typeof directCode === 'number')) {
      apiCode = directCode;
    }
  }
  if (status && map[status]) return map[status];
  if (apiCode && map[apiCode]) return map[apiCode];
  return fallback;
};
  const getField = (o: unknown, k: string): unknown => {
    if (typeof o === 'object' && o !== null && k in (o as Record<string, unknown>)) {
      return (o as Record<string, unknown>)[k];
    }
    return undefined;
  };

