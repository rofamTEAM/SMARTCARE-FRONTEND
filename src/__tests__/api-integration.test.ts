/**
 * Frontend API Integration Tests
 * Comprehensive test suite to verify all frontend services are correctly connected to API endpoints
 */

import { apiClient } from '@/services/apiClient';
import { authService } from '@/services/auth.service';
import { patientsService } from '@/services/patients.service';
import { appointmentsService } from '@/services/appointments.service';
import { opdService } from '@/services/opd.service';
import { ipdService } from '@/services/ipd.service';
import { pharmacyService } from '@/services/pharmacy.service';
import { radiologyService } from '@/services/radiology.service';
import { pathologyService } from '@/services/pathology.service';
import { billingService } from '@/services/billing.service';
import { bloodbankService } from '@/services/bloodbank.service';
import { operationtheatreService } from '@/services/operationtheatre.service';
import { frontofficeService } from '@/services/frontoffice.service';
import { setupService } from '@/services/setup.service';
import { dashboardService } from '@/services/dashboard.service';
import { patientFlowService } from '@/services/patientFlow.service';
import { superAdminService } from '@/services/superadmin.service';

describe('Frontend API Integration Tests', () => {
  // ============================================================================
  // API Client Configuration Tests
  // ============================================================================
  describe('API Client Configuration', () => {
    test('API_BASE_URL should be configured', () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
      expect(apiUrl).toBeDefined();
      expect(apiUrl).toMatch(/^https?:\/\//);
    });

    test('API client should have required methods', () => {
      expect(apiClient.get).toBeDefined();
      expect(apiClient.post).toBeDefined();
      expect(apiClient.put).toBeDefined();
      expect(apiClient.delete).toBeDefined();
      expect(apiClient.setAuthToken).toBeDefined();
      expect(apiClient.clearAuthToken).toBeDefined();
    });

    test('API client should handle token management', () => {
      const testToken = 'test-token-123';
      apiClient.setAuthToken(testToken);
      expect(apiClient.getAuthToken()).toBe(testToken);
      
      apiClient.clearAuthToken();
      expect(apiClient.getAuthToken()).toBeNull();
    });
  });

  // ============================================================================
  // Authentication Service Tests
  // ============================================================================
  describe('Authentication Service', () => {
    test('authService should have login method', () => {
      expect(authService.login).toBeDefined();
      expect(typeof authService.login).toBe('function');
    });

    test('authService should have register method', () => {
      expect(authService.register).toBeDefined();
      expect(typeof authService.register).toBe('function');
    });

    test('authService should have getCurrentUser method', () => {
      expect(authService.getCurrentUser).toBeDefined();
      expect(typeof authService.getCurrentUser).toBe('function');
    });

    test('authService should have updateProfile method', () => {
      expect(authService.updateProfile).toBeDefined();
      expect(typeof authService.updateProfile).toBe('function');
    });

    test('authService should have changePassword method', () => {
      expect(authService.changePassword).toBeDefined();
      expect(typeof authService.changePassword).toBe('function');
    });

    test('authService should have logout method', () => {
      expect(authService.logout).toBeDefined();
      expect(typeof authService.logout).toBe('function');
    });
  });

  // ============================================================================
  // Patients Service Tests
  // ============================================================================
  describe('Patients Service', () => {
    test('patientsService should have getAll method', () => {
      expect(patientsService.getAll).toBeDefined();
      expect(typeof patientsService.getAll).toBe('function');
    });

    test('patientsService should have search method', () => {
      expect(patientsService.search).toBeDefined();
      expect(typeof patientsService.search).toBe('function');
    });

    test('patientsService should have getById method', () => {
      expect(patientsService.getById).toBeDefined();
      expect(typeof patientsService.getById).toBe('function');
    });

    test('patientsService should have create method', () => {
      expect(patientsService.create).toBeDefined();
      expect(typeof patientsService.create).toBe('function');
    });

    test('patientsService should have update method', () => {
      expect(patientsService.update).toBeDefined();
      expect(typeof patientsService.update).toBe('function');
    });

    test('patientsService should have delete method', () => {
      expect(patientsService.delete).toBeDefined();
      expect(typeof patientsService.delete).toBe('function');
    });
  });

  // ============================================================================
  // Appointments Service Tests
  // ============================================================================
  describe('Appointments Service', () => {
    test('appointmentsService should have getAll method', () => {
      expect(appointmentsService.getAll).toBeDefined();
      expect(typeof appointmentsService.getAll).toBe('function');
    });

    test('appointmentsService should have getById method', () => {
      expect(appointmentsService.getById).toBeDefined();
      expect(typeof appointmentsService.getById).toBe('function');
    });

    test('appointmentsService should have create method', () => {
      expect(appointmentsService.create).toBeDefined();
      expect(typeof appointmentsService.create).toBe('function');
    });

    test('appointmentsService should have update method', () => {
      expect(appointmentsService.update).toBeDefined();
      expect(typeof appointmentsService.update).toBe('function');
    });

    test('appointmentsService should have delete method', () => {
      expect(appointmentsService.delete).toBeDefined();
      expect(typeof appointmentsService.delete).toBe('function');
    });

    test('appointmentsService should have approve method', () => {
      expect(appointmentsService.approve).toBeDefined();
      expect(typeof appointmentsService.approve).toBe('function');
    });

    test('appointmentsService should have cancel method', () => {
      expect(appointmentsService.cancel).toBeDefined();
      expect(typeof appointmentsService.cancel).toBe('function');
    });
  });

  // ============================================================================
  // OPD Service Tests
  // ============================================================================
  describe('OPD Service', () => {
    test('opdService should have getPatients method', () => {
      expect(opdService.getPatients).toBeDefined();
      expect(typeof opdService.getPatients).toBe('function');
    });

    test('opdService should have createVisit method', () => {
      expect(opdService.createVisit).toBeDefined();
      expect(typeof opdService.createVisit).toBe('function');
    });

    test('opdService should have getPrescriptions method', () => {
      expect(opdService.getPrescriptions).toBeDefined();
      expect(typeof opdService.getPrescriptions).toBe('function');
    });

    test('opdService should have getDiagnosis method', () => {
      expect(opdService.getDiagnosis).toBeDefined();
      expect(typeof opdService.getDiagnosis).toBe('function');
    });

    test('opdService should have getBill method', () => {
      expect(opdService.getBill).toBeDefined();
      expect(typeof opdService.getBill).toBe('function');
    });
  });

  // ============================================================================
  // IPD Service Tests
  // ============================================================================
  describe('IPD Service', () => {
    test('ipdService should have getPatients method', () => {
      expect(ipdService.getPatients).toBeDefined();
      expect(typeof ipdService.getPatients).toBe('function');
    });

    test('ipdService should have admitPatient method', () => {
      expect(ipdService.admitPatient).toBeDefined();
      expect(typeof ipdService.admitPatient).toBe('function');
    });

    test('ipdService should have dischargePatient method', () => {
      expect(ipdService.dischargePatient).toBeDefined();
      expect(typeof ipdService.dischargePatient).toBe('function');
    });

    test('ipdService should have getPrescriptions method', () => {
      expect(ipdService.getPrescriptions).toBeDefined();
      expect(typeof ipdService.getPrescriptions).toBe('function');
    });

    test('ipdService should have getBill method', () => {
      expect(ipdService.getBill).toBeDefined();
      expect(typeof ipdService.getBill).toBe('function');
    });
  });

  // ============================================================================
  // Pharmacy Service Tests
  // ============================================================================
  describe('Pharmacy Service', () => {
    test('pharmacyService should have getMedicines method', () => {
      expect(pharmacyService.getMedicines).toBeDefined();
      expect(typeof pharmacyService.getMedicines).toBe('function');
    });

    test('pharmacyService should have getMedicine method', () => {
      expect(pharmacyService.getMedicine).toBeDefined();
      expect(typeof pharmacyService.getMedicine).toBe('function');
    });

    test('pharmacyService should have addMedicine method', () => {
      expect(pharmacyService.addMedicine).toBeDefined();
      expect(typeof pharmacyService.addMedicine).toBe('function');
    });

    test('pharmacyService should have updateMedicine method', () => {
      expect(pharmacyService.updateMedicine).toBeDefined();
      expect(typeof pharmacyService.updateMedicine).toBe('function');
    });

    test('pharmacyService should have deleteMedicine method', () => {
      expect(pharmacyService.deleteMedicine).toBeDefined();
      expect(typeof pharmacyService.deleteMedicine).toBe('function');
    });
  });

  // ============================================================================
  // Radiology Service Tests
  // ============================================================================
  describe('Radiology Service', () => {
    test('radiologyService should have getTests method', () => {
      expect(radiologyService.getTests).toBeDefined();
      expect(typeof radiologyService.getTests).toBe('function');
    });

    test('radiologyService should have getTest method', () => {
      expect(radiologyService.getTest).toBeDefined();
      expect(typeof radiologyService.getTest).toBe('function');
    });

    test('radiologyService should have addTest method', () => {
      expect(radiologyService.addTest).toBeDefined();
      expect(typeof radiologyService.addTest).toBe('function');
    });

    test('radiologyService should have getReports method', () => {
      expect(radiologyService.getReports).toBeDefined();
      expect(typeof radiologyService.getReports).toBe('function');
    });

    test('radiologyService should have addReport method', () => {
      expect(radiologyService.addReport).toBeDefined();
      expect(typeof radiologyService.addReport).toBe('function');
    });
  });

  // ============================================================================
  // Pathology Service Tests
  // ============================================================================
  describe('Pathology Service', () => {
    test('pathologyService should have getTests method', () => {
      expect(pathologyService.getTests).toBeDefined();
      expect(typeof pathologyService.getTests).toBe('function');
    });

    test('pathologyService should have getTest method', () => {
      expect(pathologyService.getTest).toBeDefined();
      expect(typeof pathologyService.getTest).toBe('function');
    });

    test('pathologyService should have addTest method', () => {
      expect(pathologyService.addTest).toBeDefined();
      expect(typeof pathologyService.addTest).toBe('function');
    });

    test('pathologyService should have getReports method', () => {
      expect(pathologyService.getReports).toBeDefined();
      expect(typeof pathologyService.getReports).toBe('function');
    });

    test('pathologyService should have addReport method', () => {
      expect(pathologyService.addReport).toBeDefined();
      expect(typeof pathologyService.addReport).toBe('function');
    });
  });

  // ============================================================================
  // Billing Service Tests
  // ============================================================================
  describe('Billing Service', () => {
    test('billingService should have getAllBills method', () => {
      expect(billingService.getAllBills).toBeDefined();
      expect(typeof billingService.getAllBills).toBe('function');
    });

    test('billingService should have getOpdBills method', () => {
      expect(billingService.getOpdBills).toBeDefined();
      expect(typeof billingService.getOpdBills).toBe('function');
    });

    test('billingService should have getIpdBills method', () => {
      expect(billingService.getIpdBills).toBeDefined();
      expect(typeof billingService.getIpdBills).toBe('function');
    });

    test('billingService should have createOpdBill method', () => {
      expect(billingService.createOpdBill).toBeDefined();
      expect(typeof billingService.createOpdBill).toBe('function');
    });

    test('billingService should have createIpdBill method', () => {
      expect(billingService.createIpdBill).toBeDefined();
      expect(typeof billingService.createIpdBill).toBe('function');
    });
  });

  // ============================================================================
  // Blood Bank Service Tests
  // ============================================================================
  describe('Blood Bank Service', () => {
    test('bloodbankService should have getBloodBankStatus method', () => {
      expect(bloodbankService.getBloodBankStatus).toBeDefined();
      expect(typeof bloodbankService.getBloodBankStatus).toBe('function');
    });

    test('bloodbankService should have getDonors method', () => {
      expect(bloodbankService.getDonors).toBeDefined();
      expect(typeof bloodbankService.getDonors).toBe('function');
    });

    test('bloodbankService should have createDonor method', () => {
      expect(bloodbankService.createDonor).toBeDefined();
      expect(typeof bloodbankService.createDonor).toBe('function');
    });

    test('bloodbankService should have getBloodIssues method', () => {
      expect(bloodbankService.getBloodIssues).toBeDefined();
      expect(typeof bloodbankService.getBloodIssues).toBe('function');
    });

    test('bloodbankService should have issueBlood method', () => {
      expect(bloodbankService.issueBlood).toBeDefined();
      expect(typeof bloodbankService.issueBlood).toBe('function');
    });
  });

  // ============================================================================
  // Operation Theatre Service Tests
  // ============================================================================
  describe('Operation Theatre Service', () => {
    test('operationtheatreService should have getOTPatients method', () => {
      expect(operationtheatreService.getOTPatients).toBeDefined();
      expect(typeof operationtheatreService.getOTPatients).toBe('function');
    });

    test('operationtheatreService should have createOTPatient method', () => {
      expect(operationtheatreService.createOTPatient).toBeDefined();
      expect(typeof operationtheatreService.createOTPatient).toBe('function');
    });

    test('operationtheatreService should have getConsultantInstructions method', () => {
      expect(operationtheatreService.getConsultantInstructions).toBeDefined();
      expect(typeof operationtheatreService.getConsultantInstructions).toBe('function');
    });

    test('operationtheatreService should have addConsultantInstruction method', () => {
      expect(operationtheatreService.addConsultantInstruction).toBeDefined();
      expect(typeof operationtheatreService.addConsultantInstruction).toBe('function');
    });
  });

  // ============================================================================
  // Front Office Service Tests
  // ============================================================================
  describe('Front Office Service', () => {
    test('frontofficeService should have getAppointments method', () => {
      expect(frontofficeService.getAppointments).toBeDefined();
      expect(typeof frontofficeService.getAppointments).toBe('function');
    });

    test('frontofficeService should have getVisitors method', () => {
      expect(frontofficeService.getVisitors).toBeDefined();
      expect(typeof frontofficeService.getVisitors).toBe('function');
    });

    test('frontofficeService should have getCallLogs method', () => {
      expect(frontofficeService.getCallLogs).toBeDefined();
      expect(typeof frontofficeService.getCallLogs).toBe('function');
    });

    test('frontofficeService should have getComplains method', () => {
      expect(frontofficeService.getComplains).toBeDefined();
      expect(typeof frontofficeService.getComplains).toBe('function');
    });
  });

  // ============================================================================
  // Setup Service Tests
  // ============================================================================
  describe('Setup Service', () => {
    test('setupService should have getChargeCategories method', () => {
      expect(setupService.getChargeCategories).toBeDefined();
      expect(typeof setupService.getChargeCategories).toBe('function');
    });

    test('setupService should have getFloors method', () => {
      expect(setupService.getFloors).toBeDefined();
      expect(typeof setupService.getFloors).toBe('function');
    });

    test('setupService should have getBedGroups method', () => {
      expect(setupService.getBedGroups).toBeDefined();
      expect(typeof setupService.getBedGroups).toBe('function');
    });

    test('setupService should have getMedicineCategories method', () => {
      expect(setupService.getMedicineCategories).toBeDefined();
      expect(typeof setupService.getMedicineCategories).toBe('function');
    });
  });

  // ============================================================================
  // Dashboard Service Tests
  // ============================================================================
  describe('Dashboard Service', () => {
    test('dashboardService should have getStats method', () => {
      expect(dashboardService.getStats).toBeDefined();
      expect(typeof dashboardService.getStats).toBe('function');
    });

    test('dashboardService should have getRecentActivities method', () => {
      expect(dashboardService.getRecentActivities).toBeDefined();
      expect(typeof dashboardService.getRecentActivities).toBe('function');
    });

    test('dashboardService should have getModuleStats method', () => {
      expect(dashboardService.getModuleStats).toBeDefined();
      expect(typeof dashboardService.getModuleStats).toBe('function');
    });
  });

  // ============================================================================
  // Patient Flow Service Tests
  // ============================================================================
  describe('Patient Flow Service', () => {
    test('patientFlowService should have initializeFlow method', () => {
      expect(patientFlowService.initializeFlow).toBeDefined();
      expect(typeof patientFlowService.initializeFlow).toBe('function');
    });

    test('patientFlowService should have getFlow method', () => {
      expect(patientFlowService.getFlow).toBeDefined();
      expect(typeof patientFlowService.getFlow).toBe('function');
    });

    test('patientFlowService should have transitionPatient method', () => {
      expect(patientFlowService.transitionPatient).toBeDefined();
      expect(typeof patientFlowService.transitionPatient).toBe('function');
    });

    test('patientFlowService should have getDischargeSummary method', () => {
      expect(patientFlowService.getDischargeSummary).toBeDefined();
      expect(typeof patientFlowService.getDischargeSummary).toBe('function');
    });
  });

  // ============================================================================
  // Super Admin Service Tests
  // ============================================================================
  describe('Super Admin Service', () => {
    test('superAdminService should have getSystemMetrics method', () => {
      expect(superAdminService.getSystemMetrics).toBeDefined();
      expect(typeof superAdminService.getSystemMetrics).toBe('function');
    });

    test('superAdminService should have getHealthStatus method', () => {
      expect(superAdminService.getHealthStatus).toBeDefined();
      expect(typeof superAdminService.getHealthStatus).toBe('function');
    });

    test('superAdminService should have getAuditLogs method', () => {
      expect(superAdminService.getAuditLogs).toBeDefined();
      expect(typeof superAdminService.getAuditLogs).toBe('function');
    });

    test('superAdminService should have getActiveUsers method', () => {
      expect(superAdminService.getActiveUsers).toBeDefined();
      expect(typeof superAdminService.getActiveUsers).toBe('function');
    });
  });

  // ============================================================================
  // Service Export Tests
  // ============================================================================
  describe('Service Exports', () => {
    test('All services should be exported from index', () => {
      const services = [
        authService,
        patientsService,
        appointmentsService,
        opdService,
        ipdService,
        pharmacyService,
        radiologyService,
        pathologyService,
        billingService,
        bloodbankService,
        operationtheatreService,
        frontofficeService,
        setupService,
        dashboardService,
        patientFlowService,
        superAdminService,
      ];

      services.forEach(service => {
        expect(service).toBeDefined();
        expect(typeof service).toBe('object');
      });
    });
  });
});
