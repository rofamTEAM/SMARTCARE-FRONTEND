/**
 * Blood Bank Service
 * Handles all blood bank API calls
 */

import { apiClient } from './apiClient';

// ============ Blood Bank Status ============
export interface BloodGroupStatus {
  bloodGroup: string;
  available: number;
  reserved: number;
  expired: number;
  lastUpdated: string;
}

// ============ Blood Donors ============
export interface BloodDonor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  bloodGroup: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address?: string;
  lastDonationDate?: string;
  totalDonations: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBloodDonorRequest {
  name: string;
  phone: string;
  email?: string;
  bloodGroup: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
}

// ============ Blood Issues ============
export interface BloodIssue {
  id: string;
  bloodGroup: string;
  quantity: number;
  unit: string;
  issuedTo: string;
  issuedDate: string;
  issuedTime: string;
  purpose: string;
  status: 'issued' | 'returned' | 'used';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBloodIssueRequest {
  bloodGroup: string;
  quantity: number;
  unit: string;
  issuedTo: string;
  issuedDate: string;
  issuedTime: string;
  purpose: string;
  notes?: string;
}

class BloodBankService {
  // ============ Blood Bank Status ============
  async getBloodBankStatus(): Promise<BloodGroupStatus[]> {
    return apiClient.get<BloodGroupStatus[]>('/bloodbank/status');
  }

  async updateBloodGroupStatus(bloodGroup: string, data: Partial<BloodGroupStatus>): Promise<BloodGroupStatus> {
    return apiClient.put<BloodGroupStatus>(`/bloodbank/status/${bloodGroup}`, data);
  }

  // ============ Blood Donors ============
  async getDonors(): Promise<BloodDonor[]> {
    return apiClient.get<BloodDonor[]>('/bloodbank/donors');
  }

  async createDonor(data: CreateBloodDonorRequest): Promise<BloodDonor> {
    return apiClient.post<BloodDonor>('/bloodbank/donors', data);
  }

  async getDonorById(id: string): Promise<BloodDonor> {
    return apiClient.get<BloodDonor>(`/bloodbank/donors/${id}`);
  }

  async updateDonor(id: string, data: Partial<CreateBloodDonorRequest>): Promise<BloodDonor> {
    return apiClient.put<BloodDonor>(`/bloodbank/donors/${id}`, data);
  }

  async deleteDonor(id: string): Promise<void> {
    await apiClient.delete(`/bloodbank/donors/${id}`);
  }

  // ============ Blood Issues ============
  async getBloodIssues(): Promise<BloodIssue[]> {
    return apiClient.get<BloodIssue[]>('/bloodbank/issues');
  }

  async issueBlood(data: CreateBloodIssueRequest): Promise<BloodIssue> {
    return apiClient.post<BloodIssue>('/bloodbank/issues', data);
  }

  async getBloodIssueById(id: string): Promise<BloodIssue> {
    return apiClient.get<BloodIssue>(`/bloodbank/issues/${id}`);
  }

  async updateBloodIssue(id: string, data: Partial<CreateBloodIssueRequest>): Promise<BloodIssue> {
    return apiClient.put<BloodIssue>(`/bloodbank/issues/${id}`, data);
  }

  async deleteBloodIssue(id: string): Promise<void> {
    await apiClient.delete(`/bloodbank/issues/${id}`);
  }
}

export const bloodbankService = new BloodBankService();
