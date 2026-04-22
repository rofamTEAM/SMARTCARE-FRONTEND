import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Clock, CheckCircle, AlertTriangle, Pill, User, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface MedicationRecord {
  id: string;
  patient_name: string;
  patient_id: string;
  medication: string;
  dosage: string;
  route: string;
  frequency: string;
  scheduled_time: string;
  administered_time?: string;
  administered_by?: string;
  status: 'scheduled' | 'administered' | 'missed' | 'refused';
  notes?: string;
  date: string;
}

interface CareTask {
  id: string;
  patient_name: string;
  task_type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  scheduled_time: string;
  completed_time?: string;
  completed_by?: string;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
}

export function MedicationAdministration({ session }: { session: any }) {
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [activeTab, setActiveTab] = useState<'medications' | 'care_tasks'>('medications');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<MedicationRecord | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = () => {
    // Mock data - replace with actual API calls
    const mockMedications: MedicationRecord[] = [
      {
        id: '1',
        patient_name: 'John Smith',
        patient_id: 'P001',
        medication: 'Metformin 500mg',
        dosage: '500mg',
        route: 'PO',
        frequency: 'BID',
        scheduled_time: '08:00',
        status: 'scheduled',
        date: selectedDate
      },
      {
        id: '2',
        patient_name: 'Emily Davis',
        patient_id: 'P002',
        medication: 'Insulin Glargine',
        dosage: '20 units',
        route: 'SC',
        frequency: 'Daily',
        scheduled_time: '09:00',
        administered_time: '09:05',
        administered_by: 'Nurse Johnson',
        status: 'administered',
        date: selectedDate
      },
      {
        id: '3',
        patient_name: 'Michael Brown',
        patient_id: 'P003',
        medication: 'Lisinopril 10mg',
        dosage: '10mg',
        route: 'PO',
        frequency: 'Daily',
        scheduled_time: '10:00',
        status: 'scheduled',
        date: selectedDate
      }
    ];

    const mockCareTasks: CareTask[] = [
      {
        id: '1',
        patient_name: 'John Smith',
        task_type: 'Vital Signs',
        description: 'Check blood pressure and temperature',
        priority: 'high',
        scheduled_time: '08:30',
        status: 'pending'
      },
      {
        id: '2',
        patient_name: 'Emily Davis',
        task_type: 'Wound Care',
        description: 'Change surgical dressing',
        priority: 'medium',
        scheduled_time: '10:00',
        completed_time: '10:15',
        completed_by: 'Nurse Johnson',
        status: 'completed'
      }
    ];

    setMedications(mockMedications);
    setCareTasks(mockCareTasks);
  };

  const handleAdministerMedication = (medicationId: string, notes?: string) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setMedications(medications.map(med => 
      med.id === medicationId 
        ? {
            ...med,
            status: 'administered' as const,
            administered_time: currentTime,
            administered_by: session?.name || 'Current User',
            notes: notes || ''
          }
        : med
    ));

    setShowAdminModal(false);
    setSelectedMedication(null);
    toast.success('Medication administered successfully!');
  };

  const handleRefuseMedication = (medicationId: string, reason: string) => {
    setMedications(medications.map(med => 
      med.id === medicationId 
        ? {
            ...med,
            status: 'refused' as const,
            notes: `Patient refused: ${reason}`
          }
        : med
    ));
    toast.info('Medication refusal recorded');
  };

  const handleCompleteTask = (taskId: string, notes?: string) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    setCareTasks(careTasks.map(task => 
      task.id === taskId 
        ? {
            ...task,
            status: 'completed' as const,
            completed_time: currentTime,
            completed_by: session?.name || 'Current User',
            notes: notes || ''
          }
        : task
    ));
    toast.success('Care task completed!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'administered': return 'bg-green-100 text-primary';
      case 'scheduled': return 'bg-blue-100 text-primary';
      case 'missed': return 'bg-red-100 text-destructive';
      case 'refused': return 'bg-orange-100 text-primary';
      case 'completed': return 'bg-green-100 text-primary';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-destructive';
      default: return 'bg-muted text-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-destructive';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-primary';
      default: return 'bg-muted text-foreground';
    }
  };

  const filteredMedications = medications.filter(med =>
    med.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.medication.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = careTasks.filter(task =>
    task.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.task_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medication Administration</h1>
          <p className="text-muted-foreground">Manage medication schedules and care tasks</p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('medications')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'medications'
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-gray-900'
          }`}
        >
          <Pill className="size-4 mr-2 inline" />
          Medications
        </button>
        <button
          onClick={() => setActiveTab('care_tasks')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'care_tasks'
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-gray-900'
          }`}
        >
          <CheckCircle className="size-4 mr-2 inline" />
          Care Tasks
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          placeholder={`Search ${activeTab === 'medications' ? 'medications' : 'care tasks'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {activeTab === 'medications' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="size-5 text-primary" />
              Medication Schedule - {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredMedications
                .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
                .map((medication) => (
                  <motion.div
                    key={medication.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="size-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{medication.patient_name}</h3>
                          <p className="text-sm text-muted-foreground">ID: {medication.patient_id}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Medication:</span>
                          <p className="text-gray-900">{medication.medication}</p>
                        </div>
                        <div>
                          <span className="font-medium">Dosage:</span>
                          <p className="text-gray-900">{medication.dosage} {medication.route}</p>
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span>
                          <p className="text-gray-900">{medication.frequency}</p>
                        </div>
                        <div>
                          <span className="font-medium">Scheduled:</span>
                          <p className="text-gray-900 flex items-center gap-1">
                            <Clock className="size-4" />
                            {medication.scheduled_time}
                          </p>
                        </div>
                      </div>

                      {medication.administered_time && (
                        <div className="mt-2 text-sm text-primary">
                          Administered at {medication.administered_time} by {medication.administered_by}
                        </div>
                      )}

                      {medication.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">Notes:</span> {medication.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(medication.status)}>
                        {medication.status}
                      </Badge>
                      
                      {medication.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedMedication(medication);
                              setShowAdminModal(true);
                            }}
                            className="bg-primary hover:bg-green-700"
                          >
                            <CheckCircle className="size-4 mr-1" />
                            Administer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefuseMedication(medication.id, 'Patient refused medication')}
                            className="text-primary hover:text-primary"
                          >
                            Refused
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'care_tasks' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-primary" />
              Care Tasks - {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTasks
                .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
                .map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="size-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{task.patient_name}</h3>
                          <p className="text-sm text-muted-foreground">{task.task_type}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="text-gray-900">{task.description}</p>
                        </div>
                        <div>
                          <span className="font-medium">Scheduled:</span>
                          <p className="text-gray-900 flex items-center gap-1">
                            <Clock className="size-4" />
                            {task.scheduled_time}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Priority:</span>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>

                      {task.completed_time && (
                        <div className="mt-2 text-sm text-primary">
                          Completed at {task.completed_time} by {task.completed_by}
                        </div>
                      )}

                      {task.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium">Notes:</span> {task.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      
                      {task.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteTask(task.id)}
                          className="bg-primary hover:bg-green-700"
                        >
                          <CheckCircle className="size-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Administration Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Administer Medication</DialogTitle>
          </DialogHeader>
          {selectedMedication && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold">{selectedMedication.patient_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedMedication.medication} - {selectedMedication.dosage} {selectedMedication.route}
                </p>
                <p className="text-sm text-muted-foreground">
                  Scheduled: {selectedMedication.scheduled_time}
                </p>
              </div>
              
              <div>
                <Label>Administration Notes (Optional)</Label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-md mt-1"
                  rows={3}
                  placeholder="Any notes about the administration..."
                  id="admin-notes"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const notes = (document.getElementById('admin-notes') as HTMLTextAreaElement)?.value;
                    handleAdministerMedication(selectedMedication.id, notes);
                  }}
                  className="flex-1 bg-primary hover:bg-green-700"
                >
                  Confirm Administration
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAdminModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

