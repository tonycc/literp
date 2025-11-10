import apiClient from '../../../shared/services/api';

export interface SystemSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  enableRegistration: boolean;
  enableEmailNotification: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsData {
  siteName?: string;
  siteDescription?: string;
  enableRegistration?: boolean;
  enableEmailNotification?: boolean;
  sessionTimeout?: number;
  maxLoginAttempts?: number;
}

class SettingsService {
  private readonly baseUrl = '/settings';

  async getSettings(): Promise<SystemSettings> {
    const response = await apiClient.get<SystemSettings>(this.baseUrl);
    return response.data;
  }

  async updateSettings(data: UpdateSettingsData): Promise<SystemSettings> {
    const response = await apiClient.put<SystemSettings>(this.baseUrl, data);
    return response.data;
  }

  async resetSettings(): Promise<SystemSettings> {
    const response = await apiClient.post<SystemSettings>(`${this.baseUrl}/reset`);
    return response.data;
  }
}

export const settingsService = new SettingsService();