import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, Calendar, CheckCircle, Clock, FlaskConical, 
  FileText, CreditCard, Receipt, Pill, CheckCircle2,
  ArrowRight, User, Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { patientsApi } from '../utils/api';
import { toast } from 'sonner';

interface PatientWorkflowProps {
  session: any;
}

interface Patient {
  id: string;
  name: string;
  date_of_birth?: string;
  phone?: string;
}

interface WorkflowPatient extends Patient {
  workflow_stage: string;
  workflow_status: string;
}

const workflowStages = [
  { id: 'registration', label: 'Registration', icon: UserPlus, color: 'bg-primary' },
  { id: 'appointment', label: 'Schedule Appointment', icon: Calendar, color: 'bg-primary' },
  { id: 'checkin', label: 'Check In Patient', icon: CheckCircle, color: 'bg-yellow-500' },
  { id: 'waiting', label: 'Waiting Room', icon: Clock, color: 'bg-primary' },
  { id: 'consultation', label: 'Doctor Consultation', icon: User, color: 'bg-primary' },
  { id: 'lab_tests', label: 'Lab Tests', icon: FlaskConical, color: 'bg-destructive' },
  { id: 'prescriptions', label: 'Prescriptions', icon: FileText, color: 'bg-primary' },
  { id: 'pharmacy', label: 'Pharmacy', icon: Pill, color: 'bg-pink-500' },
  { id: 'billing', label: 'Billing', icon: CreditCard, color: 'bg-primary' },
  { id: 'payment', label: 'Payment', icon: Receipt, color: 'bg-cyan-500' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'bg-primary' }
];

export function PatientWorkflowManagement({ session }: PatientWorkflowProps) {
  const [patients, setPatients] = useState<WorkflowPatient[]>([]);
  const [selectedStage, setSelectedStage] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // Try to get patients from database first
      let data = [];
      try {
        data = await patientsApi.getAll();
      } catch (dbError) {
        data = [];
      }
      
      // Add workflow stages to patients
      const workflowPatients = data.map(patient => ({
        ...patient,
        workflow_stage: patient.workflow_stage || getRandomStage(),
        workflow_status: patient.workflow_status || 'active'
      }));
      setPatients(workflowPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Final fallback - empty array
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const getRandomStage = () => {
    const stages = ['registration', 'appointment', 'checkin', 'waiting', 'consultation', 'lab_tests', 'prescriptions', 'pharmacy', 'billing', 'payment', 'completed'];
    return stages[Math.floor(Math.random() * stages.length)];
  };

  const movePatientToNextStage = async (patientId: string, currentStage: string) => {
    const currentIndex = workflowStages.findIndex(stage => stage.id === currentStage);
    if (currentIndex < workflowStages.length - 1) {
      const nextStage = workflowStages[currentIndex + 1].id;
      
      setPatients(prev => prev.map(patient => 
        patient.id === patientId 
          ? { ...patient, workflow_stage: nextStage }
          : patient
      ));
      
      toast.success(`Patient moved to ${workflowStages[currentIndex + 1].label}`);
    }
  };

  const getStagePatients = (stageId: string) => {
    return patients.filter(patient => patient.workflow_stage === stageId);
  };

  const filteredPatients = selectedStage === 'all' 
    ? patients 
    : patients.filter(patient => patient.workflow_stage === selectedStage);

  const getStageInfo = (stageId: string) => {
    return workflowStages.find(stage => stage.id === stageId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Hospital Workflow Management</h2>
            <p className="text-muted-foreground">Complete patient journey from registration to billing</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <UserPlus className="size-4 mr-2" />
            Register Patient
          </Button>
        </div>
      </motion.div>

      {/* Workflow Stages Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Workflow Stages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between overflow-x-auto pb-4">
              {workflowStages.map((stage, index) => {
                const Icon = stage.icon;
                const patientCount = getStagePatients(stage.id).length;
                
                return (
                  <div key={stage.id} className="flex items-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all ${
                        selectedStage === stage.id ? 'bg-primary/10 border-2 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedStage(stage.id)}
                    >
                      <div className={`${stage.color} p-3 rounded-full text-card-foreground mb-2`}>
                        <Icon className="size-6" />
                      </div>
                      <span className="text-sm font-medium text-center">{stage.label}</span>
                      <Badge variant="secondary" className="mt-1">
                        {patientCount}
                      </Badge>
                    </motion.div>
                    {index < workflowStages.length - 1 && (
                      <ArrowRight className="size-4 text-muted-foreground mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stage Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedStage === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedStage('all')}
          className="mb-2"
        >
          All Patients ({patients.length})
        </Button>
        {workflowStages.map(stage => (
          <Button
            key={stage.id}
            variant={selectedStage === stage.id ? 'default' : 'outline'}
            onClick={() => setSelectedStage(stage.id)}
            className="mb-2"
          >
            {stage.label} ({getStagePatients(stage.id).length})
          </Button>
        ))}
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient, index) => {
          const stageInfo = getStageInfo(patient.workflow_stage);
          const StageIcon = stageInfo?.icon || User;
          
          return (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Age: {patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 'N/A'}
                      </p>
                      {patient.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Phone className="size-3" />
                          {patient.phone}
                        </div>
                      )}
                    </div>
                    <Badge 
                      className={`${stageInfo?.color} text-card-foreground`}
                      variant="secondary"
                    >
                      {patient.workflow_stage.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className={`${stageInfo?.color} p-2 rounded-full text-card-foreground`}>
                      <StageIcon className="size-4" />
                    </div>
                    <span className="text-sm font-medium">{stageInfo?.label}</span>
                  </div>

                  <div className="flex gap-2">
                    {patient.workflow_stage !== 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => movePatientToNextStage(patient.id, patient.workflow_stage)}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        Next Stage
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No patients found in {selectedStage === 'all' ? 'the system' : `${getStageInfo(selectedStage)?.label} stage`}.
        </div>
      )}
    </div>
  );
}

