import { apiClient } from './apiClient';

export interface PatientFlowData {
  patientId: number;
  visitType: 'OPD' | 'IPD' | 'Emergency';
  triageLevel: 'Emergency' | 'Urgent' | 'Routine';
  insuranceProvider?: string;
  insurancePolicyNo?: string;
  preAuthorizationNo?: string;
  temperature?: number;
  bloodPressure?: string;
  pulse?: number;
  weight?: number;
  height?: number;
}

export interface PatientFlow {
  id: number;
  patientId: number;
  visitType: string;
  triageLevel: string;
  currentDepartment: string;
  currentStatus: string;
  checkInTime: string;
  checkOutTime?: string;
  insuranceVerified: boolean;
  assignedDoctor?: number;
  discharged: boolean;
  dischargeDate?: string;
}

export interface PatientVitals {
  temperature?: number;
  bloodPressure?: string;
  pulse?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
}

export interface PatientOrder {
  id: number;
  patientFlowId: number;
  orderType: 'Lab' | 'Imaging' | 'Medication' | 'Procedure';
  orderDescription: string;
  issuedAt: string;
  expectedResultDate?: string;
  resultStatus: 'pending' | 'completed' | 'critical';
  resultNotes?: string;
}

export interface DischargeSummary {
  id: number;
  patientFlowId: number;
  finalDiagnosis: string;
  treatmentProvided: string;
  medications: string;
  followUpInstructions: string;
  billStatus: 'Settled' | 'Pending' | 'Conditional';
  nextAppointmentDate?: string;
}

class PatientFlowService {
  /**
   * Initialize patient flow on reception
   */
  async initializeFlow(data: PatientFlowData): Promise<PatientFlow> {
    return apiClient.post<PatientFlow>('/patient-flow/initialize', data);
  }

  /**
   * Get patient flow by ID
   */
  async getFlow(id: number): Promise<PatientFlow> {
    return apiClient.get<PatientFlow>(`/patient-flow/${id}`);
  }

  /**
   * Get active patient flow by patient ID
   */
  async getFlowByPatientId(patientId: number): Promise<PatientFlow> {
    return apiClient.get<PatientFlow>(`/patient-flow/patient/${patientId}`);
  }

  /**
   * Transition patient to next department
   */
  async transitionPatient(
    patientFlowId: number,
    toDepartment: string,
    transitionReason?: string,
    handoffNotes?: string
  ): Promise<any> {
    return apiClient.post('/patient-flow/transition', {
      patientFlowId,
      toDepartment,
      transitionReason,
      handoffNotes
    });
  }

  /**
   * Update patient status
   */
  async updateStatus(patientFlowId: number, status: string): Promise<PatientFlow> {
    return apiClient.patch('/patient-flow/status', {
      patientFlowId,
      status
    });
  }

  /**
   * Record patient vitals
   */
  async recordVitals(patientFlowId: number, vitals: PatientVitals): Promise<any> {
    return apiClient.post('/patient-flow/vitals/record', {
      patientFlowId,
      ...vitals
    });
  }

  /**
   * Issue order (Lab, Imaging, Medication, Procedure)
   */
  async issueOrder(
    patientFlowId: number,
    orderType: string,
    orderDescription: string,
    expectedResultDate?: string
  ): Promise<PatientOrder> {
    return apiClient.post('/patient-flow/orders/issue', {
      patientFlowId,
      orderType,
      orderDescription,
      expectedResultDate
    });
  }

  /**
   * Get patient orders
   */
  async getOrders(patientFlowId: number): Promise<PatientOrder[]> {
    return apiClient.get<PatientOrder[]>(`/patient-flow/orders/${patientFlowId}`);
  }

  /**
   * Update order result
   */
  async updateOrderResult(
    orderId: number,
    resultStatus: string,
    resultNotes?: string
  ): Promise<PatientOrder> {
    return apiClient.patch('/patient-flow/orders/result', {
      orderId,
      resultStatus,
      resultNotes
    });
  }

  /**
   * Get department queue
   */
  async getDepartmentQueue(department: string): Promise<any[]> {
    return apiClient.get<any[]>(`/patient-flow/queue/${department}`);
  }

  /**
   * Create discharge summary
   */
  async createDischargeSummary(
    patientFlowId: number,
    summary: Partial<DischargeSummary>
  ): Promise<DischargeSummary> {
    return apiClient.post('/patient-flow/discharge/summary', {
      patientFlowId,
      ...summary
    });
  }

  /**
   * Get discharge summary
   */
  async getDischargeSummary(patientFlowId: number): Promise<DischargeSummary> {
    return apiClient.get<DischargeSummary>(`/patient-flow/discharge/${patientFlowId}`);
  }

  /**
   * Get patient flow history
   */
  async getFlowHistory(patientId: number): Promise<PatientFlow[]> {
    return apiClient.get<PatientFlow[]>(`/patient-flow/history/${patientId}`);
  }
}

export const patientFlowService = new PatientFlowService();
