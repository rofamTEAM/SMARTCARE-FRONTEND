import { apiClient } from './apiClient';

export interface DashboardStats {
  totalPatients: number;
  totalStaff: number;
  activeDoctors: number;
  todayAppointments: number;
  totalRevenue: number;
  totalIncome?: number;
  pendingTests: number;
  bedOccupancy: number;
  pendingBills: number;
  bloodUnits: number;
  bloodUnitTarget: number;
}

export interface DashboardActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface ModuleStats {
  opd?: { patients: number; visits: number; revenue: number };
  ipd?: { patients: number; beds: number; revenue: number };
  pharmacy?: { medicines: number; sales: number; revenue: number };
  billing?: { invoices: number; revenue: number; pending: number };
  pathology?: { tests: number; pending: number; completed: number };
  radiology?: { tests: number; pending: number; completed: number };
  bloodBank?: { units: number; target: number; available: number };
  operationTheatre?: { surgeries: number; scheduled: number; completed: number };
}

class DashboardService {
  /**
   * Get comprehensive dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    return this.getDashboardStats();
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<any>('/dashboard/stats');
      if (response?.data) {
        return {
          ...response.data,
          totalIncome: response.data.totalRevenue || response.data.totalIncome || 0
        };
      }
      return response || this.getDefaultStats();
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(): Promise<DashboardActivity[]> {
    try {
      const response = await apiClient.get<any>('/dashboard/recent-activities');
      if (Array.isArray(response)) return response;
      if (response?.activities && Array.isArray(response.activities)) return response.activities;
      if (response?.data && Array.isArray(response.data)) return response.data;
      return [];
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      return [];
    }
  }

  /**
   * Get module-specific statistics
   */
  async getModuleStats(): Promise<ModuleStats> {
    try {
      const [opd, ipd, pharmacy, billing, pathology, radiology, bloodBank, ot] = await Promise.all([
        this.getOPDStats().catch(() => null),
        this.getIPDStats().catch(() => null),
        this.getPharmacyStats().catch(() => null),
        this.getBillingStats().catch(() => null),
        this.getPathologyStats().catch(() => null),
        this.getRadiologyStats().catch(() => null),
        this.getBloodBankStats().catch(() => null),
        this.getOperationTheatreStats().catch(() => null),
      ]);

      return {
        opd: opd || undefined,
        ipd: ipd || undefined,
        pharmacy: pharmacy || undefined,
        billing: billing || undefined,
        pathology: pathology || undefined,
        radiology: radiology || undefined,
        bloodBank: bloodBank || undefined,
        operationTheatre: ot || undefined,
      };
    } catch (error) {
      console.error('Failed to fetch module stats:', error);
      return {};
    }
  }

  /**
   * Get OPD statistics
   */
  private async getOPDStats(): Promise<any> {
    const response = await apiClient.get<any>('/opd/stats');
    return response || { patients: 0, visits: 0, revenue: 0 };
  }

  /**
   * Get IPD statistics
   */
  private async getIPDStats(): Promise<any> {
    const response = await apiClient.get<any>('/ipd/stats');
    return response || { patients: 0, beds: 0, revenue: 0 };
  }

  /**
   * Get Pharmacy statistics
   */
  private async getPharmacyStats(): Promise<any> {
    const response = await apiClient.get<any>('/pharmacy/stats');
    return response || { medicines: 0, sales: 0, revenue: 0 };
  }

  /**
   * Get Billing statistics
   */
  private async getBillingStats(): Promise<any> {
    const response = await apiClient.get<any>('/billing/stats');
    return response || { invoices: 0, revenue: 0, pending: 0 };
  }

  /**
   * Get Pathology statistics
   */
  private async getPathologyStats(): Promise<any> {
    const response = await apiClient.get<any>('/pathology/stats');
    return response || { tests: 0, pending: 0, completed: 0 };
  }

  /**
   * Get Radiology statistics
   */
  private async getRadiologyStats(): Promise<any> {
    const response = await apiClient.get<any>('/radiology/stats');
    return response || { tests: 0, pending: 0, completed: 0 };
  }

  /**
   * Get Blood Bank statistics
   */
  private async getBloodBankStats(): Promise<any> {
    const response = await apiClient.get<any>('/blood-bank/stats');
    return response || { units: 0, target: 0, available: 0 };
  }

  /**
   * Get Operation Theatre statistics
   */
  private async getOperationTheatreStats(): Promise<any> {
    const response = await apiClient.get<any>('/operation-theatre/stats');
    return response || { surgeries: 0, scheduled: 0, completed: 0 };
  }

  /**
   * Get default stats when API fails
   */
  private getDefaultStats(): DashboardStats {
    return {
      totalPatients: 0,
      totalStaff: 0,
      activeDoctors: 0,
      todayAppointments: 0,
      totalRevenue: 0,
      totalIncome: 0,
      pendingTests: 0,
      bedOccupancy: 0,
      pendingBills: 0,
      bloodUnits: 0,
      bloodUnitTarget: 0,
    };
  }
}

export const dashboardService = new DashboardService();
