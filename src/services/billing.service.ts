import { apiClient } from './apiClient';

export interface Invoice {
  id: string;
  patientId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'check' | 'bank_transfer' | 'insurance';
  paymentDate: string;
  referenceNumber?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  createdAt: string;
}

export interface BillingReport {
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  invoiceCount: number;
  paymentCount: number;
  averageInvoiceAmount: number;
}

class BillingService {
  async getAllBills(): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>('/billing');
  }

  async getOpdBills(): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>('/billing/opd');
  }

  async getIpdBills(): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>('/billing/ipd');
  }

  async getPharmacyBills(): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>('/billing/pharmacy');
  }

  async createOpdBill(data: Partial<Invoice>): Promise<Invoice> {
    return apiClient.post<Invoice>('/billing/opd', data);
  }

  async createIpdBill(data: Partial<Invoice>): Promise<Invoice> {
    return apiClient.post<Invoice>('/billing/ipd', data);
  }

  // Keep legacy method names for backward compatibility
  async getInvoices(filters?: {
    status?: string;
    patientId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Invoice[]> {
    return this.getAllBills();
  }

  async getInvoice(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/billing/${id}`);
  }

  async recordPayment(data: Partial<Payment>): Promise<Payment> {
    return apiClient.post<Payment>('/billing/payments', data);
  }

  async getPayments(filters?: {
    status?: string;
    patientId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.patientId) params.append('patientId', filters.patientId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<Payment[]>(`/billing/payments${query}`);
  }
}

export const billingService = new BillingService();
