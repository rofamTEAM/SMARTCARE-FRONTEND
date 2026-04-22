/**
 * Pathology Service
 * Handles all pathology/laboratory test API calls
 */

import { apiClient } from './apiClient';

export interface PathologyTest {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  turnaroundTime: string;
  createdAt: string;
}

export interface PathologyReport {
  id: string;
  patientId: string;
  testId: string;
  testName: string;
  sampleDate: string;
  reportDate: string;
  status: 'pending' | 'completed' | 'reviewed';
  results: Record<string, any>;
  normalRange?: string;
  notes?: string;
  createdAt: string;
}

class PathologyService {
  /**
   * Get all pathology tests
   */
  async getTests(): Promise<PathologyTest[]> {
    return apiClient.get<PathologyTest[]>('/pathology/tests');
  }

  /**
   * Get test by ID
   */
  async getTest(id: string): Promise<PathologyTest> {
    return apiClient.get<PathologyTest>(`/pathology/tests/${id}`);
  }

  /**
   * Add pathology test
   */
  async addTest(data: Partial<PathologyTest>): Promise<PathologyTest> {
    return apiClient.post<PathologyTest>('/pathology/tests', data);
  }

  /**
   * Update test
   */
  async updateTest(id: string, data: Partial<PathologyTest>): Promise<PathologyTest> {
    return apiClient.put<PathologyTest>(`/pathology/tests/${id}`, data);
  }

  /**
   * Delete test
   */
  async deleteTest(id: string): Promise<void> {
    await apiClient.delete(`/pathology/tests/${id}`);
  }

  /**
   * Get test reports
   */
  async getReports(testId?: string): Promise<PathologyReport[]> {
    return apiClient.get<PathologyReport[]>(`/pathology/reports${testId ? `?testId=${testId}` : ''}`);
  }

  /**
   * Add patient test report
   */
  async addReport(data: Partial<PathologyReport>): Promise<PathologyReport> {
    return apiClient.post<PathologyReport>(`/pathology/reports`, data);
  }

  /**
   * Get report details
   */
  async getReport(testId: string, reportId: string): Promise<PathologyReport> {
    return apiClient.get<PathologyReport>(`/pathology/tests/${testId}/reports/${reportId}`);
  }

  /**
   * Update report
   */
  async updateReport(
    testId: string,
    reportId: string,
    data: Partial<PathologyReport>
  ): Promise<PathologyReport> {
    return apiClient.put<PathologyReport>(
      `/pathology/tests/${testId}/reports/${reportId}`,
      data
    );
  }

  /**
   * Delete report
   */
  async deleteReport(testId: string, reportId: string): Promise<void> {
    await apiClient.delete(`/pathology/tests/${testId}/reports/${reportId}`);
  }

  /**
   * Get all patient reports
   */
  async getAllReports(): Promise<PathologyReport[]> {
    return apiClient.get<PathologyReport[]>('/pathology/reports');
  }

  /**
   * Get patient reports by patient ID
   */
  async getPatientReports(patientId: string): Promise<PathologyReport[]> {
    return apiClient.get<PathologyReport[]>(`/pathology/reports/patient/${patientId}`);
  }
}

export const pathologyService = new PathologyService();
