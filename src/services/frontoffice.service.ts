import { apiClient } from './apiClient';

export interface FrontOfficeAppointment {
  id: string; patientId: string; doctorId: string; appointmentDate: string;
  appointmentTime: string; status: 'scheduled' | 'approved' | 'cancelled' | 'completed';
  reason: string; notes?: string; createdAt: string; updatedAt: string;
}
export interface CreateFrontOfficeAppointmentRequest {
  patientId: string; doctorId: string; appointmentDate: string;
  appointmentTime: string; reason: string; notes?: string;
}

export interface Visitor {
  id: string; name: string; phone?: string; email?: string; purposeId: string;
  patientId: string; visitDate: string; visitTime: string; notes?: string;
  createdAt: string; updatedAt: string;
}
export interface CreateVisitorRequest {
  name: string; phone?: string; email?: string; purposeId: string;
  patientId: string; visitDate: string; visitTime: string; notes?: string;
}

export interface CallLog {
  id: string; callerName: string; callerPhone: string; callDate: string;
  callTime: string; duration: number; purpose: string; notes?: string;
  createdAt: string; updatedAt: string;
}
export interface CreateCallLogRequest {
  callerName: string; callerPhone: string; callDate: string;
  callTime: string; duration: number; purpose: string; notes?: string;
}

export interface ReceivedPostal {
  id: string; referenceNumber: string; senderName: string; senderAddress?: string;
  receivedDate: string; receivedTime: string; description: string; notes?: string;
  createdAt: string; updatedAt: string;
}
export interface CreateReceivedPostalRequest {
  referenceNumber: string; senderName: string; senderAddress?: string;
  receivedDate: string; receivedTime: string; description: string; notes?: string;
}

export interface DispatchedPostal {
  id: string; referenceNumber: string; recipientName: string; recipientAddress: string;
  dispatchDate: string; dispatchTime: string; description: string;
  courierName?: string; trackingNumber?: string; notes?: string;
  createdAt: string; updatedAt: string;
}
export interface CreateDispatchedPostalRequest {
  referenceNumber: string; recipientName: string; recipientAddress: string;
  dispatchDate: string; dispatchTime: string; description: string;
  courierName?: string; trackingNumber?: string; notes?: string;
}

export interface Complain {
  id: string; complainantName: string; complainantPhone?: string; complainantEmail?: string;
  typeId: string; sourceId: string; description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high'; assignedTo?: string;
  resolutionDate?: string; notes?: string; createdAt: string; updatedAt: string;
}
export interface CreateComplainRequest {
  complainantName: string; complainantPhone?: string; complainantEmail?: string;
  typeId: string; sourceId: string; description: string;
  priority?: string; assignedTo?: string; notes?: string;
}

class FrontOfficeService {
  // Appointments — backend: /appointments
  async getAppointments() { return apiClient.get<FrontOfficeAppointment[]>('/appointments'); }
  async createAppointment(data: CreateFrontOfficeAppointmentRequest) { return apiClient.post<FrontOfficeAppointment>('/appointments', data); }
  async updateAppointment(id: string, data: Partial<CreateFrontOfficeAppointmentRequest>) { return apiClient.put<FrontOfficeAppointment>(`/appointments/${id}`, data); }
  async deleteAppointment(id: string) { await apiClient.delete(`/appointments/${id}`); }
  async approveAppointment(id: string) { return apiClient.put<FrontOfficeAppointment>(`/appointments/${id}/approve`, {}); }
  async cancelAppointment(id: string, reason?: string) { return apiClient.put<FrontOfficeAppointment>(`/appointments/${id}/cancel`, { reason }); }
  async moveAppointmentToOPD(id: string) { return apiClient.post<FrontOfficeAppointment>(`/appointments/${id}/move-to-opd`, {}); }
  async moveAppointmentToIPD(id: string) { return apiClient.post<FrontOfficeAppointment>(`/appointments/${id}/move-to-ipd`, {}); }

  // Visitors — backend: /frontoffice/visitors
  async getVisitors() { return apiClient.get<Visitor[]>('/frontoffice/visitors'); }
  async createVisitor(data: CreateVisitorRequest) { return apiClient.post<Visitor>('/frontoffice/visitors', data); }
  async updateVisitor(id: string, data: Partial<CreateVisitorRequest>) { return apiClient.put<Visitor>(`/frontoffice/visitors/${id}`, data); }
  async deleteVisitor(id: string) { await apiClient.delete(`/frontoffice/visitors/${id}`); }

  // Phone Calls — backend: /frontoffice/calls
  async getCallLogs() { return apiClient.get<CallLog[]>('/frontoffice/calls'); }
  async createCallLog(data: CreateCallLogRequest) { return apiClient.post<CallLog>('/frontoffice/calls', data); }
  async updateCallLog(id: string, data: Partial<CreateCallLogRequest>) { return apiClient.put<CallLog>(`/frontoffice/calls/${id}`, data); }
  async deleteCallLog(id: string) { await apiClient.delete(`/frontoffice/calls/${id}`); }

  // Postal Receive — backend: /frontoffice/postal/receive
  async getReceivedPostal() { return apiClient.get<ReceivedPostal[]>('/frontoffice/postal/receive'); }
  async createReceivedPostal(data: CreateReceivedPostalRequest) { return apiClient.post<ReceivedPostal>('/frontoffice/postal/receive', data); }
  async updateReceivedPostal(id: string, data: Partial<CreateReceivedPostalRequest>) { return apiClient.put<ReceivedPostal>(`/frontoffice/postal/receive/${id}`, data); }
  async deleteReceivedPostal(id: string) { await apiClient.delete(`/frontoffice/postal/receive/${id}`); }

  // Postal Dispatch — backend: /frontoffice/postal/dispatch
  async getDispatchedPostal() { return apiClient.get<DispatchedPostal[]>('/frontoffice/postal/dispatch'); }
  async createDispatchedPostal(data: CreateDispatchedPostalRequest) { return apiClient.post<DispatchedPostal>('/frontoffice/postal/dispatch', data); }
  async updateDispatchedPostal(id: string, data: Partial<CreateDispatchedPostalRequest>) { return apiClient.put<DispatchedPostal>(`/frontoffice/postal/dispatch/${id}`, data); }
  async deleteDispatchedPostal(id: string) { await apiClient.delete(`/frontoffice/postal/dispatch/${id}`); }

  // Complaints — backend: /complaints
  async getComplains() { return apiClient.get<Complain[]>('/complaints'); }
  async createComplain(data: CreateComplainRequest) { return apiClient.post<Complain>('/complaints', data); }
  async updateComplain(id: string, data: Partial<CreateComplainRequest>) { return apiClient.put<Complain>(`/complaints/${id}`, data); }
  async deleteComplain(id: string) { await apiClient.delete(`/complaints/${id}`); }
}

export const frontofficeService = new FrontOfficeService();
