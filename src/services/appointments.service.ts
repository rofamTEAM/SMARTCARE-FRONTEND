import { apiClient } from './apiClient';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  notes?: string;
}

export interface AppointmentFilter {
  status?: string;
  doctorId?: string;
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

class AppointmentsService {
  async getAll(filters?: AppointmentFilter): Promise<Appointment[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.doctorId) params.append('doctorId', filters.doctorId);
      if (filters?.patientId) params.append('patientId', filters.patientId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiClient.get<any>(`/appointments${query}`);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      }
      if (response?.appointments && Array.isArray(response.appointments)) {
        return response.appointments;
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Appointment> {
    return apiClient.get<Appointment>(`/appointments/${id}`);
  }

  async create(data: CreateAppointmentRequest): Promise<Appointment> {
    return apiClient.post<Appointment>('/appointments', data);
  }

  async update(id: string, data: Partial<CreateAppointmentRequest>): Promise<Appointment> {
    return apiClient.put<Appointment>(`/appointments/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  }

  async approve(id: string): Promise<Appointment> {
    return apiClient.put<Appointment>(`/appointments/${id}/approve`, {});
  }

  async cancel(id: string, reason?: string): Promise<Appointment> {
    return apiClient.put<Appointment>(`/appointments/${id}/cancel`, { reason });
  }

  async moveToOPD(id: string): Promise<Appointment> {
    return apiClient.post<Appointment>(`/appointments/${id}/move-to-opd`, {});
  }

  async moveToIPD(id: string): Promise<Appointment> {
    return apiClient.post<Appointment>(`/appointments/${id}/move-to-ipd`, {});
  }

  async getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
    return apiClient.get<string[]>(
      `/appointments/available-slots?doctorId=${doctorId}&date=${date}`
    );
  }
}

export const appointmentsService = new AppointmentsService();
