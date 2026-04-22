/**
 * Pharmacy Service
 * Handles all pharmacy-related API calls
 */

import { apiClient } from './apiClient';

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  categoryId: string;
  dosage: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  price: number;
  quantity: number;
  reorderLevel: number;
  createdAt: string;
}

export interface MedicineStock {
  id: string;
  medicineId: string;
  quantity: number;
  batchNumber: string;
  expiryDate: string;
  entryDate: string;
}

export interface PharmacyPurchase {
  id: string;
  supplierId: string;
  purchaseDate: string;
  totalAmount: number;
  status: 'pending' | 'received' | 'cancelled';
  items: Array<{
    medicineId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface PharmacyBill {
  id: string;
  patientId: string;
  billDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: Array<{
    medicineId: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

class PharmacyService {
  /**
   * Get all medicines
   */
  async getMedicines(): Promise<Medicine[]> {
    return apiClient.get<Medicine[]>('/pharmacy/medicines');
  }

  /**
   * Get medicine by ID
   */
  async getMedicine(id: string): Promise<Medicine> {
    return apiClient.get<Medicine>(`/pharmacy/medicines/${id}`);
  }

  /**
   * Add medicine
   */
  async addMedicine(data: Partial<Medicine>): Promise<Medicine> {
    return apiClient.post<Medicine>('/pharmacy/medicines', data);
  }

  /**
   * Update medicine
   */
  async updateMedicine(id: string, data: Partial<Medicine>): Promise<Medicine> {
    return apiClient.put<Medicine>(`/pharmacy/medicines/${id}`, data);
  }

  /**
   * Delete medicine
   */
  async deleteMedicine(id: string): Promise<void> {
    await apiClient.delete(`/pharmacy/medicines/${id}`);
  }

  /**
   * Import medicines (bulk)
   */
  async importMedicines(data: any[]): Promise<void> {
    await apiClient.post('/pharmacy/import', { medicines: data });
  }

  /**
   * Get medicine stock
   */
  async getStock(medicineId?: string): Promise<MedicineStock[]> {
    return apiClient.get<MedicineStock[]>(`/pharmacy/stock${medicineId ? `?medicineId=${medicineId}` : ''}`);
  }

  /**
   * Add stock entry
   */
  async addStock(data: Partial<MedicineStock>): Promise<MedicineStock> {
    return apiClient.post<MedicineStock>(`/pharmacy/stock`, data);
  }

  /**
   * Get bad stock
   */
  async getBadStock(medicineId?: string): Promise<MedicineStock[]> {
    return apiClient.get<MedicineStock[]>(`/pharmacy/bad-stock${medicineId ? `?medicineId=${medicineId}` : ''}`);
  }

  /**
   * Add bad stock
   */
  async addBadStock(data: Partial<MedicineStock>): Promise<MedicineStock> {
    return apiClient.post<MedicineStock>(`/pharmacy/bad-stock`, data);
  }

  /**
   * Get all purchases
   */
  async getPurchases(): Promise<PharmacyPurchase[]> {
    return apiClient.get<PharmacyPurchase[]>('/pharmacy/purchases');
  }

  /**
   * Get purchase by ID
   */
  async getPurchase(id: string): Promise<PharmacyPurchase> {
    return apiClient.get<PharmacyPurchase>(`/pharmacy/purchases/${id}`);
  }

  /**
   * Create purchase
   */
  async createPurchase(data: Partial<PharmacyPurchase>): Promise<PharmacyPurchase> {
    return apiClient.post<PharmacyPurchase>('/pharmacy/purchases', data);
  }

  /**
   * Update purchase
   */
  async updatePurchase(id: string, data: Partial<PharmacyPurchase>): Promise<PharmacyPurchase> {
    return apiClient.put<PharmacyPurchase>(`/pharmacy/purchases/${id}`, data);
  }

  /**
   * Delete purchase
   */
  async deletePurchase(id: string): Promise<void> {
    await apiClient.delete(`/pharmacy/purchases/${id}`);
  }

  /**
   * Get all pharmacy bills
   */
  async getBills(): Promise<PharmacyBill[]> {
    return apiClient.get<PharmacyBill[]>('/pharmacy/bills');
  }

  /**
   * Get bill by ID
   */
  async getBill(id: string): Promise<PharmacyBill> {
    return apiClient.get<PharmacyBill>(`/pharmacy/bills/${id}`);
  }

  /**
   * Generate pharmacy bill
   */
  async generateBill(data: Partial<PharmacyBill>): Promise<PharmacyBill> {
    return apiClient.post<PharmacyBill>('/pharmacy/bills', data);
  }

  /**
   * Update bill
   */
  async updateBill(id: string, data: Partial<PharmacyBill>): Promise<PharmacyBill> {
    return apiClient.put<PharmacyBill>(`/pharmacy/bills/${id}`, data);
  }

  /**
   * Delete bill
   */
  async deleteBill(id: string): Promise<void> {
    await apiClient.delete(`/pharmacy/bills/${id}`);
  }
}

export const pharmacyService = new PharmacyService();
