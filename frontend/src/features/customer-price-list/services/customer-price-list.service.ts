import type { 
  ApiResponse, 
  CustomerPriceList, 
  CreateCustomerPriceListData, 
  UpdateCustomerPriceListData,
  CustomerPriceListResponse,
  CustomerPriceListParams
} from '@zyerp/shared';
import apiClient from '@/shared/services/api';

class CustomerPriceListService {
  private readonly baseUrl = '/customer-price-lists';

  async getList(params: CustomerPriceListParams): Promise<CustomerPriceListResponse> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const response = await apiClient.get<CustomerPriceListResponse>(this.baseUrl, { params });
    return response.data;
  }

  async getById(id: string): Promise<ApiResponse<CustomerPriceList>> {
    const response = await apiClient.get<ApiResponse<CustomerPriceList>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: CreateCustomerPriceListData): Promise<ApiResponse<CustomerPriceList>> {
    const response = await apiClient.post<ApiResponse<CustomerPriceList>>(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: UpdateCustomerPriceListData): Promise<ApiResponse<CustomerPriceList>> {
    const response = await apiClient.patch<ApiResponse<CustomerPriceList>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
    return response.data;
  }
}

export const customerPriceListService = new CustomerPriceListService();
