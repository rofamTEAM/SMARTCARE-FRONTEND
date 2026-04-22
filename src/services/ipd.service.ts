import { apiClient } from './apiClient';

export interface IPDPatient {
  id: string;
  patientId: string;
  admissionDate: string;
  dischargeDate?: string;
  bedId: string;
  doctorId: string;
  diagnosis: string;
  status: 'admitted' | 'discharged' | 'transferred';
  createdAt: string;
}

export interface DischargedPatient {
  id: string;
  patientId: string;
  admissionDate: string;
  dischargeDate: string;
  bedId: string;
  doctorId: string;
  diagnosis: string;
  createdAt: string;
}

export interface IPDConsultant {
  id: string;
  patientId: string;
  consultantId: string;
  instructions: string;
  date: string;
}

export interface IPDDiagnosis {
  id: string;
  patientId: string;
  diagnosis: string;
  severity: 'mild' | 'moderate' | 'severe';
  date: string;
}

export interface IPDTimeline {
  id: string;
  patientId: string;
  event: string;
  timestamp: string;
  notes?: string;
}

export interface IPDPrescription {
  id: string;
  patientId: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
}

export interface IPDCharge {
  id: string;
  patientId: string;
  chargeType: string;
  amount: number;
  description: string;
  date: string;
}

export interface IPDPayment {
  id: string;
  patientId: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

export interface IPDBill {
  id: string;
  patientId: string;
  totalCharges: number;
  totalPayments: number;
  balance: number;
  billDate: string;
  status: 'pending' | 'partial' | 'paid';
  items: IPDBillItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IPDBillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

class IPDService {
  async getPatients(): Promise<IPDPatient[]> {
    return apiClient.get<IPDPatient[]>('/ipd');
  }

  async getPatient(id: string): Promise<IPDPatient> {
    return apiClient.get<IPDPatient>(`/ipd/${id}`);
  }

  async admitPatient(data: Partial<IPDPatient>): Promise<IPDPatient> {
    return apiClient.post<IPDPatient>('/ipd', data);
  }

  async updatePatient(id: string, data: Partial<IPDPatient>): Promise<IPDPatient> {
    return apiClient.put<IPDPatient>(`/ipd/${id}`, data);
  }

  async deletePatient(id: string): Promise<void> {
    await apiClient.delete(`/ipd/${id}`);
  }

  async dischargePatient(id: string): Promise<IPDPatient> {
    return apiClient.put<IPDPatient>(`/ipd/${id}/discharge`, {});
  }

  async getDischargedPatients(): Promise<DischargedPatient[]> {
    return apiClient.get<DischargedPatient[]>('/ipd/discharged/list');
  }

  async getDischargedPatient(id: string): Promise<DischargedPatient> {
    return apiClient.get<DischargedPatient>(`/ipd/${id}`);
  }

  async getByPatient(patientId: string): Promise<IPDPatient[]> {
    return apiClient.get<IPDPatient[]>(`/ipd/patient/${patientId}`);
  }

  async getConsultants(ipdId: string): Promise<IPDConsultant[]> {
    return apiClient.get<IPDConsultant[]>(`/ipd/${ipdId}/consultants`);
  }

  async addConsultant(ipdId: string, data: Partial<IPDConsultant>): Promise<IPDConsultant> {
    return apiClient.post<IPDConsultant>(`/ipd/${ipdId}/consultants`, data);
  }

  async updateConsultant(ipdId: string, consultantId: string, data: Partial<IPDConsultant>): Promise<IPDConsultant> {
    return apiClient.put<IPDConsultant>(`/ipd/${ipdId}/consultants/${consultantId}`, data);
  }

  async deleteConsultant(ipdId: string, consultantId: string): Promise<void> {
    await apiClient.delete(`/ipd/${ipdId}/consultants/${consultantId}`);
  }

  async getDiagnosis(ipdId: string): Promise<IPDDiagnosis[]> {
    return apiClient.get<IPDDiagnosis[]>(`/ipd/${ipdId}/diagnosis`);
  }

  async addDiagnosis(ipdId: string, data: Partial<IPDDiagnosis>): Promise<IPDDiagnosis> {
    return apiClient.post<IPDDiagnosis>(`/ipd/${ipdId}/diagnosis`, data);
  }

  async updateDiagnosis(ipdId: string, diagnosisId: string, data: Partial<IPDDiagnosis>): Promise<IPDDiagnosis> {
    return apiClient.put<IPDDiagnosis>(`/ipd/${ipdId}/diagnosis/${diagnosisId}`, data);
  }

  async deleteDiagnosis(ipdId: string, diagnosisId: string): Promise<void> {
    await apiClient.delete(`/ipd/${ipdId}/diagnosis/${diagnosisId}`);
  }

  async getTimeline(ipdId: string): Promise<IPDTimeline[]> {
    return apiClient.get<IPDTimeline[]>(`/ipd/${ipdId}/timeline`);
  }

  async addTimeline(ipdId: string, data: Partial<IPDTimeline>): Promise<IPDTimeline> {
    return apiClient.post<IPDTimeline>(`/ipd/${ipdId}/timeline`, data);
  }

  async updateTimeline(ipdId: string, timelineId: string, data: Partial<IPDTimeline>): Promise<IPDTimeline> {
    return apiClient.put<IPDTimeline>(`/ipd/${ipdId}/timeline/${timelineId}`, data);
  }

  async deleteTimeline(ipdId: string, timelineId: string): Promise<void> {
    await apiClient.delete(`/ipd/${ipdId}/timeline/${timelineId}`);
  }

  async getPrescriptions(ipdId: string): Promise<IPDPrescription[]> {
    return apiClient.get<IPDPrescription[]>(`/ipd/${ipdId}/prescriptions`);
  }

  async addPrescription(ipdId: string, data: Partial<IPDPrescription>): Promise<IPDPrescription> {
    return apiClient.post<IPDPrescription>(`/ipd/${ipdId}/prescriptions`, data);
  }

  async updatePrescription(ipdId: string, prescriptionId: string, data: Partial<IPDPrescription>): Promise<IPDPrescription> {
    return apiClient.put<IPDPrescription>(`/ipd/${ipdId}/prescriptions/${prescriptionId}`, data);
  }

  async deletePrescription(ipdId: string, prescriptionId: string): Promise<void> {
    await apiClient.delete(`/ipd/${ipdId}/prescriptions/${prescriptionId}`);
  }

  async getCharges(ipdId: string): Promise<IPDCharge[]> {
    return apiClient.get<IPDCharge[]>(`/ipd/${ipdId}/charges`);
  }

  async addCharge(ipdId: string, data: Partial<IPDCharge>): Promise<IPDCharge> {
    return apiClient.post<IPDCharge>(`/ipd/${ipdId}/charges`, data);
  }

  async updateCharge(ipdId: string, chargeId: string, data: Partial<IPDCharge>): Promise<IPDCharge> {
    return apiClient.put<IPDCharge>(`/ipd/${ipdId}/charges/${chargeId}`, data);
  }

  async deleteCharge(ipdId: string, chargeId: string): Promise<void> {
    await apiClient.delete(`/ipd/${ipdId}/charges/${chargeId}`);
  }

  async getPayments(ipdId: string): Promise<IPDPayment[]> {
    return apiClient.get<IPDPayment[]>(`/ipd/${ipdId}/payments`);
  }

  async addPayment(ipdId: string, data: Partial<IPDPayment>): Promise<IPDPayment> {
    return apiClient.post<IPDPayment>(`/ipd/${ipdId}/payments`, data);
  }

  async deletePayment(ipdId: string, paymentId: string): Promise<void> {
    await apiClient.delete(`/ipd/${ipdId}/payments/${paymentId}`);
  }

  async getBill(ipdId: string): Promise<IPDBill> {
    return apiClient.get<IPDBill>(`/ipd/${ipdId}/bill`);
  }

  async generateBillAndDischarge(ipdId: string): Promise<IPDBill> {
    return apiClient.post<IPDBill>(`/ipd/${ipdId}/bill/generate`, {});
  }

  async revertDischarge(ipdId: string): Promise<IPDPatient> {
    return apiClient.post<IPDPatient>(`/ipd/${ipdId}/bill/revert`, {});
  }
}

export const ipdService = new IPDService();
