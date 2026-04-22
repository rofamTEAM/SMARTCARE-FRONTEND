import { SystemSettings } from '../types/settings';

export class SettingsService {
  private static async getApiClient() {
    const { apiClient } = await import('../services/apiClient');
    return apiClient;
  }

  static async getSettings(): Promise<Partial<SystemSettings>> {
    const apiClient = await this.getApiClient();
    const json = await apiClient.get<any>('/settings');
    return (json as any)?.data ?? json;
  }

  static async saveSettings(settings: Partial<SystemSettings>): Promise<void> {
    const apiClient = await this.getApiClient();
    await apiClient.post('/settings', settings);
  }

  static async updateSettings(updates: Partial<SystemSettings>): Promise<void> {
    const apiClient = await this.getApiClient();
    await apiClient.put('/settings', updates);
  }

  static async createBackup(): Promise<Blob> {
    const apiClient = await this.getApiClient();
    // For blob responses, we need to use fetch directly but with proper auth
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${baseUrl}/api/v1/settings/backup`, {
      method: 'POST',
      credentials: 'include' // Include httpOnly cookies for auth
    });
    if (!response.ok) throw new Error('Failed to create backup');
    return response.blob();
  }

  static async restoreBackup(file: File): Promise<void> {
    const apiClient = await this.getApiClient();
    const text = await file.text();
    await apiClient.post('/settings/restore', { data: text });
  }

  static async testEmailConfig(config: any): Promise<boolean> {
    const apiClient = await this.getApiClient();
    try {
      await apiClient.post('/settings/test-email', config);
      return true;
    } catch {
      return false;
    }
  }

  static async testSMSConfig(config: any): Promise<boolean> {
    const apiClient = await this.getApiClient();
    try {
      await apiClient.post('/settings/test-sms', config);
      return true;
    } catch {
      return false;
    }
  }
}
