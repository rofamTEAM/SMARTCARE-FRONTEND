/**
 * Radiology Service
 * Handles all radiology/imaging test API calls
 */

import { apiClient } from './apiClient';

export interface RadiologyTest {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  turnaroundTime: string;
  createdAt: string;
}

export interface RadiologyReport {
  id: string;
  patientId: string;
  testId: string;
  testName: string;
  studyDate: string;
  reportDate: string;
  status: 'pending' | 'completed' | 'reviewed';
  findings: string;
  impression: string;
  radiologistId?: string;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
}

class RadiologyService {
  /**
   * Get all radiology tests
   */
  async getTests(): Promise<RadiologyTest[]> {
    return apiClient.get<RadiologyTest[]>('/radiology/tests');
  }

  /**
   * Get test by ID
   */
  async getTest(id: string): Promise<RadiologyTest> {
    return apiClient.get<RadiologyTest>(`/radiology/tests/${id}`);
  }

  /**
   * Add radiology test
   */
  async addTest(data: Partial<RadiologyTest>): Promise<RadiologyTest> {
    return apiClient.post<RadiologyTest>('/radiology/tests', data);
  }

  /**
   * Update test
   */
  async updateTest(id: string, data: Partial<RadiologyTest>): Promise<RadiologyTest> {
    return apiClient.put<RadiologyTest>(`/radiology/tests/${id}`, data);
  }

  /**
   * Delete test
   */
  async deleteTest(id: string): Promise<void> {
    await apiClient.delete(`/radiology/tests/${id}`);
  }

  /**
   * Get test reports
   */
  async getReports(testId?: string): Promise<RadiologyReport[]> {
    return apiClient.get<RadiologyReport[]>(`/radiology/reports${testId ? `?testId=${testId}` : ''}`);
  }

  /**
   * Add patient test report
   */
  async addReport(data: Partial<RadiologyReport>): Promise<RadiologyReport> {
    return apiClient.post<RadiologyReport>(`/radiology/reports`, data);
  }

  /**
   * Get report details
   */
  async getReport(testId: string, reportId: string): Promise<RadiologyReport> {
    return apiClient.get<RadiologyReport>(`/radiology/tests/${testId}/reports/${reportId}`);
  }

  /**
   * Update report
   */
  async updateReport(
    testId: string,
    reportId: string,
    data: Partial<RadiologyReport>
  ): Promise<RadiologyReport> {
    return apiClient.put<RadiologyReport>(
      `/radiology/tests/${testId}/reports/${reportId}`,
      data
    );
  }

  /**
   * Delete report
   */
  async deleteReport(testId: string, reportId: string): Promise<void> {
    await apiClient.delete(`/radiology/tests/${testId}/reports/${reportId}`);
  }

  /**
   * Get all patient reports
   */
  async getAllReports(): Promise<RadiologyReport[]> {
    return apiClient.get<RadiologyReport[]>('/radiology/reports');
  }

  /**
   * Get patient reports by patient ID
   */
  async getPatientReports(patientId: string): Promise<RadiologyReport[]> {
    return apiClient.get<RadiologyReport[]>(`/radiology/reports/patient/${patientId}`);
  }
}

export const radiologyService = new RadiologyService();
