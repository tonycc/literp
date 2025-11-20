import apiClient from '@/shared/services/api';
import type { ApiResponse, ProductBom, BomFormData, BomQueryParams, BomItem, BomTreeNode } from '@zyerp/shared';
import type { BomItemSyncItem, BomItemsSyncSummary } from '@zyerp/shared';

export interface BomListResult {
  data: ProductBom[];
  success: boolean;
  total: number;
}

export class BomService {
  static async getById(id: string): Promise<ApiResponse<ProductBom>> {
    type RawBom = ProductBom & {
      product?: { code?: string; name?: string };
      baseUnit?: { name?: string; symbol?: string };
      routing?: { code?: string; name?: string };
    };
    const resp = await apiClient.get<ApiResponse<RawBom | { data?: RawBom }>>(`/boms/${id}`);
    const raw = resp.data;
    const payload = raw?.data as RawBom | { data?: RawBom } | undefined;
    const entity: RawBom | undefined = payload && typeof payload === 'object' && 'data' in payload ? (payload as { data?: RawBom }).data : (payload as RawBom | undefined);
    const mapped: ProductBom = {
      ...(entity || ({} as ProductBom)),
      productCode: entity?.productCode ?? entity?.product?.code ?? '',
      productName: entity?.productName ?? entity?.product?.name ?? '',
      baseUnitName: (entity as ProductBom & { baseUnitName?: string })?.baseUnitName ?? entity?.baseUnit?.name,
      routingName: (entity as ProductBom & { routingName?: string })?.routingName ?? entity?.routing?.name,
    } as ProductBom;
    return { success: !!raw.success, data: mapped, message: raw.message, timestamp: raw.timestamp } as ApiResponse<ProductBom>;
  }
  static async getList(params: BomQueryParams): Promise<BomListResult> {
    const response = await apiClient.get<ApiResponse<{ data: ProductBom[]; total?: number; page?: number; pageSize?: number; pagination?: { total: number; page: number; pageSize: number; totalPages: number } }>>('/boms', { params });
    const body = response.data.data;
    const total = body?.total ?? body?.pagination?.total ?? 0;
    type ProductWithOptional = ProductBom & { product?: { code?: string; name?: string } };
    const rawList = (body?.data ?? []) as ProductWithOptional[];
    const list: ProductBom[] = rawList.map((item) => ({
      ...item,
      productCode: item.productCode ?? item.product?.code ?? '',
      productName: item.productName ?? item.product?.name ?? '',
    }));
    return { data: list, success: !!response.data.success, total };
  }

  static async create(data: BomFormData): Promise<ApiResponse<ProductBom>> {
    const resp = await apiClient.post<ApiResponse<ProductBom>>('/boms', data);
    return resp.data;
  }

  static async update(id: string, data: BomFormData): Promise<ApiResponse<ProductBom>> {
    const resp = await apiClient.put<ApiResponse<ProductBom>>(`/boms/${id}`, data);
    return resp.data;
  }

  static async delete(id: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete<ApiResponse<void>>(`/boms/${id}`);
    return resp.data;
  }

  static async getItems(bomId: string): Promise<ApiResponse<BomItem[]>> {
    const resp = await apiClient.get<ApiResponse<BomItem[] | { data?: BomItem[] }>>(`/boms/${bomId}/items`);
    const raw = resp.data;
    const payload = raw?.data as BomItem[] | { data?: BomItem[] } | undefined;
    const list: BomItem[] = Array.isArray(payload)
      ? payload
      : (payload && typeof payload === 'object' && Array.isArray((payload as { data?: BomItem[] }).data))
      ? ((payload as { data?: BomItem[] }).data as BomItem[])
      : [];
    return { success: !!raw.success, data: list, message: raw.message, timestamp: raw.timestamp } as ApiResponse<BomItem[]>;
  }

  static async getTree(bomId: string): Promise<ApiResponse<BomTreeNode>> {
    const resp = await apiClient.get<ApiResponse<BomTreeNode>>(`/boms/${bomId}/tree`);
    return resp.data;
  }

  static async addItem(bomId: string, item: Partial<BomItem> & { materialId?: string; materialVariantId?: string }): Promise<ApiResponse<BomItem>> {
    const resp = await apiClient.post<ApiResponse<BomItem>>(`/boms/${bomId}/items`, item);
    return resp.data;
  }

  static async updateItem(itemId: string, item: Partial<BomItem> & { materialId?: string; materialVariantId?: string }): Promise<ApiResponse<BomItem>> {
    const resp = await apiClient.put<ApiResponse<BomItem>>(`/boms/items/${itemId}`, item);
    return resp.data;
  }

  static async deleteItem(itemId: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete<ApiResponse<void>>(`/boms/items/${itemId}`);
    return resp.data ?? ({ success: true } as ApiResponse<void>);
  }

  static async syncItems(bomId: string, items: BomItemSyncItem[]): Promise<ApiResponse<BomItemsSyncSummary>> {
    const resp = await apiClient.put<ApiResponse<BomItemsSyncSummary>>(`/boms/${bomId}/items/sync`, { items });
    return resp.data;
  }
}
