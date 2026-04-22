import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Stethoscope,
  FlaskConical,
  Pill,
  Receipt,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  FileText,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  registrationDate: string;
  status: 'registered' | 'scheduled' | 'checked-in' | 'in-consultation' | 'lab-ordered' | 'lab-completed' | 'prescription-created' | 'medication-dispensed' | 'billed' | 'completed';
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed';
}

interface Consultation {
  id: string;
  patientId: string;
  doctorName: string;
  diagnosis: string;
  notes: string;
  prescriptions: string[];
  labTests: string[];
  date: string;
}

interface LabTest {
  id: string;
  patientId: string;
  patientName: string;
  testType: string;
  orderedBy: string;
  status: 'ordered' | 'sample-collected' | 'in-progress' | 'completed' | 'reviewed';
  results?: string;
  date: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  medications: string[];
  status: 'created' | 'dispensed';
  date: string;
}

interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  services: string[];
  amount: number;
  status: 'generated' | 'paid';
  date: string;
}

interface WorkflowManagementProps {
  session: any;
}

export function WorkflowManagement({ session }: WorkflowManagementProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'register' | 'schedule' | 'checkin' | 'consult' | 'lab' | 'prescription' | 'billing'>('register');
  const [formData, setFormData] = useState<any>({});

  const userRole = session?.role || 'user';

  // Initialize with sample data
  useEffect(() => {
    const samplePatients: Patient[] = [
      {
        id: '1',
        name: 'John Smith',
        age: 45,
        phone: '555-0123',
        email: 'john.smith@email.com',
        registrationDate: '2024-12-08',
        status: 'registered'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        age: 32,
        phone: '555-0124',
        email: 'sarah.johnson@email.com',
        registrationDate: '2024-12-08',
        status: 'scheduled'
      }
    ];
    setPatients(samplePatients);
  }, []);

  const getWorkflowSteps = () => [
    { id: 'registered', label: 'Patient Registered', icon: Users, role: 'receptionist' },
    { id: 'scheduled', label: 'Appointment Scheduled', icon: Calendar, role: 'receptionist' },
    { id: 'checked-in', label: 'Patient Checked In', icon: CheckCircle, role: 'receptionist' },
    { id: 'in-consultation', label: 'Doctor Consultation', icon: Stethoscope, role: 'doctor' },
    { id: 'lab-ordered', label: 'Lab Tests Ordered', icon: FlaskConical, role: 'doctor' },
    { id: 'lab-completed', label: 'Lab Results Ready', icon: FileText, role: 'lab_technician' },
    { id: 'prescription-created', label: 'Prescription Created', icon: Pill, role: 'doctor' },
    { id: 'medication-dispensed', label: 'Medication Dispensed', icon: Pill, role: 'pharmacist' },
    { id: 'billed', label: 'Bill Generated', icon: Receipt, role: 'receptionist' },
    { id: 'completed', label: 'Process Complete', icon: CheckCircle, role: 'all' }
  ];

  const canPerformAction = (requiredRole: string) => {
    if (requiredRole === 'all') return true;
    return userRole === requiredRole || userRole === 'admin' || userRole === 'super_admin';
  };

  const getNextAction = (patient: Patient) => {
    const steps = getWorkflowSteps();
    const currentIndex = steps.findIndex(step => step.id === patient.status);
    if (currentIndex < steps.length - 1) {
      return steps[currentIndex + 1];
    }
    return null;
  };

  const handleRegisterPatient = () => {
    const newPatient: Patient = {
      id: Date.now().toString(),
      name: formData.name || '',
      age: formData.age || 0,
      phone: formData.phone || '',
      email: formData.email || '',
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'registered'
    };
    setPatients([...patients, newPatient]);
    setFormData({});
    setIsModalOpen(false);
  };

  const handleScheduleAppointment = () => {
    if (!selectedPatient) return;
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorName: formData.doctorName || '',
      department: formData.department || '',
      date: formData.date || '',
      time: formData.time || '',
      status: 'scheduled'
    };
    
    setAppointments([...appointments, newAppointment]);
    updatePatientStatus(selectedPatient.id, 'scheduled');
    setFormData({});
    setIsModalOpen(false);
  };

  const handleCheckIn = (patientId: string) => {
    updatePatientStatus(patientId, 'checked-in');
    setAppointments(appointments.map(apt => 
      apt.patientId === patientId ? { ...apt, status: 'checked-in' } : apt
    ));
  };

  const handleStartConsultation = (patientId: string) => {
    updatePatientStatus(patientId, 'in-consultation');
    setAppointments(appointments.map(apt => 
      apt.patientId === patientId ? { ...apt, status: 'in-progress' } : apt
    ));
  };

  const handleCreateConsultation = () => {
    if (!selectedPatient) return;
    
    const newConsultation: Consultation = {
      id: Date.now().toString(),
      patientId: selectedPatient.id,
      doctorName: formData.doctorName || '',
      diagnosis: formData.diagnosis || '',
      notes: formData.notes || '',
      prescriptions: formData.prescriptions || [],
      labTests: formData.labTests || [],
      date: new Date().toISOString().split('T')[0]
    };
    
    setConsultations([...consultations, newConsultation]);
    
    // Create lab tests if ordered
    if (formData.labTests && formData.labTests.length > 0) {
      const newLabTests = formData.labTests.map((test: string) => ({
        id: Date.now().toString() + Math.random(),
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        testType: test,
        orderedBy: formData.doctorName || '',
        status: 'ordered' as const,
        date: new Date().toISOString().split('T')[0]
      }));
      setLabTests([...labTests, ...newLabTests]);
      updatePatientStatus(selectedPatient.id, 'lab-ordered');
    } else {
      // Create prescription if no lab tests
      if (formData.prescriptions && formData.prescriptions.length > 0) {
        const newPrescription: Prescription = {
          id: Date.now().toString(),
          patientId: selectedPatient.id,
          patientName: selectedPatient.name,
          doctorName: formData.doctorName || '',
          medications: formData.prescriptions,
          status: 'created',
          date: new Date().toISOString().split('T')[0]
        };
        setPrescriptions([...prescriptions, newPrescription]);
        updatePatientStatus(selectedPatient.id, 'prescription-created');
      }
    }
    
    setFormData({});
    setIsModalOpen(false);
  };

  const handleLabTestComplete = (testId: string) => {
    setLabTests(labTests.map(test => 
      test.id === testId ? { ...test, status: 'completed' } : test
    ));
    
    const test = labTests.find(t => t.id === testId);
    if (test) {
      const patientTests = labTests.filter(t => t.patientId === test.patientId);
      const allCompleted = patientTests.every(t => t.id === testId || t.status === 'completed');
      
      if (allCompleted) {
        updatePatientStatus(test.patientId, 'lab-completed');
      }
    }
  };

  const handleCreatePrescription = () => {
    if (!selectedPatient) return;
    
    const newPrescription: Prescription = {
      id: Date.now().toString(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorName: formData.doctorName || '',
      medications: formData.medications || [],
      status: 'created',
      date: new Date().toISOString().split('T')[0]
    };
    
    setPrescriptions([...prescriptions, newPrescription]);
    updatePatientStatus(selectedPatient.id, 'prescription-created');
    setFormData({});
    setIsModalOpen(false);
  };

  const handleDispenseMedication = (prescriptionId: string) => {
    setPrescriptions(prescriptions.map(p => 
      p.id === prescriptionId ? { ...p, status: 'dispensed' } : p
    ));
    
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      updatePatientStatus(prescription.patientId, 'medication-dispensed');
    }
  };

  const handleGenerateBill = () => {
    if (!selectedPatient) return;
    
    const newBill: Bill = {
      id: Date.now().toString(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      services: formData.services || [],
      amount: formData.amount || 0,
      status: 'generated',
      date: new Date().toISOString().split('T')[0]
    };
    
    setBills([...bills, newBill]);
    updatePatientStatus(selectedPatient.id, 'billed');
    setFormData({});
    setIsModalOpen(false);
  };

  const handlePayment = (billId: string) => {
    setBills(bills.map(b => 
      b.id === billId ? { ...b, status: 'paid' } : b
    ));
    
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      updatePatientStatus(bill.patientId, 'completed');
    }
  };

  const updatePatientStatus = (patientId: string, status: Patient['status']) => {
    setPatients(patients.map(p => 
      p.id === patientId ? { ...p, status } : p
    ));
  };

  const openModal = (type: typeof modalType, patient?: Patient) => {
    setModalType(type);
    setSelectedPatient(patient || null);
    setFormData({});
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'registered': 'bg-blue-100 text-primary',
      'scheduled': 'bg-purple-100 text-primary',
      'checked-in': 'bg-green-100 text-primary',
      'in-consultation': 'bg-yellow-100 text-yellow-700',
      'lab-ordered': 'bg-orange-100 text-primary',
      'lab-completed': 'bg-teal-100 text-primary',
      'prescription-created': 'bg-indigo-100 text-primary',
      'medication-dispensed': 'bg-pink-100 text-pink-700',
      'billed': 'bg-red-100 text-destructive',
      'completed': 'bg-green-100 text-primary'
    };
    return colors[status] || 'bg-muted text-foreground';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900">Hospital Workflow Management</h1>
          <p className="text-muted-foreground">Complete patient journey from registration to billing</p>
        </div>
        {canPerformAction('receptionist') && (
          <Button onClick={() => openModal('register')} className="bg-primary hover:bg-primary/90">
            <Users className="size-4 mr-2" />
            Register Patient
          </Button>
        )}
      </div>

      <Tabs defaultValue="workflow" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflow">Patient Workflow</TabsTrigger>
          <TabsTrigger value="queue">Current Queue</TabsTrigger>
          <TabsTrigger value="lab">Lab Tests</TabsTrigger>
          <TabsTrigger value="pharmacy">Prescriptions</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-4">
          <div className="grid gap-4">
            {patients.map((patient) => {
              const nextAction = getNextAction(patient);
              return (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-card-foreground">
                        <User className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-lg text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">Age: {patient.age} | Phone: {patient.phone}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(patient.status)}>
                      {patient.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-4 overflow-x-auto">
                    {getWorkflowSteps().map((step, index) => {
                      const isCompleted = getWorkflowSteps().findIndex(s => s.id === patient.status) >= index;
                      const isCurrent = step.id === patient.status;
                      const Icon = step.icon;
                      
                      return (
                        <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-primary text-card-foreground' : 
                            isCurrent ? 'bg-primary text-card-foreground' : 
                            'bg-muted text-muted-foreground'
                          }`}>
                            <Icon className="size-4" />
                          </div>
                          {index < getWorkflowSteps().length - 1 && (
                            <ArrowRight className="size-4 text-muted-foreground" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {nextAction && canPerformAction(nextAction.role) && (
                    <div className="flex gap-2">
                      {nextAction.id === 'scheduled' && (
                        <Button size="sm" onClick={() => openModal('schedule', patient)}>
                          Schedule Appointment
                        </Button>
                      )}
                      {nextAction.id === 'checked-in' && (
                        <Button size="sm" onClick={() => handleCheckIn(patient.id)}>
                          Check In Patient
                        </Button>
                      )}
                      {nextAction.id === 'in-consultation' && (
                        <Button size="sm" onClick={() => handleStartConsultation(patient.id)}>
                          Start Consultation
                        </Button>
                      )}
                      {patient.status === 'in-consultation' && (
                        <Button size="sm" onClick={() => openModal('consult', patient)}>
                          Complete Consultation
                        </Button>
                      )}
                      {patient.status === 'lab-completed' && (
                        <Button size="sm" onClick={() => openModal('prescription', patient)}>
                          Create Prescription
                        </Button>
                      )}
                      {patient.status === 'medication-dispensed' && (
                        <Button size="sm" onClick={() => openModal('billing', patient)}>
                          Generate Bill
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Patient Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.filter(apt => apt.status !== 'completed').map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.doctorName} - {appointment.department}</p>
                      <p className="text-xs text-muted-foreground">{appointment.date} at {appointment.time}</p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {labTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-gray-900">{test.patientName}</p>
                      <p className="text-sm text-muted-foreground">{test.testType}</p>
                      <p className="text-xs text-muted-foreground">Ordered by: {test.orderedBy}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                      {test.status === 'ordered' && canPerformAction('lab_technician') && (
                        <Button size="sm" onClick={() => handleLabTestComplete(test.id)}>
                          Complete Test
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pharmacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-gray-900">{prescription.patientName}</p>
                      <p className="text-sm text-muted-foreground">Dr. {prescription.doctorName}</p>
                      <p className="text-xs text-muted-foreground">Medications: {prescription.medications.join(', ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(prescription.status)}>
                        {prescription.status}
                      </Badge>
                      {prescription.status === 'created' && canPerformAction('pharmacist') && (
                        <Button size="sm" onClick={() => handleDispenseMedication(prescription.id)}>
                          Dispense
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bills & Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-gray-900">{bill.patientName}</p>
                      <p className="text-sm text-muted-foreground">Services: {bill.services.join(', ')}</p>
                      <p className="text-sm text-gray-900">Amount: ${bill.amount}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(bill.status)}>
                        {bill.status}
                      </Badge>
                      {bill.status === 'generated' && canPerformAction('receptionist') && (
                        <Button size="sm" onClick={() => handlePayment(bill.id)}>
                          Collect Payment
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal for various actions */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'register' && 'Register New Patient'}
              {modalType === 'schedule' && 'Schedule Appointment'}
              {modalType === 'consult' && 'Complete Consultation'}
              {modalType === 'prescription' && 'Create Prescription'}
              {modalType === 'billing' && 'Generate Bill'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {modalType === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patient Name</Label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      placeholder="Age"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email address"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleRegisterPatient}>Register Patient</Button>
                </div>
              </>
            )}

            {modalType === 'schedule' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Doctor Name</Label>
                    <Input
                      value={formData.doctorName || ''}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      placeholder="Doctor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <select
                      value={formData.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md"
                    >
                      <option value="">Select Department</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={formData.time || ''}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleScheduleAppointment}>Schedule</Button>
                </div>
              </>
            )}

            {modalType === 'consult' && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Doctor Name</Label>
                    <Input
                      value={formData.doctorName || ''}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      placeholder="Doctor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Diagnosis</Label>
                    <Input
                      value={formData.diagnosis || ''}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      placeholder="Primary diagnosis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Consultation notes"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lab Tests (comma separated)</Label>
                    <Input
                      value={formData.labTests?.join(', ') || ''}
                      onChange={(e) => setFormData({ ...formData, labTests: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                      placeholder="Blood Test, X-Ray, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prescriptions (comma separated)</Label>
                    <Input
                      value={formData.prescriptions?.join(', ') || ''}
                      onChange={(e) => setFormData({ ...formData, prescriptions: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                      placeholder="Medication names"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateConsultation}>Complete Consultation</Button>
                </div>
              </>
            )}

            {modalType === 'prescription' && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Doctor Name</Label>
                    <Input
                      value={formData.doctorName || ''}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      placeholder="Doctor name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Medications (comma separated)</Label>
                    <Textarea
                      value={formData.medications?.join(', ') || ''}
                      onChange={(e) => setFormData({ ...formData, medications: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                      placeholder="Medication names with dosage"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreatePrescription}>Create Prescription</Button>
                </div>
              </>
            )}

            {modalType === 'billing' && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Services (comma separated)</Label>
                    <Textarea
                      value={formData.services?.join(', ') || ''}
                      onChange={(e) => setFormData({ ...formData, services: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                      placeholder="Consultation, Lab Tests, Medications, etc."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Amount ($)</Label>
                    <Input
                      type="number"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleGenerateBill}>Generate Bill</Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

