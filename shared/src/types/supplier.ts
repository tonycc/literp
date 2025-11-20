// 供应商类型定义（共享）
export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum SupplierCategory {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  SERVICE = 'service',
  OTHER = 'other'
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  category: SupplierCategory;
  status: SupplierStatus;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  registeredCapital?: number;
  creditLevel?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateSupplierData {
  code: string;
  name: string;
  shortName?: string;
  category: SupplierCategory;
  status: SupplierStatus;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  registeredCapital?: number;
  creditLevel?: string;
  remark?: string;
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  id: string;
}

export interface SupplierListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: SupplierCategory;
  status?: SupplierStatus;
}

export interface SupplierListResponse {
  data: Supplier[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}