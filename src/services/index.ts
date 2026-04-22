/**
 * Services Index
 * Central export point for all API services
 */

export { apiClient } from './apiClient';
export type { ApiError } from './apiClient';

export { authService } from './auth.service';
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfile,
} from './auth.service';

export { patientsService } from './patients.service';
export type {
  Patient,
  CreatePatientRequest,
  PaginatedResponse,
} from './patients.service';

export { appointmentsService } from './appointments.service';
export type {
  Appointment,
  CreateAppointmentRequest,
  AppointmentFilter,
} from './appointments.service';

export { opdService } from './opd.service';
export type {
  OPDPatient,
  OPDVisit,
  Prescription,
  OPDCharge,
  OPDPayment,
} from './opd.service';

export { ipdService } from './ipd.service';
export type {
  IPDPatient,
  IPDConsultant,
  IPDDiagnosis,
  IPDTimeline,
  IPDPrescription,
  IPDCharge,
  IPDPayment,
} from './ipd.service';

export { pharmacyService } from './pharmacy.service';
export type {
  Medicine,
  MedicineStock,
  PharmacyPurchase,
  PharmacyBill,
} from './pharmacy.service';

export { pathologyService } from './pathology.service';
export type {
  PathologyTest,
  PathologyReport,
} from './pathology.service';

export { radiologyService } from './radiology.service';
export type {
  RadiologyTest,
  RadiologyReport,
} from './radiology.service';

export { billingService } from './billing.service';
export type {
  Invoice,
  InvoiceItem,
  Payment,
  BillingReport,
} from './billing.service';

export { setupService } from './setup.service';
export type {
  ChargeCategory,
  Charge,
  Floor,
  BedGroup,
  BedType,
  Bed,
  PrintHeader,
  VisitorPurpose,
  ComplainType,
  ComplainSource,
  MedicineCategory,
  Supplier,
  MedicineDosage,
  PathologyCategory,
  RadiologyCategory,
  IncomeHead,
  ExpenseHead,
  BirthField,
  DeathField,
  LeaveType,
  Department,
  Designation,
  ItemCategory,
  ItemStore,
  ItemSupplier,
} from './setup.service';

export { frontofficeService } from './frontoffice.service';
export type {
  FrontOfficeAppointment,
  Visitor,
  CallLog,
  ReceivedPostal,
  DispatchedPostal,
  Complain,
} from './frontoffice.service';

export { operationtheatreService } from './operationtheatre.service';
export type {
  OTPatient,
  OTConsultantInstruction,
  OTBill,
} from './operationtheatre.service';

export { bloodbankService } from './bloodbank.service';
export type {
  BloodGroupStatus,
  BloodDonor,
  BloodIssue,
} from './bloodbank.service';
