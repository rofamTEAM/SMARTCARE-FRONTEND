'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  UserCog,
  Activity,
  BarChart3,
  HelpCircle,
  Settings,
  FileText,
  Search,
  Plus,
  Bell,
  LogOut,
  Shield,
  ShieldAlert,
  Stethoscope,
  Pill,
  FlaskConical,
  Heart,
  Package,
  User,
  ClipboardList,
  Bot,
  TrendingUp,
  TrendingDown,
  Car,
  MessageSquare,
  Building,
  DollarSign,
  Clock,
  Bed,
  Zap,
  GitBranch,
  Database,
  Key,
  Menu,
  ChevronLeft,
  CheckSquare,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { NewDashboard } from './NewDashboard';
import { RealDataUserDashboard } from './RealDataUserDashboard';
import { ReceptionistDashboard } from './ReceptionistDashboard';
import { LabTechDashboard } from './LabTechDashboard';
import { LabInvoiceGenerator } from './LabInvoiceGenerator';
import { LabResultsEntry } from './LabResultsEntry';
import { TestQueueManagement } from './TestQueueManagement';
import { SpecimenTracking } from './SpecimenTracking';
import { PatientsPage } from './PatientsPage';
import { AppointmentsPage } from './AppointmentsPage';
import { PaymentsPage } from './PaymentsPage';
import { EmployeePageNew } from './EmployeePageNew';
import { StatisticsPage } from './StatisticsPage';
import { UserManagement } from './UserManagement';
import { DoctorManagement } from './DoctorManagement';
import { DoctorPortal } from './DoctorPortal';
import { PharmacyManagement } from './PharmacyManagement';
import { LaboratoryManagement } from './LaboratoryManagement';
import { NursingStation } from './NursingStation';
import { ProfileEdit } from './ProfileEdit';
import { FrontOffice } from './FrontOffice';
import { AccessDenied } from './AccessDenied';
import { NotificationsPanel } from './NotificationsPanel';
import { WorkflowManagement } from './WorkflowManagement';
import { OutpatientManagement } from './OutpatientManagement';
import { InpatientManagement } from './InpatientManagement';
import { AdminDashboard } from './AdminDashboard';
import { ActivityPage } from './ActivityPage';
import { HelpCenter } from './HelpCenter';
import { SettingsPage } from './SettingsPage';
import { ReportsPage } from './ReportsPage';
import { ThemeToggle } from './ThemeToggle';
import { ThemeSelector } from './ThemeSelector';
import { FloatingAIButton } from './FloatingAIButtonRobust';
import { NavbarAIChat } from './NavbarAIChat';
import { BloodBankManagement } from './BloodBankManagement';
import { MedicalRecordsManagement } from './MedicalRecordsManagement';
import { ExpenseManagement } from './ExpenseManagement';
import { IncomeManagement } from './IncomeManagement';
import { VehicleManagement } from './VehicleManagement';
import { ComplaintManagement } from './ComplaintManagement';
import { SystemSettings } from './SystemSettings';
import { SuperAdminSettings } from './SuperAdminSettings';
import { OPDReport } from './OPDReport';
import { TodoList } from './TodoList';
import { BedManagement } from './BedManagementNew';
import { EmergencyManagement } from './EmergencyManagement';
import { PatientWorkflowManagement } from './PatientWorkflowManagement';
import { InventoryManagement } from './InventoryManagementNew';
import { SetupModule } from './SetupModule';
import { 
  DepartmentManagement, 
  PayrollManagement, 
  AttendanceManagement, 
  RadiologyManagement, 
  OperationTheatreManagement, 
  BackupManagement, 
  ChangePassword 
} from './SuperAdminComponentsNew';
import { useThemeInitialization } from '../hooks/useThemeInitialization';
import { ErrorBoundary } from './ErrorBoundary';

type TabType = 'dashboard' | 'patients' | 'search-patients' | 'appointments' | 'payments' | 'employee' | 'activity' | 'statistics' | 'help' | 'settings' | 'reports' | 'users' | 'doctors' | 'doctor-portal' | 'pharmacy' | 'laboratory' | 'nursing' | 'inventory' | 'front-office' | 'workflow' | 'super-admin' | 'outpatient' | 'inpatient' | 'lab-invoice' | 'lab-results' | 'test-queue' | 'specimen-tracking' | 'ai-assistant' | 'blood-bank' | 'medical-records' | 'bed-management' | 'emergency' | 'expense-management' | 'income-management' | 'vehicle-management' | 'complaint-management' | 'system-settings' | 'super-admin-settings' | 'opd-report' | 'todo-list' | 'gynecology' | 'departments' | 'payroll' | 'attendance' | 'visitors' | 'queue-management' | 'pathology' | 'radiology' | 'ambulance' | 'operation-theatre' | 'billing' | 'workflows' | 'backup' | 'change-password' | 'setup';

interface MainAppProps {
  user: any;
  onLogout: () => void;
}

export function MainApp({ user, onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize theme system
  useThemeInitialization();

  // Set sidebar state after mount to avoid SSR hydration mismatch
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarCollapsed(true);
  }, []);

  // Auto-redirect based on user role on initial load
  useEffect(() => {
    const userRole = user?.role?.toLowerCase() || 'user';
    
    // Only redirect if we're on the default dashboard tab
    if (activeTab === 'dashboard') {
      switch (userRole) {
        case 'doctor':
          setActiveTab('doctor-portal');
          break;
        case 'nurse':
          setActiveTab('nursing');
          break;
        case 'pharmacist':
          setActiveTab('pharmacy');
          break;
        case 'lab_technician':
          setActiveTab('laboratory');
          break;
        case 'receptionist':
          setActiveTab('dashboard'); // Receptionist dashboard is already set
          break;
        case 'admin':
        case 'super_admin':
          setActiveTab('dashboard'); // Admin dashboard is already set
          break;
        case 'user':
        default:
          setActiveTab('dashboard'); // User dashboard is already set
          break;
      }
    }
  }, []); // Only run once on mount

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => onLogout();

  const userName = user?.name || user?.email || 'User';
  const userRole = user?.role || 'user';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const isSuperAdmin = userRole === 'super_admin';

  const hasAccess = (roles: string[]) => isSuperAdmin || roles.includes(userRole);

  const getPageRoles = (tab: TabType): string[] => {
    return regularMenuItems.find(m => m.id === tab)?.roles || [];
  };

  const renderPage = () => {
    const pageRoles = getPageRoles(activeTab);
    
    if (!hasAccess(pageRoles)) {
      return <AccessDenied userRole={userRole} requiredRoles={pageRoles} onGoBack={() => setActiveTab('dashboard')} />;
    }

    switch (activeTab) {
      case 'dashboard': 
        return isSuperAdmin ? <AdminDashboard session={user} /> : 
               userRole === 'receptionist' ? <ReceptionistDashboard session={user} /> : 
               userRole === 'lab_technician' ? <LabTechDashboard session={user} onNavigate={(tab) => setActiveTab(tab as TabType)} /> :
               userRole === 'user' ? <RealDataUserDashboard session={user} /> :
               <NewDashboard session={user} />;
      case 'workflow': return <PatientWorkflowManagement session={user} />;
      case 'outpatient': return <OutpatientManagement session={user} />;
      case 'inpatient': return <InpatientManagement session={user} />;
      case 'front-office': return <FrontOffice session={user} />;
      case 'patients': return <PatientsPage session={user} />;
      case 'appointments': return <AppointmentsPage session={user} />;
      case 'payments': return <PaymentsPage session={user} />;
      case 'employee': return <EmployeePageNew session={user} />;
      case 'statistics': return <StatisticsPage session={user} />;
      case 'users': return <UserManagement session={user} />;
      case 'doctors': return <DoctorManagement />;
      case 'doctor-portal': return <DoctorPortal session={user} />;
      case 'pharmacy': return <PharmacyManagement />;
      case 'laboratory': return <LaboratoryManagement />;
      case 'nursing': return <NursingStation />;
      case 'inventory': return <InventoryManagement session={user} />;
      case 'activity': return <ActivityPage />;
      case 'help': return <HelpCenter />;
      case 'settings': return <SettingsPage />;
      case 'reports': return <ReportsPage />;
      case 'lab-invoice': return <LabInvoiceGenerator />;
      case 'lab-results': return <LabResultsEntry />;
      case 'test-queue': return <TestQueueManagement />;
      case 'specimen-tracking': return <SpecimenTracking />;
      case 'blood-bank': return <BloodBankManagement session={user} />;
      case 'medical-records': return <MedicalRecordsManagement session={user} />;
      case 'bed-management': return <BedManagement session={user} />;
      case 'emergency': return <EmergencyManagement session={user} />;
      case 'expense-management': return <ExpenseManagement session={user} />;
      case 'income-management': return <IncomeManagement session={user} />;
      case 'vehicle-management': return <VehicleManagement session={user} />;
      case 'complaint-management': return <ComplaintManagement session={user} />;
      case 'system-settings': return isSuperAdmin ? <SuperAdminSettings /> : <SystemSettings session={user} />;
      case 'opd-report': return <OPDReport />;
      case 'todo-list': return <TodoList session={user} />;
      case 'setup': return <SetupModule session={user} />;
      default: return <NewDashboard session={user} />;
    }
  };

  const superAdminMenuItems = [
    // Core Dashboard
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'core' },
    
    // Patient Management (merged)
    { id: 'patients', label: 'Patient Records', icon: Users, category: 'patients' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, category: 'patients' },
    { id: 'workflow', label: 'Patient Workflow', icon: Activity, category: 'patients' },
    
    // Staff Management (merged)
    { id: 'doctors', label: 'Doctors', icon: Stethoscope, category: 'staff' },
    { id: 'employee', label: 'Staff & HR', icon: UserCog, category: 'staff' },
    { id: 'departments', label: 'Departments', icon: Building, category: 'staff' },
    
    // Patient Care (merged)
    { id: 'inpatient', label: 'IPD Management', icon: Bed, category: 'care' },
    { id: 'outpatient', label: 'OPD Management', icon: User, category: 'care' },
    { id: 'emergency', label: 'Emergency', icon: ShieldAlert, category: 'care' },
    { id: 'bed-management', label: 'Bed & Queue', icon: Package, category: 'care' },
    
    // Medical Services (merged)
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill, category: 'medical' },
    { id: 'laboratory', label: 'Lab & Pathology', icon: FlaskConical, category: 'medical' },
    { id: 'radiology', label: 'Radiology', icon: Zap, category: 'medical' },
    { id: 'blood-bank', label: 'Blood Bank', icon: Heart, category: 'medical' },
    { id: 'vehicle-management', label: 'Ambulance & Vehicles', icon: Car, category: 'medical' },
    { id: 'operation-theatre', label: 'Operation Theatre', icon: Activity, category: 'medical' },
    
    // Financial Management (merged)
    { id: 'payments', label: 'Billing & Payments', icon: CreditCard, category: 'finance' },
    { id: 'expense-management', label: 'Financial Reports', icon: TrendingUp, category: 'finance' },
    
    // System Administration (merged)
    { id: 'users', label: 'User Management', icon: Shield, category: 'admin' },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText, category: 'admin' },
    { id: 'opd-report', label: 'OPD Report', icon: FileText, category: 'admin' },
    { id: 'todo-list', label: 'To Do List', icon: CheckSquare, category: 'admin' },
    { id: 'system-settings', label: 'System Settings', icon: Settings, category: 'admin' },
    { id: 'setup', label: 'Setup', icon: Settings, category: 'admin' },
  ];

  const regularMenuItems = [
    // Core Hospital Operations
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['user', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'receptionist', 'admin', 'super_admin'] },
    { id: 'emergency', label: 'Emergency', icon: ShieldAlert, roles: ['doctor', 'nurse', 'receptionist', 'admin', 'super_admin'] },
    { id: 'front-office', label: 'Front Office', icon: ClipboardList, roles: ['receptionist', 'admin', 'super_admin'] },
    
    // Patient Management
    { id: 'patients', label: 'Patients', icon: Users, roles: ['doctor', 'nurse', 'receptionist', 'admin', 'super_admin'] },
    { id: 'appointments', label: 'Appointments', icon: Calendar, roles: ['doctor', 'nurse', 'receptionist', 'admin', 'super_admin'] },
    { id: 'workflow', label: 'Patient Workflow', icon: Activity, roles: ['doctor', 'nurse', 'pharmacist', 'lab_technician', 'receptionist', 'admin', 'super_admin'] },
    { id: 'outpatient', label: 'Outpatient (OPD)', icon: User, roles: ['doctor', 'nurse', 'receptionist', 'admin', 'super_admin'] },
    { id: 'inpatient', label: 'Inpatient (IPD)', icon: Users, roles: ['doctor', 'nurse', 'admin', 'super_admin'] },
    
    // Medical Services
    { id: 'doctor-portal', label: 'Doctor Portal', icon: Stethoscope, roles: ['doctor', 'admin', 'super_admin'] },
    { id: 'nursing', label: 'Nursing Station', icon: Heart, roles: ['nurse', 'admin', 'super_admin'] },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill, roles: ['pharmacist', 'admin', 'super_admin'] },
    { id: 'laboratory', label: 'Laboratory', icon: FlaskConical, roles: ['lab_technician', 'doctor', 'admin', 'super_admin'] },
    { id: 'blood-bank', label: 'Blood Bank', icon: Heart, roles: ['lab_technician', 'doctor', 'nurse', 'admin', 'super_admin'] },
    { id: 'medical-records', label: 'Medical Records', icon: FileText, roles: ['doctor', 'nurse', 'admin', 'super_admin'] },
    
    // Hospital Resources
    { id: 'bed-management', label: 'Bed Management', icon: Package, roles: ['nurse', 'receptionist', 'admin', 'super_admin'] },
    { id: 'inventory', label: 'Inventory', icon: Package, roles: ['pharmacist', 'nurse', 'admin', 'super_admin'] },
    { id: 'vehicle-management', label: 'Ambulance & Vehicles', icon: Car, roles: ['admin', 'super_admin'] },
    
    // Financial Management
    { id: 'payments', label: 'Billing & Payments', icon: CreditCard, roles: ['receptionist', 'admin', 'super_admin'] },
    { id: 'expense-management', label: 'Expenses', icon: TrendingUp, roles: ['admin', 'super_admin'] },
    { id: 'income-management', label: 'Income', icon: TrendingUp, roles: ['admin', 'super_admin'] },
    
    // Staff Management
    { id: 'employee', label: 'Staff Management', icon: UserCog, roles: ['admin', 'super_admin'] },
    { id: 'users', label: 'User Accounts', icon: Shield, roles: ['admin', 'super_admin'] },
    
    // Reports & Analytics
    { id: 'statistics', label: 'Statistics', icon: BarChart3, roles: ['admin', 'super_admin'] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['admin', 'super_admin'] },
    { id: 'activity', label: 'Activity Logs', icon: Activity, roles: ['admin', 'super_admin'] },
    
    // Support & Tools
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, roles: ['user', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'receptionist', 'admin', 'super_admin'] },
    { id: 'complaint-management', label: 'Complaints', icon: MessageSquare, roles: ['admin', 'super_admin', 'receptionist'] },
    { id: 'help', label: 'Help Center', icon: HelpCircle, roles: ['user', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'receptionist', 'admin', 'super_admin'] },
    
    // System Administration
    { id: 'system-settings', label: 'System Settings', icon: Settings, roles: ['super_admin'] },
    { id: 'settings', label: 'General Settings', icon: Settings, roles: ['admin', 'super_admin'] },
  ];

  // Use single menu for all users
  const menuItems = isSuperAdmin ? superAdminMenuItems : regularMenuItems.filter((item) => {
    if (userRole === 'user') {
      return ['dashboard', 'help'].includes(item.id);
    }
    return item.roles.includes(userRole);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } bg-sidebar border-r border-sidebar-border text-sidebar-foreground fixed top-0 left-0 h-screen overflow-y-auto transition-all duration-300 ease-in-out z-30 ${
        mobileMenuOpen ? 'block md:block' : 'hidden md:block'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Activity className="size-6 text-primary flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-xl font-semibold text-sidebar-foreground">SmartCare</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileMenuOpen(!mobileMenuOpen);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto pb-4">
          <div className={`${sidebarCollapsed ? 'px-2' : 'px-4'} py-6`}>
            {isSuperAdmin ? (
              // Super Admin Single Menu
              <>
                {!sidebarCollapsed && (
                  <p className="text-xs text-sidebar-foreground/60 mb-3 px-2">HOSPITAL MANAGEMENT</p>
                )}
                <nav className="space-y-1">
                  {superAdminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveTab(item.id as TabType);
                          if (window.innerWidth < 768) {
                            setMobileMenuOpen(false);
                          }
                        }}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-sidebar-accent text-primary shadow-sm'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        }`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className="size-5 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <span className="text-sm">{item.label}</span>
                        )}
                      </motion.button>
                    );
                  })}
                </nav>
              </>
            ) : (
              // Regular User Menu
              <>
                {!sidebarCollapsed && (
                  <p className="text-xs text-sidebar-foreground/60 mb-3 px-2">HOSPITAL MANAGEMENT</p>
                )}
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setActiveTab(item.id as TabType);
                          if (window.innerWidth < 768) {
                            setMobileMenuOpen(false);
                          }
                        }}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-sidebar-accent text-primary shadow-sm'
                            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        }`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className="size-5 flex-shrink-0" />
                        {!sidebarCollapsed && (
                          <span className="text-sm">{item.label}</span>
                        )}
                      </motion.button>
                    );
                  })}
                </nav>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 ease-in-out md:block hidden`}>
        {/* Header */}
        <header className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Desktop Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-5" />
                <Input
                  type="search"
                  placeholder="Search here..."
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {isSuperAdmin && <ThemeSelector />}
              <ThemeToggle />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAiChatOpen(!aiChatOpen)}
                className="relative bg-card border border-border hover:bg-accent h-9 w-9"
                title="AI Assistant"
              >
                <Bot className="size-4 sm:size-5" />
                {!aiChatOpen && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </Button>

              <NotificationsPanel />

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right">
                  <p className="text-sm text-foreground">{userName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full glass-bg ${
                    userRole === 'super_admin' 
                      ? 'text-destructive' 
                      : userRole === 'admin'
                      ? 'text-primary'
                      : 'text-primary'
                  }`}>
                    {userRole === 'super_admin' ? 'Super Admin' 
                      : userRole === 'admin' ? 'Admin'
                      : userRole === 'doctor' ? 'Doctor'
                      : userRole === 'nurse' ? 'Nurse'
                      : userRole === 'pharmacist' ? 'Pharmacist'
                      : userRole === 'lab_technician' ? 'Lab Technician'
                      : userRole === 'receptionist' ? 'Receptionist'
                      : 'User'}
                  </span>
                </div>
                <button
                  onClick={() => setProfileEditOpen(true)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer text-sm sm:text-base"
                  title="Edit Profile"
                >
                  {userName.charAt(0).toUpperCase()}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 hover:bg-accent rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="size-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="overflow-y-auto p-4 sm:p-6 lg:p-8">
          <ErrorBoundary>
            {renderPage()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="h-9 w-9"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {isSuperAdmin && <ThemeSelector />}
              <ThemeToggle />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAiChatOpen(!aiChatOpen)}
                className="relative bg-card border border-border hover:bg-accent h-9 w-9"
                title="AI Assistant"
              >
                <Bot className="size-4 sm:size-5" />
                {!aiChatOpen && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </Button>

              <NotificationsPanel />

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setProfileEditOpen(true)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer text-sm sm:text-base"
                  title="Edit Profile"
                >
                  {userName.charAt(0).toUpperCase()}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 hover:bg-accent rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="size-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                type="search"
                placeholder="Search here..."
                className="pl-10 bg-background border-border h-9 text-sm"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ErrorBoundary>
            {renderPage()}
          </ErrorBoundary>
        </main>
      </div>

      <ProfileEdit
        open={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        session={user}
      />

      <FloatingAIButton currentPage={activeTab} userRole={userRole} />

      <NavbarAIChat 
        session={user} 
        isOpen={aiChatOpen} 
        onClose={() => setAiChatOpen(false)} 
      />
    </div>
  );
}
