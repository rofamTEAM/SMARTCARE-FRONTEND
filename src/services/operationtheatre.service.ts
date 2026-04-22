import { apiClient } from './apiClient';

export interface OTPatient {
  id: string; patientId: string; surgeryDate: string; surgeryTime: string;
  surgeryType: string; surgeonId: string; anesthetistId?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string; createdAt: string; updatedAt: string;
}
export interface CreateOTPatientRequest {
  patientId: string; surgeryDate: string; surgeryTime: string;
  surgeryType: string; surgeonId: string; anesthetistId?: string; notes?: string;
}

export interface OTConsultantInstruction {
  id: string; otPatientId: string; consultantId: string;
  instruction: string; date: string; createdAt: string; updatedAt: string;
}
export interface CreateOTConsultantInstructionRequest {
  consultantId: string; instruction: string; date: string;
}

export interface OTBill {
  id: string; otPatientId: string; totalAmount: number; paidAmount: number;
  remainingAmount: number; billDate: string; status: 'pending' | 'partial' | 'paid';
  items: OTBillItem[]; createdAt: string; updatedAt: string;
}
export interface OTBillItem {
  id: string; description: string; quantity: number; unitPrice: number; totalPrice: number;
}

class OperationTheatreService {
  // OT Patients — backend: /ot/patients
  async getOTPatients() { return apiClient.get<OTPatient[]>('/ot/patients'); }
  async createOTPatient(data: CreateOTPatientRequest) { return apiClient.post<OTPatient>('/ot/patients', data); }
  async getOTPatientById(id: string) { return apiClient.get<OTPatient>(`/ot/patients/${id}`); }
  async updateOTPatient(id: string, data: Partial<CreateOTPatientRequest>) { return apiClient.put<OTPatient>(`/ot/patients/${id}`, data); }
  async deleteOTPatient(id: string) { await apiClient.delete(`/ot/patients/${id}`); }

  // Consultant Instructions — backend: /ot/patients/:patientId/consultants
  async getConsultantInstructions(patientId: string) { return apiClient.get<OTConsultantInstruction[]>(`/ot/patients/${patientId}/consultants`); }
  async addConsultantInstruction(patientId: string, data: CreateOTConsultantInstructionRequest) { return apiClient.post<OTConsultantInstruction>(`/ot/patients/${patientId}/consultants`, data); }
  async updateConsultantInstruction(patientId: string, id: string, data: Partial<CreateOTConsultantInstructionRequest>) { return apiClient.put<OTConsultantInstruction>(`/ot/patients/${patientId}/consultants/${id}`, data); }
  async deleteConsultantInstruction(patientId: string, id: string) { await apiClient.delete(`/ot/patients/${patientId}/consultants/${id}`); }

  // OT Bill — not yet in ot.routes.ts, stub gracefully
  async getOTBill(patientId: string) { return apiClient.get<OTBill>(`/ot/patients/${patientId}/bill`).catch(() => null); }
}

export const operationtheatreService = new OperationTheatreService();
