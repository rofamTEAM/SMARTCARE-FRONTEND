/**
 * Patient Type Definitions
 * Maps to backend Prisma schema field names (snake_case)
 */

export interface Patient {
  id?: number;
  patient_unique_id?: number;
  patient_name: string;
  age: string;
  gender: string;
  email?: string;
  mobileno: string;
  dob?: string;
  blood_group: string;
  address: string;
  marital_status?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_address?: string;
  known_allergies?: string;
  patient_type?: string;
  is_ipd?: string;
  discharged?: string;
  credit_limit?: string;
  organisation?: string;
  note?: string;
  admission_date?: string;
  image?: string;
  old_patient?: string;
  is_active?: string;
  created_at?: string;
  disable_at?: string;
  app_key?: string;
}

export interface PatientFormData {
  patient_name: string;
  age: string;
  gender: string;
  email?: string;
  mobileno: string;
  dob?: string;
  blood_group: string;
  address: string;
  marital_status?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_address?: string;
  known_allergies?: string;
  patient_type?: string;
  note?: string;
}

export interface PatientListItem {
  id: number;
  patient_name: string;
  patient_unique_id: number;
  age: string;
  gender: string;
  mobileno: string;
  email?: string;
  blood_group: string;
  admission_date?: string;
  patient_type?: string;
  is_ipd?: string;
}

export interface InpatientAdmission {
  id: string;
  patientId: number;
  patient_name: string;
  bedId: string;
  ward: string;
  admission_date: string;
  admission_type: 'emergency' | 'elective' | 'transfer';
  condition?: string;
  attending_doctor?: string;
  status: 'admitted' | 'discharged' | 'transferred';
  estimated_discharge?: string;
}

export interface OutpatientAppointment {
  id: string;
  patient_name: string;
  patientId: number;
  doctor_name: string;
  department: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'checked-in' | 'in-consultation' | 'completed' | 'cancelled';
  type: 'new' | 'follow-up';
  insurance?: string;
  mobileno: string;
}

export interface PatientRegistration {
  id: string;
  patientId: number;
  patient_name: string;
  age: string;
  gender: string;
  mobileno: string;
  email?: string;
  emergency_contact?: string;
  visit_type?: string;
  registration_date: string;
  status: 'pending' | 'checked-in' | 'completed';
}
