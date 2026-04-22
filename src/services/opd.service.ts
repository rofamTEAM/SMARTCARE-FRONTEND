import { apiClient } from './apiClient';

export interface OPDPatient {
  id: string;
  patientId: string;
  visitDate: string;
  doctorId: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  status: 'active' | 'completed' | 'referred';
  createdAt: string;
}

export interface OPDVisit {
  id: string;
  patientId: string;
  visitDate: string;
  doctorId: string;
  chiefComplaint: string;
  vitals?: {
    temperature: number;
    bloodPressure: string;
    pulse: number;
    respiratoryRate: number;
  };
  diagnosis: string;
  treatment: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  visitId: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  createdAt: string;
}

export interface OPDDiagnosis {
  id: string;
  patientId: string;
  visitId?: string;
  diagnosisCode: string;
  diagnosisName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OPDTimeline {
  id: string;
  patientId: string;
  eventType: string;
  description: string;
  eventDate: string;
  eventTime: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OPDCharge {
  id: string;
  patientId: string;
  chargeType: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface OPDPayment {
  id: string;
  patientId: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface OPDBill {
  id: string;
  patientId: string;
  totalCharges: number;
  totalPayments: number;
  balance: number;
  billDate: string;
  status: 'pending' | 'partial' | 'paid';
  items: OPDBillItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OPDBillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

class OPDService {
  async getPatients(): Promise<OPDPatient[]> {
    return apiClient.get<OPDPatient[]>('/opd');
  }

  async getPatient(id: string): Promise<OPDPatient> {
    return apiClient.get<OPDPatient>(`/opd/${id}`);
  }

  async createPatient(data: Partial<OPDPatient>): Promise<OPDPatient> {
    return apiClient.post<OPDPatient>('/opd', data);
  }

  async updatePatient(id: string, data: Partial<OPDPatient>): Promise<OPDPatient> {
    return apiClient.put<OPDPatient>(`/opd/${id}`, data);
  }

  async deletePatient(id: string): Promise<void> {
    await apiClient.delete(`/opd/${id}`);
  }

  async getVisits(opdId: string): Promise<OPDVisit[]> {
    return apiClient.get<OPDVisit[]>(`/opd/${opdId}/visits`);
  }

  async createVisit(opdId: string, data: Partial<OPDVisit>): Promise<OPDVisit> {
    return apiClient.post<OPDVisit>(`/opd/${opdId}/visits`, data);
  }

  async getVisit(opdId: string, visitId: string): Promise<OPDVisit> {
    return apiClient.get<OPDVisit>(`/opd/${opdId}/visits/${visitId}`);
  }

  async updateVisit(opdId: string, visitId: string, data: Partial<OPDVisit>): Promise<OPDVisit> {
    return apiClient.put<OPDVisit>(`/opd/${opdId}/visits/${visitId}`, data);
  }

  async deleteVisit(opdId: string, visitId: string): Promise<void> {
    await apiClient.delete(`/opd/${opdId}/visits/${visitId}`);
  }

  async createRevisit(opdId: string, data: Partial<OPDVisit>): Promise<OPDVisit> {
    return apiClient.post<OPDVisit>(`/opd/${opdId}/revisit`, data);
  }

  async createRecheckup(opdId: string, data: Partial<OPDVisit>): Promise<OPDVisit> {
    return apiClient.post<OPDVisit>(`/opd/${opdId}/recheckup`, data);
  }

  async getPrescriptions(opdId: string): Promise<Prescription[]> {
    return apiClient.get<Prescription[]>(`/opd/${opdId}/prescriptions`);
  }

  async createPrescription(opdId: string, data: Partial<Prescription>): Promise<Prescription> {
    return apiClient.post<Prescription>(`/opd/${opdId}/prescriptions`, data);
  }

  async getPrescription(opdId: string, prescriptionId: string): Promise<Prescription> {
    return apiClient.get<Prescription>(`/opd/${opdId}/prescriptions/${prescriptionId}`);
  }

  async updatePrescription(opdId: string, prescriptionId: string, data: Partial<Prescription>): Promise<Prescription> {
    return apiClient.put<Prescription>(`/opd/${opdId}/prescriptions/${prescriptionId}`, data);
  }

  async deletePrescription(opdId: string, prescriptionId: string): Promise<void> {
    await apiClient.delete(`/opd/${opdId}/prescriptions/${prescriptionId}`);
  }

  async getDiagnosis(opdId: string): Promise<OPDDiagnosis[]> {
    return apiClient.get<OPDDiagnosis[]>(`/opd/${opdId}/diagnosis`);
  }

  async createDiagnosis(opdId: string, data: Partial<OPDDiagnosis>): Promise<OPDDiagnosis> {
    return apiClient.post<OPDDiagnosis>(`/opd/${opdId}/diagnosis`, data);
  }

  async updateDiagnosis(opdId: string, diagnosisId: string, data: Partial<OPDDiagnosis>): Promise<OPDDiagnosis> {
    return apiClient.put<OPDDiagnosis>(`/opd/${opdId}/diagnosis/${diagnosisId}`, data);
  }

  async deleteDiagnosis(opdId: string, diagnosisId: string): Promise<void> {
    await apiClient.delete(`/opd/${opdId}/diagnosis/${diagnosisId}`);
  }

  async getTimeline(opdId: string): Promise<OPDTimeline[]> {
    return apiClient.get<OPDTimeline[]>(`/opd/${opdId}/timeline`);
  }

  async createTimelineEntry(opdId: string, data: Partial<OPDTimeline>): Promise<OPDTimeline> {
    return apiClient.post<OPDTimeline>(`/opd/${opdId}/timeline`, data);
  }

  async updateTimelineEntry(opdId: string, timelineId: string, data: Partial<OPDTimeline>): Promise<OPDTimeline> {
    return apiClient.put<OPDTimeline>(`/opd/${opdId}/timeline/${timelineId}`, data);
  }

  async deleteTimelineEntry(opdId: string, timelineId: string): Promise<void> {
    await apiClient.delete(`/opd/${opdId}/timeline/${timelineId}`);
  }

  async getCharges(opdId: string): Promise<OPDCharge[]> {
    return apiClient.get<OPDCharge[]>(`/opd/${opdId}/charges`);
  }

  async addCharge(opdId: string, data: Partial<OPDCharge>): Promise<OPDCharge> {
    return apiClient.post<OPDCharge>(`/opd/${opdId}/charges`, data);
  }

  async deleteCharge(opdId: string, chargeId: string): Promise<void> {
    await apiClient.delete(`/opd/${opdId}/charges/${chargeId}`);
  }

  async getPayments(opdId: string): Promise<OPDPayment[]> {
    return apiClient.get<OPDPayment[]>(`/opd/${opdId}/payments`);
  }

  async addPayment(opdId: string, data: Partial<OPDPayment>): Promise<OPDPayment> {
    return apiClient.post<OPDPayment>(`/opd/${opdId}/payments`, data);
  }

  async getBill(opdId: string): Promise<OPDBill> {
    return apiClient.get<OPDBill>(`/opd/${opdId}/bill`);
  }

  async generateBill(opdId: string): Promise<OPDBill> {
    return apiClient.post<OPDBill>(`/opd/${opdId}/bill/generate`, {});
  }

  async getByPatient(patientId: string): Promise<OPDPatient[]> {
    return apiClient.get<OPDPatient[]>(`/opd/patient/${patientId}`);
  }
}

export const opdService = new OPDService();
