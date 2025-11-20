export interface TableParams {
  current?: number;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
  [key: string]: unknown;
}

export const normalizeTableParams = (
  params: TableParams,
  attrPrefix: string = 'attr_'
): { page: number; pageSize: number; sortField?: string; sortOrder?: string; attributes?: Record<string, string | string[]> } => {
  const currentLike = params.current ?? params.page ?? 1;
  const page = typeof currentLike === 'number' ? currentLike : Number(currentLike) || 1;
  const pageSizeLike = params.pageSize ?? 10;
  const pageSize = typeof pageSizeLike === 'number' ? pageSizeLike : Number(pageSizeLike) || 10;
  const rawSortField = typeof params.sortField === 'string' ? params.sortField : '';
  const rawSortOrder = typeof params.sortOrder === 'string' ? params.sortOrder : '';
  const sortOrder = rawSortOrder === 'ascend' ? 'asc' : rawSortOrder === 'descend' ? 'desc' : (rawSortOrder || undefined);
  const sortField = rawSortField || undefined;
  const attributes: Record<string, string | string[]> = {};
  Object.keys(params || {}).forEach((k) => {
    const v = (params as Record<string, unknown>)[k];
    if (k.startsWith(attrPrefix) && v) {
      const name = k.replace(new RegExp(`^${attrPrefix}`), '');
      if (Array.isArray(v) && (v as unknown[]).every((x) => typeof x === 'string')) {
        attributes[name] = v as string[];
      } else if (typeof v === 'string') {
        attributes[name] = v;
      }
    }
  });
  const result: { page: number; pageSize: number; sortField?: string; sortOrder?: string; attributes?: Record<string, string | string[]> } = { page, pageSize };
  if (sortField) result.sortField = sortField;
  if (sortOrder) result.sortOrder = sortOrder;
  if (Object.keys(attributes).length) result.attributes = attributes;
  return result;
};

