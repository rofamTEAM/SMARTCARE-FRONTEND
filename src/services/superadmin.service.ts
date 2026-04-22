import { apiClient } from './apiClient';

export interface SystemMetrics {
  users: { total: number; byRole: Record<string, number> };
  patients: number;
  staff: number;
  appointments: Record<string, number>;
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  database: string;
  services: Record<string, string>;
  uptime: number;
  memory: any;
  cpu: any;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface SystemAlert {
  id: number;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  target_roles?: string[];
  created_by: number;
  created_at: string;
}

export interface Backup {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: string;
  size?: number;
}

class SuperAdminService {
  // apiClient already prepends API_BASE_URL and unwraps { data: ... } envelope
  // so paths here are just the route segment after /api/v1

  async getSystemMetrics(): Promise<SystemMetrics> {
    return apiClient.get<SystemMetrics>('/superadmin/metrics');
  }

  async getHealthStatus(): Promise<HealthStatus> {
    return apiClient.get<HealthStatus>('/superadmin/health');
  }

  async getActiveUsers(): Promise<any[]> {
    const result = await apiClient.get<any>('/superadmin/active-users');
    // Handle both array and object responses
    if (Array.isArray(result)) return result;
    if (result?.users && Array.isArray(result.users)) return result.users;
    if (result?.data && Array.isArray(result.data)) return result.data;
    return [];
  }

  async getAuditLogs(
    limit = 50,
    offset = 0,
    filters?: { userId?: number; action?: string; startDate?: string; endDate?: string }
  ): Promise<{ logs: AuditLog[]; pagination: any }> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      ...(filters?.userId && { userId: String(filters.userId) }),
      ...(filters?.action && { action: filters.action }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
    });
    return apiClient.get<{ logs: AuditLog[]; pagination: any }>(`/superadmin/audit-logs?${params}`);
  }

  async getSystemSettings(): Promise<Record<string, any>> {
    return apiClient.get<Record<string, any>>('/superadmin/settings');
  }

  async updateSystemSettings(settings: Record<string, any>): Promise<void> {
    await apiClient.put('/superadmin/settings', { settings });
  }

  async toggleMaintenanceMode(enabled: boolean, message?: string): Promise<void> {
    await apiClient.post('/superadmin/maintenance-mode', { enabled, message });
  }

  async createBackup(description?: string): Promise<{ backupId: string; timestamp: string }> {
    return apiClient.post<{ backupId: string; timestamp: string }>('/superadmin/backup', { description });
  }

  async getBackupHistory(): Promise<Backup[]> {
    return apiClient.get<Backup[]>('/superadmin/backups');
  }

  async broadcastAlert(
    title: string,
    message: string,
    severity: 'info' | 'warning' | 'error' | 'critical' = 'info',
    targetRoles?: string[]
  ): Promise<void> {
    await apiClient.post('/superadmin/alerts', { title, message, severity, targetRoles });
  }

  async getSystemAlerts(): Promise<SystemAlert[]> {
    return apiClient.get<SystemAlert[]>('/superadmin/alerts');
  }
}

export const superAdminService = new SuperAdminService();
