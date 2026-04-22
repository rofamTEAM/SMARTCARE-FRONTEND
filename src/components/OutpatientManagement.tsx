import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Clock,
  FileText,
  Search,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { opdApi } from '../utils/api';
import { VoiceAgent } from './VoiceAgent';

interface OutpatientAppointment {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'checked-in' | 'in-consultation' | 'completed' | 'cancelled';
  type: 'new' | 'follow-up';
  insurance: string;
  phone: string;
}

interface OutpatientConsultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  chiefComplaint: string;
  history: string;
  examination: string;
  assessment: string;
  plan: string;
  prescriptions: string[];
  labOrders: string[];
  followUp: string;
}

interface OutpatientManagementProps {
  session: any;
}

export function OutpatientManagement({ session }: OutpatientManagementProps) {
  const [appointments, setAppointments] = useState<OutpatientAppointment[]>([]);
  const [consultations, setConsultations] = useState<OutpatientConsultation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<OutpatientAppointment | null>(null);
  const [appointmentForm, setAppointmentForm] = useState<Partial<OutpatientAppointment>>({});
  const [consultationForm, setConsultationForm] = useState<Partial<OutpatientConsultation>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await opdApi.getAll();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    }
  };

  const stats = [
    { label: 'Today\'s Appointments', value: appointments.filter(a => a.appointmentDate === selectedDate).length, icon: Calendar, color: 'bg-primary' },
    { label: 'Checked In', value: appointments.filter(a => a.status === 'checked-in').length, icon: CheckCircle, color: 'bg-primary' },
    { label: 'In Consultation', value: appointments.filter(a => a.status === 'in-consultation').length, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Completed Today', value: appointments.filter(a => a.status === 'completed' && a.appointmentDate === selectedDate).length, icon: FileText, color: 'bg-primary' }
  ];

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckIn = (appointmentId: string) => {
    try {
      setAppointments(appointments.map(apt =>
        apt.id === appointmentId ? { ...apt, status: 'checked-in' } : apt
      ));
      toast.success('Patient checked in successfully!');
    } catch (error) {
      toast.error('Failed to check in patient. Please try again.');
    }
  };

  const handleStartConsultation = (appointment: OutpatientAppointment) => {
    try {
      setSelectedAppointment(appointment);
      setConsultationForm({
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        doctorName: appointment.doctorName,
        date: new Date().toISOString().split('T')[0]
      });
      setIsConsultationModalOpen(true);
      
      setAppointments(appointments.map(apt =>
        apt.id === appointment.id ? { ...apt, status: 'in-consultation' } : apt
      ));
      toast.success('Consultation started!');
    } catch (error) {
      toast.error('Failed to start consultation. Please try again.');
    }
  };

  const handleCompleteConsultation = async () => {
    if (!selectedAppointment) return;
    try {
      await opdApi.update(selectedAppointment.id, { status: 'completed', ...consultationForm });
      const newConsultation: OutpatientConsultation = {
        id: Date.now().toString(),
        ...consultationForm as OutpatientConsultation
      };
      setConsultations([...consultations, newConsultation]);
      setAppointments(appointments.map(apt =>
        apt.id === selectedAppointment.id ? { ...apt, status: 'completed' } : apt
      ));
      setIsConsultationModalOpen(false);
      setConsultationForm({});
      setSelectedAppointment(null);
      toast.success('Consultation completed successfully!');
    } catch (error) {
      toast.error('Failed to complete consultation. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-primary',
      'checked-in': 'bg-green-100 text-primary',
      'in-consultation': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-purple-100 text-primary',
      'cancelled': 'bg-red-100 text-destructive'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900">Outpatient Management</h1>
          <p className="text-muted-foreground">Manage outpatient appointments and consultations</p>
        </div>
        <div className="flex items-center gap-2">
          <VoiceAgent department="outpatient" userRole={session?.role || 'receptionist'} />
          <Button onClick={() => setIsAppointmentModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="size-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="size-6 text-card-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="queue">Queue Management</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Appointments</CardTitle>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      placeholder="Search appointments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1 grid grid-cols-6 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-sm text-gray-900">{appointment.appointmentTime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Patient</p>
                        <p className="text-sm text-gray-900">{appointment.patientName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Doctor</p>
                        <p className="text-sm text-gray-900">{appointment.doctorName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Department</p>
                        <p className="text-sm text-gray-900">{appointment.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <Badge variant="outline">{appointment.type}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === 'scheduled' && (
                        <Button size="sm" onClick={() => handleCheckIn(appointment.id)}>
                          Check In
                        </Button>
                      )}
                      {appointment.status === 'checked-in' && (
                        <Button size="sm" onClick={() => handleStartConsultation(appointment)}>
                          Start Consultation
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-900">{consultation.patientName}</h4>
                      <span className="text-sm text-muted-foreground">{consultation.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Doctor: {consultation.doctorName}</p>
                    <p className="text-sm text-foreground">Chief Complaint: {consultation.chiefComplaint}</p>
                  </div>
                ))}
                {consultations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No consultations recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.filter(a => a.status === 'checked-in' || a.status === 'in-consultation').map((appointment, index) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-card-foreground text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-gray-900">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.doctorName} - {appointment.department}</p>
                      </div>
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
      </Tabs>

      {/* New Appointment Modal */}
      <Dialog open={isAppointmentModalOpen} onOpenChange={setIsAppointmentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Patient Name</Label>
              <Input
                value={appointmentForm.patientName || ''}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, patientName: e.target.value })}
                placeholder="Enter patient name"
              />
            </div>
            <div className="space-y-2">
              <Label>Patient ID</Label>
              <Input
                value={appointmentForm.patientId || ''}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, patientId: e.target.value })}
                placeholder="Enter patient ID"
              />
            </div>
            <div className="space-y-2">
              <Label>Doctor</Label>
              <select
                value={appointmentForm.doctorName || ''}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, doctorName: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="">Select Doctor</option>
                <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                <option value="Dr. Emily Brown">Dr. Emily Brown</option>
                <option value="Dr. James Wilson">Dr. James Wilson</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select
                value={appointmentForm.department || ''}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, department: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="">Select Department</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={appointmentForm.appointmentDate || ''}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={appointmentForm.appointmentTime || ''}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                value={appointmentForm.type || ''}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, type: e.target.value as 'new' | 'follow-up' })}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="">Select Type</option>
                <option value="new">New Patient</option>
                <option value="follow-up">Follow-up</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Insurance</Label>
              <Input
                value={appointmentForm.insurance || ''}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, insurance: e.target.value })}
                placeholder="Insurance provider"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Phone</Label>
              <Input
                value={appointmentForm.phone || ''}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                placeholder="Patient phone number"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAppointmentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (!appointmentForm.patientName || !appointmentForm.doctorName) {
                toast.error('Please fill in all required fields');
                return;
              }
              setLoading(true);
              try {
                const newAppointment = await opdApi.create({
                  patient_name: appointmentForm.patientName,
                  doctor_name: appointmentForm.doctorName,
                  department: appointmentForm.department,
                  appointment_date: appointmentForm.appointmentDate,
                  appointment_time: appointmentForm.appointmentTime,
                  type: appointmentForm.type,
                  insurance: appointmentForm.insurance,
                  mobileno: appointmentForm.phone,
                  patientId: appointmentForm.patientId,
                  status: 'scheduled'
                });
                setAppointments([...appointments, newAppointment]);
                setAppointmentForm({});
                setIsAppointmentModalOpen(false);
                toast.success('Appointment scheduled successfully!');
              } catch (error) {
                console.error('Error scheduling appointment:', error);
                toast.error('Failed to schedule appointment');
              } finally {
                setLoading(false);
              }
            }} disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Appointment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Consultation Modal */}
      <Dialog open={isConsultationModalOpen} onOpenChange={setIsConsultationModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Outpatient Consultation - {consultationForm.patientName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chief Complaint</Label>
                <Input
                  value={consultationForm.chiefComplaint || ''}
                  onChange={(e) => setConsultationForm({ ...consultationForm, chiefComplaint: e.target.value })}
                  placeholder="Patient's main concern"
                />
              </div>
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Input
                  type="date"
                  value={consultationForm.followUp || ''}
                  onChange={(e) => setConsultationForm({ ...consultationForm, followUp: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>History of Present Illness</Label>
              <textarea
                value={consultationForm.history || ''}
                onChange={(e) => setConsultationForm({ ...consultationForm, history: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md h-20 resize-none"
                placeholder="Patient's history..."
              />
            </div>

            <div className="space-y-2">
              <Label>Physical Examination</Label>
              <textarea
                value={consultationForm.examination || ''}
                onChange={(e) => setConsultationForm({ ...consultationForm, examination: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md h-20 resize-none"
                placeholder="Examination findings..."
              />
            </div>

            <div className="space-y-2">
              <Label>Assessment & Diagnosis</Label>
              <textarea
                value={consultationForm.assessment || ''}
                onChange={(e) => setConsultationForm({ ...consultationForm, assessment: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md h-20 resize-none"
                placeholder="Clinical assessment..."
              />
            </div>

            <div className="space-y-2">
              <Label>Treatment Plan</Label>
              <textarea
                value={consultationForm.plan || ''}
                onChange={(e) => setConsultationForm({ ...consultationForm, plan: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md h-20 resize-none"
                placeholder="Treatment plan..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prescriptions</Label>
                <Input
                  value={consultationForm.prescriptions?.join(', ') || ''}
                  onChange={(e) => setConsultationForm({ 
                    ...consultationForm, 
                    prescriptions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Medications (comma separated)"
                />
              </div>
              <div className="space-y-2">
                <Label>Lab Orders</Label>
                <Input
                  value={consultationForm.labOrders?.join(', ') || ''}
                  onChange={(e) => setConsultationForm({ 
                    ...consultationForm, 
                    labOrders: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Lab tests (comma separated)"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsConsultationModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteConsultation}>
              Complete Consultation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

