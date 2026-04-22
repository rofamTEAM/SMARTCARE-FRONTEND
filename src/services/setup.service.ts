import { apiClient } from './apiClient';

export interface ChargeCategory { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface CreateChargeCategoryRequest { name: string; description?: string; }

export interface Charge { id: string; categoryId: string; name: string; amount: number; description?: string; createdAt: string; updatedAt: string; }
export interface CreateChargeRequest { categoryId: string; name: string; amount: number; description?: string; }

export interface Floor { id: string; name: string; floorNumber: number; description?: string; createdAt: string; updatedAt: string; }
export interface CreateFloorRequest { name: string; floorNumber: number; description?: string; }

export interface BedGroup { id: string; name: string; floorId: string; description?: string; createdAt: string; updatedAt: string; }
export interface CreateBedGroupRequest { name: string; floorId: string; description?: string; }

export interface BedType { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface CreateBedTypeRequest { name: string; description?: string; }

export interface Bed { id: string; bedNumber: string; floorId: string; groupId: string; typeId: string; status: 'available' | 'occupied' | 'maintenance'; createdAt: string; updatedAt: string; }
export interface CreateBedRequest { bedNumber: string; floorId: string; groupId: string; typeId: string; status?: string; }

export interface PrintHeader { id: string; content: string; type: string; createdAt: string; updatedAt: string; }
export interface CreatePrintHeaderRequest { content: string; }

export interface VisitorPurpose { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface ComplainType { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface ComplainSource { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface CreateFrontOfficeItemRequest { name: string; description?: string; }

export interface MedicineCategory { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface Supplier { id: string; name: string; contactPerson?: string; phone?: string; email?: string; address?: string; createdAt: string; updatedAt: string; }
export interface MedicineDosage { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface CreateMedicineCategoryRequest { name: string; description?: string; }
export interface CreateSupplierRequest { name: string; contactPerson?: string; phone?: string; email?: string; address?: string; }
export interface CreateMedicineDosageRequest { name: string; description?: string; }

export interface PathologyCategory { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface CreatePathologyCategoryRequest { name: string; description?: string; }

export interface RadiologyCategory { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface CreateRadiologyCategoryRequest { name: string; description?: string; }

export interface IncomeHead { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface ExpenseHead { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface CreateFinanceHeadRequest { name: string; description?: string; }

export interface BirthField { id: string; fieldName: string; fieldType: string; required: boolean; createdAt: string; updatedAt: string; }
export interface DeathField { id: string; fieldName: string; fieldType: string; required: boolean; createdAt: string; updatedAt: string; }
export interface CreateBirthDeathFieldRequest { fieldName: string; fieldType: string; required?: boolean; }

export interface LeaveType { id: string; name: string; daysAllowed: number; description?: string; createdAt: string; updatedAt: string; }
export interface Department { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface Designation { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface CreateLeaveTypeRequest { name: string; daysAllowed: number; description?: string; }
export interface CreateDepartmentRequest { name: string; description?: string; }
export interface CreateDesignationRequest { name: string; description?: string; }

export interface ItemCategory { id: string; name: string; description?: string; createdAt: string; updatedAt: string; }
export interface ItemStore { id: string; name: string; location?: string; description?: string; createdAt: string; updatedAt: string; }
export interface ItemSupplier { id: string; name: string; contactPerson?: string; phone?: string; email?: string; address?: string; createdAt: string; updatedAt: string; }
export interface CreateItemCategoryRequest { name: string; description?: string; }
export interface CreateItemStoreRequest { name: string; location?: string; description?: string; }
export interface CreateItemSupplierRequest { name: string; contactPerson?: string; phone?: string; email?: string; address?: string; }

class SetupService {
  // Charge Categories — backend: /setup/charge-categories
  async getChargeCategories() { return apiClient.get<ChargeCategory[]>('/setup/charge-categories'); }
  async createChargeCategory(data: CreateChargeCategoryRequest) { return apiClient.post<ChargeCategory>('/setup/charge-categories', data); }
  async updateChargeCategory(id: string, data: Partial<CreateChargeCategoryRequest>) { return apiClient.put<ChargeCategory>(`/setup/charge-categories/${id}`, data); }
  async deleteChargeCategory(id: string) { await apiClient.delete(`/setup/charge-categories/${id}`); }

  // Floors — backend: /setup/floors
  async getFloors() { return apiClient.get<Floor[]>('/setup/floors'); }
  async createFloor(data: CreateFloorRequest) { return apiClient.post<Floor>('/setup/floors', data); }
  async updateFloor(id: string, data: Partial<CreateFloorRequest>) { return apiClient.put<Floor>(`/setup/floors/${id}`, data); }
  async deleteFloor(id: string) { await apiClient.delete(`/setup/floors/${id}`); }

  // Bed Groups — backend: /setup/bed-groups
  async getBedGroups() { return apiClient.get<BedGroup[]>('/setup/bed-groups'); }
  async createBedGroup(data: CreateBedGroupRequest) { return apiClient.post<BedGroup>('/setup/bed-groups', data); }
  async updateBedGroup(id: string, data: Partial<CreateBedGroupRequest>) { return apiClient.put<BedGroup>(`/setup/bed-groups/${id}`, data); }
  async deleteBedGroup(id: string) { await apiClient.delete(`/setup/bed-groups/${id}`); }

  // Bed Types — backend: /setup/bed-types
  async getBedTypes() { return apiClient.get<BedType[]>('/setup/bed-types'); }
  async createBedType(data: CreateBedTypeRequest) { return apiClient.post<BedType>('/setup/bed-types', data); }
  async updateBedType(id: string, data: Partial<CreateBedTypeRequest>) { return apiClient.put<BedType>(`/setup/bed-types/${id}`, data); }
  async deleteBedType(id: string) { await apiClient.delete(`/setup/bed-types/${id}`); }

  // Complaint Types — backend: /setup/complaint-types
  async getComplainTypes() { return apiClient.get<ComplainType[]>('/setup/complaint-types'); }
  async createComplainType(data: CreateFrontOfficeItemRequest) { return apiClient.post<ComplainType>('/setup/complaint-types', data); }
  async updateComplainType(id: string, data: Partial<CreateFrontOfficeItemRequest>) { return apiClient.put<ComplainType>(`/setup/complaint-types/${id}`, data); }
  async deleteComplainType(id: string) { await apiClient.delete(`/setup/complaint-types/${id}`); }

  // Medicine Categories — backend: /setup/medicine-categories
  async getMedicineCategories() { return apiClient.get<MedicineCategory[]>('/setup/medicine-categories'); }
  async createMedicineCategory(data: CreateMedicineCategoryRequest) { return apiClient.post<MedicineCategory>('/setup/medicine-categories', data); }
  async updateMedicineCategory(id: string, data: Partial<CreateMedicineCategoryRequest>) { return apiClient.put<MedicineCategory>(`/setup/medicine-categories/${id}`, data); }
  async deleteMedicineCategory(id: string) { await apiClient.delete(`/setup/medicine-categories/${id}`); }

  // Income Heads — backend: /setup/income-heads
  async getIncomeHeads() { return apiClient.get<IncomeHead[]>('/setup/income-heads'); }
  async createIncomeHead(data: CreateFinanceHeadRequest) { return apiClient.post<IncomeHead>('/setup/income-heads', data); }
  async updateIncomeHead(id: string, data: Partial<CreateFinanceHeadRequest>) { return apiClient.put<IncomeHead>(`/setup/income-heads/${id}`, data); }
  async deleteIncomeHead(id: string) { await apiClient.delete(`/setup/income-heads/${id}`); }

  // Expense Heads — backend: /setup/expense-heads
  async getExpenseHeads() { return apiClient.get<ExpenseHead[]>('/setup/expense-heads'); }
  async createExpenseHead(data: CreateFinanceHeadRequest) { return apiClient.post<ExpenseHead>('/setup/expense-heads', data); }
  async updateExpenseHead(id: string, data: Partial<CreateFinanceHeadRequest>) { return apiClient.put<ExpenseHead>(`/setup/expense-heads/${id}`, data); }
  async deleteExpenseHead(id: string) { await apiClient.delete(`/setup/expense-heads/${id}`); }

  // Leave Types — backend: /setup/leave-types
  async getLeaveTypes() { return apiClient.get<LeaveType[]>('/setup/leave-types'); }
  async createLeaveType(data: CreateLeaveTypeRequest) { return apiClient.post<LeaveType>('/setup/leave-types', data); }
  async updateLeaveType(id: string, data: Partial<CreateLeaveTypeRequest>) { return apiClient.put<LeaveType>(`/setup/leave-types/${id}`, data); }
  async deleteLeaveType(id: string) { await apiClient.delete(`/setup/leave-types/${id}`); }

  // Item Categories — backend: /setup/item-categories
  async getItemCategories() { return apiClient.get<ItemCategory[]>('/setup/item-categories'); }
  async createItemCategory(data: CreateItemCategoryRequest) { return apiClient.post<ItemCategory>('/setup/item-categories', data); }
  async updateItemCategory(id: string, data: Partial<CreateItemCategoryRequest>) { return apiClient.put<ItemCategory>(`/setup/item-categories/${id}`, data); }
  async deleteItemCategory(id: string) { await apiClient.delete(`/setup/item-categories/${id}`); }

  // Item Stores — backend: /setup/item-stores
  async getItemStores() { return apiClient.get<ItemStore[]>('/setup/item-stores'); }
  async createItemStore(data: CreateItemStoreRequest) { return apiClient.post<ItemStore>('/setup/item-stores', data); }
  async updateItemStore(id: string, data: Partial<CreateItemStoreRequest>) { return apiClient.put<ItemStore>(`/setup/item-stores/${id}`, data); }
  async deleteItemStore(id: string) { await apiClient.delete(`/setup/item-stores/${id}`); }

  // Item Suppliers — backend: /setup/item-suppliers
  async getItemSuppliers() { return apiClient.get<ItemSupplier[]>('/setup/item-suppliers'); }
  async createItemSupplier(data: CreateItemSupplierRequest) { return apiClient.post<ItemSupplier>('/setup/item-suppliers', data); }
  async updateItemSupplier(id: string, data: Partial<CreateItemSupplierRequest>) { return apiClient.put<ItemSupplier>(`/setup/item-suppliers/${id}`, data); }
  async deleteItemSupplier(id: string) { await apiClient.delete(`/setup/item-suppliers/${id}`); }

  // Departments — backend: /departments
  async getDepartments() { return apiClient.get<Department[]>('/departments'); }
  async createDepartment(data: CreateDepartmentRequest) { return apiClient.post<Department>('/departments', data); }
  async updateDepartment(id: string, data: Partial<CreateDepartmentRequest>) { return apiClient.put<Department>(`/departments/${id}`, data); }
  async deleteDepartment(id: string) { await apiClient.delete(`/departments/${id}`); }

  // Beds — backend: /beds
  async getBeds() { return apiClient.get<Bed[]>('/beds'); }
  async createBed(data: CreateBedRequest) { return apiClient.post<Bed>('/beds', data); }
  async updateBed(id: string, data: Partial<CreateBedRequest>) { return apiClient.put<Bed>(`/beds/${id}`, data); }
  async deleteBed(id: string) { await apiClient.delete(`/beds/${id}`); }

  // Pathology Categories — backend: /pathology/categories
  async getPathologyCategories() { return apiClient.get<PathologyCategory[]>('/pathology/categories'); }
  async createPathologyCategory(data: CreatePathologyCategoryRequest) { return apiClient.post<PathologyCategory>('/pathology/categories', data); }
  async updatePathologyCategory(id: string, data: Partial<CreatePathologyCategoryRequest>) { return apiClient.put<PathologyCategory>(`/pathology/categories/${id}`, data); }
  async deletePathologyCategory(id: string) { await apiClient.delete(`/pathology/categories/${id}`); }

  // Radiology Categories — backend: /radiology/categories
  async getRadiologyCategories() { return apiClient.get<RadiologyCategory[]>('/radiology/categories'); }
  async createRadiologyCategory(data: CreateRadiologyCategoryRequest) { return apiClient.post<RadiologyCategory>('/radiology/categories', data); }
  async updateRadiologyCategory(id: string, data: Partial<CreateRadiologyCategoryRequest>) { return apiClient.put<RadiologyCategory>(`/radiology/categories/${id}`, data); }
  async deleteRadiologyCategory(id: string) { await apiClient.delete(`/radiology/categories/${id}`); }

  // Suppliers (pharmacy) — backend: /pharmacy/suppliers (stub)
  async getSuppliers() { return apiClient.get<Supplier[]>('/pharmacy/suppliers'); }
  async createSupplier(data: CreateSupplierRequest) { return apiClient.post<Supplier>('/pharmacy/suppliers', data); }
  async updateSupplier(id: string, data: Partial<CreateSupplierRequest>) { return apiClient.put<Supplier>(`/pharmacy/suppliers/${id}`, data); }
  async deleteSupplier(id: string) { await apiClient.delete(`/pharmacy/suppliers/${id}`); }

  // Designations — not in backend yet, stub gracefully
  async getDesignations() { return apiClient.get<Designation[]>('/setup/designations').catch(() => [] as Designation[]); }
  async createDesignation(data: CreateDesignationRequest) { return apiClient.post<Designation>('/setup/designations', data); }
  async updateDesignation(id: string, data: Partial<CreateDesignationRequest>) { return apiClient.put<Designation>(`/setup/designations/${id}`, data); }
  async deleteDesignation(id: string) { await apiClient.delete(`/setup/designations/${id}`); }

  // Visitor Purposes — not in backend yet, stub gracefully
  async getVisitorPurposes() { return apiClient.get<VisitorPurpose[]>('/setup/visitor-purposes').catch(() => [] as VisitorPurpose[]); }
  async createVisitorPurpose(data: CreateFrontOfficeItemRequest) { return apiClient.post<VisitorPurpose>('/setup/visitor-purposes', data); }
  async updateVisitorPurpose(id: string, data: Partial<CreateFrontOfficeItemRequest>) { return apiClient.put<VisitorPurpose>(`/setup/visitor-purposes/${id}`, data); }
  async deleteVisitorPurpose(id: string) { await apiClient.delete(`/setup/visitor-purposes/${id}`); }

  // Complain Sources — not in backend yet, stub gracefully
  async getComplainSources() { return apiClient.get<ComplainSource[]>('/setup/complain-sources').catch(() => [] as ComplainSource[]); }
  async createComplainSource(data: CreateFrontOfficeItemRequest) { return apiClient.post<ComplainSource>('/setup/complain-sources', data); }
  async updateComplainSource(id: string, data: Partial<CreateFrontOfficeItemRequest>) { return apiClient.put<ComplainSource>(`/setup/complain-sources/${id}`, data); }
  async deleteComplainSource(id: string) { await apiClient.delete(`/setup/complain-sources/${id}`); }

  // Medicine Dosages — not in backend yet, stub gracefully
  async getMedicineDosages() { return apiClient.get<MedicineDosage[]>('/setup/medicine-dosages').catch(() => [] as MedicineDosage[]); }
  async createMedicineDosage(data: CreateMedicineDosageRequest) { return apiClient.post<MedicineDosage>('/setup/medicine-dosages', data); }
  async updateMedicineDosage(id: string, data: Partial<CreateMedicineDosageRequest>) { return apiClient.put<MedicineDosage>(`/setup/medicine-dosages/${id}`, data); }
  async deleteMedicineDosage(id: string) { await apiClient.delete(`/setup/medicine-dosages/${id}`); }

  // Birth/Death fields — not in backend yet, stub gracefully
  async getBirthFields() { return apiClient.get<BirthField[]>('/setup/birth-fields').catch(() => [] as BirthField[]); }
  async createBirthField(data: CreateBirthDeathFieldRequest) { return apiClient.post<BirthField>('/setup/birth-fields', data); }
  async updateBirthField(id: string, data: Partial<CreateBirthDeathFieldRequest>) { return apiClient.put<BirthField>(`/setup/birth-fields/${id}`, data); }
  async deleteBirthField(id: string) { await apiClient.delete(`/setup/birth-fields/${id}`); }

  async getDeathFields() { return apiClient.get<DeathField[]>('/setup/death-fields').catch(() => [] as DeathField[]); }
  async createDeathField(data: CreateBirthDeathFieldRequest) { return apiClient.post<DeathField>('/setup/death-fields', data); }
  async updateDeathField(id: string, data: Partial<CreateBirthDeathFieldRequest>) { return apiClient.put<DeathField>(`/setup/death-fields/${id}`, data); }
  async deleteDeathField(id: string) { await apiClient.delete(`/setup/death-fields/${id}`); }

  // Print Headers — not in backend yet, stub gracefully
  async getPrintHeaders(type: string) { return apiClient.get<PrintHeader[]>(`/setup/print-headers/${type}`).catch(() => [] as PrintHeader[]); }
  async createPrintHeader(type: string, data: CreatePrintHeaderRequest) { return apiClient.post<PrintHeader>(`/setup/print-headers/${type}`, data); }
  async updatePrintHeader(type: string, id: string, data: Partial<CreatePrintHeaderRequest>) { return apiClient.put<PrintHeader>(`/setup/print-headers/${type}/${id}`, data); }
  async deletePrintHeader(type: string, id: string) { await apiClient.delete(`/setup/print-headers/${type}/${id}`); }
}

export const setupService = new SetupService();
