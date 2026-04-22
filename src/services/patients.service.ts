/**
 * Patients Service
 * Handles all patient-related API calls
 */

import { apiClient } from './apiClient';

export interface Patient {
  id: string;
  patientUniqueId: number;
  patientName: string;
  age: string;
  month: string;
  gender?: string;
  email?: string;
  mobileno?: string;
  dob?: string;
  bloodGroup?: string;
  address: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianAddress?: string;
  guardianEmail?: string;
  maritalStatus?: string;
  patientType?: string;
  organisation?: string;
  knownAllergies?: string;
  creditLimit?: string;
  note?: string;
  image?: string;
  discharged?: string;
  oldPatient?: string;
  isIpd?: string;
  appKey?: string;
  disableAt?: string;
  isActive?: string;
  createdAt: string;
  admissionDate?: string;
}

export interface CreatePatientRequest {
  patientUniqueId?: number;
  patientName: string;
  age: string;
  month?: string;
  gender?: string;
  email?: string;
  mobileno?: string;
  dob?: string;
  bloodGroup?: string;
  address: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianAddress?: string;
  guardianEmail?: string;
  maritalStatus?: string;
  patientType?: string;
  organisation?: string;
  knownAllergies?: string;
  creditLimit?: string;
  note?: string;
  image?: string;
  discharged?: string;
  oldPatient?: string;
  isIpd?: string;
  appKey?: string;
  disableAt?: string;
  isActive?: string;
  admissionDate?: string;
}

export interface CreatePatientResponse extends Patient {}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class PatientsService {
  /**
   * Get all patients (with pagination)
   */
  async getAll(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Patient>> {
    try {
      const response = await apiClient.get<any>(
        `/patients?page=${page}&limit=${limit}`
      );
      return {
        ...response,
        data: (response.data || []).map((patient: any) => this.convertSnakeToCamel(patient))
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }
  }

  /**
   * Search patients
   */
  async search(query: string): Promise<Patient[]> {
    try {
      const response = await apiClient.get<any[]>(`/patients/search?q=${encodeURIComponent(query)}`);
      return (response || []).map(patient => this.convertSnakeToCamel(patient));
    } catch (error) {
      console.error('Error searching patients:', error);
      return [];
    }
  }

  /**
   * Get patient by ID
   */
  async getById(id: string): Promise<Patient> {
    const response = await apiClient.get<any>(`/patients/${id}`);
    return this.convertSnakeToCamel(response);
  }

  /**
   * Create new patient
   */
  async create(data: CreatePatientRequest): Promise<Patient> {
    const response = await apiClient.post<any>('/patients', data);
    // Convert snake_case response to camelCase for consistency
    return this.convertSnakeToCamel(response);
  }

  /**
   * Convert snake_case object to camelCase
   */
  private convertSnakeToCamel(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertSnakeToCamel(item));
    }
    if (obj !== null && typeof obj === 'object') {
      const converted: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        converted[camelKey] = this.convertSnakeToCamel(value);
      }
      return converted;
    }
    return obj;
  }

  /**
   * Update patient
   */
  async update(id: string, data: Partial<CreatePatientRequest>): Promise<Patient> {
    const response = await apiClient.put<any>(`/patients/${id}`, data);
    return this.convertSnakeToCamel(response);
  }

  /**
   * Delete patient
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}`);
  }

  /**
   * Get patient medical history
   */
  async getMedicalHistory(patientId: string): Promise<any> {
    return apiClient.get(`/patients/${patientId}/medical-history`);
  }

  /**
   * Get patient appointments
   */
  async getAppointments(patientId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/patients/${patientId}/appointments`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return [];
    }
  }

  /**
   * Get patient visits
   */
  async getVisits(patientId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/patients/${patientId}/visits`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching patient visits:', error);
      return [];
    }
  }
}

export const patientsService = new PatientsService();
