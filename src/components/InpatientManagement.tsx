import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bed,
  Users,
  Activity,
  FileText,
  Clock,
  AlertTriangle,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  MapPin,
  Pill,
  FlaskConical,
  DollarSign,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ipdApi } from '../utils/api';
import { VoiceAgent } from './VoiceAgent';
import { InpatientAdmission } from '@/types/patient';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface InpatientBed {
  id: string;
  bedNumber: string;
  ward: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patientName?: string;
  admissionDate?: string;
  condition?: string;
}

interface VitalSigns {
  id: string;
  patientId: string;
  date: string;
  time: string;
  temperature: number;
  bloodPressure: string;
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  recordedBy: string;
}

interface MedicationSchedule {
  id: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'discontinued';
}

interface InpatientManagementProps {
  session: any;
}

export function InpatientManagement({ session }: InpatientManagementProps) {
  const [beds, setBeds] = useState<InpatientBed[]>([]);
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [medications, setMedications] = useState<MedicationSchedule[]>([]);
  const [selectedWard, setSelectedWard] = useState('All');
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<InpatientAdmission | null>(null);
  const [admissionForm, setAdmissionForm] = useState<Partial<InpatientAdmission>>({});
  const [vitalsForm, setVitalsForm] = useState<Partial<VitalSigns>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleFetchError, handleSubmitError } = useErrorHandler();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [bedsData, admissionsData] = await Promise.all([
        ipdApi.getAll(),
        ipdApi.getAll(),
      ]);
      setAdmissions(Array.isArray(admissionsData) ? admissionsData : []);
    } catch (error) {
      const message = handleFetchError(error, 'inpatient data');
      setError(message);
      setAdmissions([]);
    }
  };

  const wards = ['All', 'ICU', 'General Ward', 'Private Ward', 'Emergency', 'Pediatric'];
  
  const stats = [
    { label: 'Total Beds', value: beds.length, icon: Bed, color: 'bg-primary' },
    { label: 'Occupied Beds', value: beds.filter(b => b.status === 'occupied').length, icon: Users, color: 'bg-primary' },
    { label: 'Available Beds', value: beds.filter(b => b.status === 'available').length, icon: CheckCircle, color: 'bg-primary' },
    { label: 'Critical Patients', value: beds.filter(b => b.condition === 'Critical').length, icon: AlertTriangle, color: 'bg-destructive' }
  ];

  const filteredBeds = selectedWard === 'All' ? beds : beds.filter(bed => bed.ward === selectedWard);

  const getBedStatusColor = (status: string) => {
    const colors = {
      'available': 'bg-green-100 text-primary border-green-200',
      'occupied': 'bg-red-100 text-destructive border-red-200',
      'maintenance': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'reserved': 'bg-blue-100 text-primary border-blue-200'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-foreground border-border';
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      'Critical': 'bg-red-100 text-destructive',
      'Serious': 'bg-orange-100 text-primary',
      'Stable': 'bg-green-100 text-primary',
      'Fair': 'bg-yellow-100 text-yellow-700'
    };
    return colors[condition as keyof typeof colors] || 'bg-muted text-foreground';
  };

  const handleAdmitPatient = async () => {
    if (!admissionForm.patient_name || !admissionForm.ward) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const newAdmission = await ipdApi.create({
        patient_name: admissionForm.patient_name,
        ward: admissionForm.ward,
        admission_type: admissionForm.admission_type || 'elective',
        condition: admissionForm.condition || 'Stable',
        attending_doctor: admissionForm.attending_doctor || '',
        patientId: admissionForm.patientId,
        admission_date: new Date().toISOString().split('T')[0],
        status: 'admitted',
      });
      setAdmissions([...admissions, newAdmission]);
      setAdmissionForm({});
      setIsAdmissionModalOpen(false);
      toast.success('Patient admitted successfully!');
    } catch (error) {
      console.error('Error admitting patient:', error);
      toast.error('Failed to admit patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordVitals = () => {
    if (selectedPatient) {
      const newVitals: VitalSigns = {
        id: Date.now().toString(),
        patientId: selectedPatient.patientId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        recordedBy: session?.name || 'Nurse',
        ...vitalsForm as Omit<VitalSigns, 'id' | 'patientId' | 'date' | 'time' | 'recordedBy'>
      };
      
      setVitals([...vitals, newVitals]);
      setVitalsForm({});
      setIsVitalsModalOpen(false);
    }
  };

  const handleDischarge = async (admissionId: string) => {
    try {
      await ipdApi.discharge(admissionId, { discharged: 'yes' });
      setAdmissions(admissions.map(admission =>
        admission.id === admissionId ? { ...admission, status: 'discharged' } : admission
      ));
      toast.success('Patient discharged successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to discharge patient.');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="size-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Error Loading Data</p>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchData}
            className="text-destructive hover:text-destructive"
          >
            Retry
          </Button>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900">Inpatient Management</h1>
          <p className="text-muted-foreground">Manage hospital admissions, beds, and inpatient care</p>
        </div>
        <div className="flex items-center gap-2">
          <VoiceAgent department="inpatient" userRole={session?.role || 'nurse'} />
          <Button onClick={() => setIsAdmissionModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="size-4 mr-2" />
            New Admission
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

      <Tabs defaultValue="beds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="beds">Bed Management</TabsTrigger>
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
          <TabsTrigger value="vitals">Vitals & Monitoring</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="discharge">Discharge</TabsTrigger>
        </TabsList>

        <TabsContent value="beds" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bed Occupancy Map</CardTitle>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md"
                >
                  {wards.map(ward => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBeds.map((bed) => (
                  <motion.div
                    key={bed.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${getBedStatusColor(bed.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Bed className="size-5" />
                        <span className="font-medium">{bed.bedNumber}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {bed.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{bed.ward}</p>
                    {bed.patientName && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm font-medium">{bed.patientName}</p>
                        <p className="text-xs text-muted-foreground">Admitted: {bed.admissionDate}</p>
                        {bed.condition && (
                          <Badge className={`text-xs mt-1 ${getConditionColor(bed.condition)}`}>
                            {bed.condition}
                          </Badge>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Admissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {admissions.filter(a => a.status === 'admitted').map((admission) => (
                  <div key={admission.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1 grid grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Patient</p>
                        <p className="text-sm text-gray-900">{admission.patient_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ward/Bed</p>
                        <p className="text-sm text-gray-900">{admission.ward}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Admission Date</p>
                        <p className="text-sm text-gray-900">{admission.admission_date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Doctor</p>
                        <p className="text-sm text-gray-900">{admission.attending_doctor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Condition</p>
                        <Badge className={getConditionColor(admission.condition)}>
                          {admission.condition}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedPatient(admission);
                          setIsVitalsModalOpen(true);
                        }}
                      >
                        <Activity className="size-4 mr-1" />
                        Vitals
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDischarge(admission.id)}
                      >
                        Discharge
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Vital Signs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vitals.slice(-10).map((vital) => {
                  const patient = admissions.find(a => a.patientId === vital.patientId);
                  return (
                    <div key={vital.id} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-gray-900">{patient?.patientName}</h4>
                        <span className="text-sm text-muted-foreground">{vital.date} {vital.time}</span>
                      </div>
                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Temp</p>
                          <p className="text-gray-900">{vital.temperature}°C</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">BP</p>
                          <p className="text-gray-900">{vital.bloodPressure}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">HR</p>
                          <p className="text-gray-900">{vital.heartRate} bpm</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">RR</p>
                          <p className="text-gray-900">{vital.respiratoryRate}/min</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">SpO2</p>
                          <p className="text-gray-900">{vital.oxygenSaturation}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {vitals.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No vital signs recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medication Administration Record (MAR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Medication schedules and administration tracking
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discharge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discharge Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {admissions.filter(a => a.status === 'admitted').map((admission) => (
                  <div key={admission.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-gray-900">{admission.patient_name}</p>
                      <p className="text-sm text-muted-foreground">Est. Discharge: {admission.estimated_discharge}</p>
                    </div>
                    <Button onClick={() => handleDischarge(admission.id)}>
                      <CheckCircle className="size-4 mr-2" />
                      Process Discharge
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admission Modal */}
      <Dialog open={isAdmissionModalOpen} onOpenChange={setIsAdmissionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Patient Admission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient ID</Label>
                <Input
                  value={admissionForm.patientId || ''}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, patientId: parseInt(e.target.value) })}
                  placeholder="Enter patient ID"
                />
              </div>
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input
                  value={admissionForm.patient_name || ''}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, patient_name: e.target.value })}
                  placeholder="Enter patient name"
                />
              </div>
              <div className="space-y-2">
                <Label>Ward</Label>
                <select
                  value={admissionForm.ward || ''}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, ward: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select Ward</option>
                  <option value="ICU">ICU</option>
                  <option value="General Ward">General Ward</option>
                  <option value="Private Ward">Private Ward</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Admission Type</Label>
                <select
                  value={admissionForm.admission_type || ''}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, admission_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select Type</option>
                  <option value="emergency">Emergency</option>
                  <option value="elective">Elective</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Attending Doctor</Label>
                <Input
                  value={admissionForm.attending_doctor || ''}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, attending_doctor: e.target.value })}
                  placeholder="Enter doctor name"
                />
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <select
                  value={admissionForm.condition || ''}
                  onChange={(e) => setAdmissionForm({ ...admissionForm, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select Condition</option>
                  <option value="Critical">Critical</option>
                  <option value="Serious">Serious</option>
                  <option value="Stable">Stable</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdmissionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdmitPatient} disabled={loading}>
              {loading ? 'Admitting...' : 'Admit Patient'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vitals Modal */}
      <Dialog open={isVitalsModalOpen} onOpenChange={setIsVitalsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Vital Signs - {selectedPatient?.patientName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitalsForm.temperature || ''}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: parseFloat(e.target.value) })}
                  placeholder="36.5"
                />
              </div>
              <div className="space-y-2">
                <Label>Blood Pressure</Label>
                <Input
                  value={vitalsForm.bloodPressure || ''}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })}
                  placeholder="120/80"
                />
              </div>
              <div className="space-y-2">
                <Label>Heart Rate (bpm)</Label>
                <Input
                  type="number"
                  value={vitalsForm.heartRate || ''}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, heartRate: parseInt(e.target.value) })}
                  placeholder="72"
                />
              </div>
              <div className="space-y-2">
                <Label>Respiratory Rate (/min)</Label>
                <Input
                  type="number"
                  value={vitalsForm.respiratoryRate || ''}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, respiratoryRate: parseInt(e.target.value) })}
                  placeholder="16"
                />
              </div>
              <div className="space-y-2">
                <Label>Oxygen Saturation (%)</Label>
                <Input
                  type="number"
                  value={vitalsForm.oxygenSaturation || ''}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, oxygenSaturation: parseInt(e.target.value) })}
                  placeholder="98"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsVitalsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordVitals}>
              Record Vitals
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

