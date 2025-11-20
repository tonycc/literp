import type { PaginatedResponse } from '@zyerp/shared';

interface BackendPagination {
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  limit?: number;
}

interface BackendPaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  pagination?: BackendPagination;
  limit?: number;
}

export function mapPaginatedResponse<T>(response: unknown): PaginatedResponse<T> {
  const getField = (o: unknown, k: string): unknown => {
    if (typeof o === 'object' && o !== null && k in (o as Record<string, unknown>)) {
      return (o as Record<string, unknown>)[k];
    }
    return undefined;
  };
  const dataRaw = getField(response, 'data');
  const payload = typeof dataRaw === 'object' && dataRaw !== null
    ? (dataRaw as BackendPaginatedResponse<T>)
    : ({} as BackendPaginatedResponse<T>);
  const list: T[] = Array.isArray(payload.data) ? payload.data : [];
  const p: BackendPagination = payload.pagination ?? {};
  const total = typeof p.total === 'number' ? p.total : typeof payload.total === 'number' ? payload.total : 0;
  const page = typeof p.page === 'number' ? p.page : typeof payload.page === 'number' ? payload.page : 1;
  const pageSize = typeof p.pageSize === 'number'
    ? p.pageSize
    : typeof payload.pageSize === 'number'
      ? payload.pageSize
      : typeof p.limit === 'number'
        ? p.limit
        : typeof payload.limit === 'number'
          ? payload.limit
          : 10;
  const successRaw = getField(response, 'success');
  const messageRaw = getField(response, 'message');
  const timestampRaw = getField(response, 'timestamp');
  return {
    success: typeof successRaw === 'boolean' ? successRaw : true,
    data: list,
    pagination: { total, page, pageSize },
    message: typeof messageRaw === 'string' ? messageRaw : undefined,
    timestamp: typeof timestampRaw === 'number' || typeof timestampRaw === 'string' ? String(timestampRaw) : new Date().toISOString(),
  };
}
