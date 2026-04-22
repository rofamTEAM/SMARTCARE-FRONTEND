import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Thermometer,
  Activity,
  Droplet,
  Wind,
  Pill,
  Stethoscope,
  AlertCircle,
  Clock,
  User,
  Bed,
  ClipboardList,
  Bell,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { TodoListWidget } from './TodoListWidget';
import { VoiceAgent } from './VoiceAgent';

interface Patient {
  id: string;
  name: string;
  room: string;
  bed: string;
  condition: 'critical' | 'stable' | 'recovering';
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenLevel: number;
    respiratoryRate: number;
  };
  lastCheckTime: string;
  medications: string[];
  alerts: string[];
}

interface Task {
  id: string;
  patientName: string;
  room: string;
  task: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
}

export function NursingStation() {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: '1',
      name: 'John Smith',
      room: '301',
      bed: 'A',
      condition: 'stable',
      vitals: {
        heartRate: 72,
        bloodPressure: '120/80',
        temperature: 98.6,
        oxygenLevel: 98,
        respiratoryRate: 16,
      },
      lastCheckTime: '30 mins ago',
      medications: ['Aspirin 81mg', 'Metformin 500mg'],
      alerts: [],
    },
    {
      id: '2',
      name: 'Emily Davis',
      room: '302',
      bed: 'B',
      condition: 'critical',
      vitals: {
        heartRate: 95,
        bloodPressure: '145/92',
        temperature: 101.2,
        oxygenLevel: 92,
        respiratoryRate: 22,
      },
      lastCheckTime: '15 mins ago',
      medications: ['Antibiotics IV', 'Pain Management'],
      alerts: ['High temperature', 'Low oxygen'],
    },
    {
      id: '3',
      name: 'Michael Brown',
      room: '303',
      bed: 'A',
      condition: 'recovering',
      vitals: {
        heartRate: 68,
        bloodPressure: '118/76',
        temperature: 98.4,
        oxygenLevel: 99,
        respiratoryRate: 14,
      },
      lastCheckTime: '1 hour ago',
      medications: ['Ibuprofen 400mg'],
      alerts: [],
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      room: '304',
      bed: 'C',
      condition: 'stable',
      vitals: {
        heartRate: 75,
        bloodPressure: '122/82',
        temperature: 98.8,
        oxygenLevel: 97,
        respiratoryRate: 16,
      },
      lastCheckTime: '45 mins ago',
      medications: ['Lisinopril 10mg', 'Atorvastatin 20mg'],
      alerts: [],
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      patientName: 'Emily Davis',
      room: '302',
      task: 'Administer IV Antibiotics',
      time: '02:00 PM',
      priority: 'high',
      status: 'pending',
    },
    {
      id: '2',
      patientName: 'John Smith',
      room: '301',
      task: 'Blood Pressure Check',
      time: '02:30 PM',
      priority: 'medium',
      status: 'pending',
    },
    {
      id: '3',
      patientName: 'Michael Brown',
      room: '303',
      task: 'Wound Dressing Change',
      time: '03:00 PM',
      priority: 'medium',
      status: 'pending',
    },
    {
      id: '4',
      patientName: 'Sarah Wilson',
      room: '304',
      task: 'Medication Round',
      time: '03:30 PM',
      priority: 'low',
      status: 'completed',
    },
  ]);

  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [vitalsData, setVitalsData] = useState({
    heartRate: '',
    bloodPressure: '',
    temperature: '',
    oxygenLevel: '',
    respiratoryRate: '',
    notes: '',
  });

  const stats = [
    {
      label: 'Total Patients',
      value: patients.length.toString(),
      icon: User,
      color: 'bg-primary',
    },
    {
      label: 'Critical Cases',
      value: patients.filter((p) => p.condition === 'critical').length.toString(),
      icon: AlertCircle,
      color: 'bg-destructive',
    },
    {
      label: 'Pending Tasks',
      value: tasks.filter((t) => t.status === 'pending').length.toString(),
      icon: ClipboardList,
      color: 'bg-amber-500',
    },
    {
      label: 'Active Alerts',
      value: patients.reduce((acc, p) => acc + p.alerts.length, 0).toString(),
      icon: Bell,
      color: 'bg-primary',
    },
  ];

  const handleRecordVitals = () => {
    if (selectedPatient) {
      setPatients(
        patients.map((p) =>
          p.id === selectedPatient.id
            ? {
                ...p,
                vitals: {
                  heartRate: Number(vitalsData.heartRate) || p.vitals.heartRate,
                  bloodPressure: vitalsData.bloodPressure || p.vitals.bloodPressure,
                  temperature: Number(vitalsData.temperature) || p.vitals.temperature,
                  oxygenLevel: Number(vitalsData.oxygenLevel) || p.vitals.oxygenLevel,
                  respiratoryRate: Number(vitalsData.respiratoryRate) || p.vitals.respiratoryRate,
                },
                lastCheckTime: 'Just now',
              }
            : p
        )
      );
      setIsVitalsModalOpen(false);
      setVitalsData({
        heartRate: '',
        bloodPressure: '',
        temperature: '',
        oxygenLevel: '',
        respiratoryRate: '',
        notes: '',
      });
      setSelectedPatient(null);
    }
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: 'completed' as const } : task
      )
    );
  };

  const getConditionBadge = (condition: Patient['condition']) => {
    const config = {
      critical: { className: 'bg-red-100 text-destructive', label: 'Critical' },
      stable: { className: 'bg-green-100 text-primary', label: 'Stable' },
      recovering: { className: 'bg-blue-100 text-primary', label: 'Recovering' },
    };
    return config[condition];
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const config = {
      high: { className: 'bg-red-100 text-destructive', label: 'High' },
      medium: { className: 'bg-amber-100 text-amber-700', label: 'Medium' },
      low: { className: 'bg-muted text-foreground', label: 'Low' },
    };
    return config[priority];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900">Nursing Station</h1>
          <p className="text-muted-foreground">Monitor patients, record vitals, and manage care tasks</p>
        </div>
        <VoiceAgent department="nursing" userRole="nurse" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="size-5 text-primary" />
                Patient Ward
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.map((patient) => (
                  <motion.div
                    key={patient.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-card-foreground">
                            {patient.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-900">{patient.name}</p>
                            <Badge
                              variant="outline"
                              className={getConditionBadge(patient.condition).className}
                            >
                              {getConditionBadge(patient.condition).label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Room {patient.room} - Bed {patient.bed}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Last check: {patient.lastCheckTime}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setIsVitalsModalOpen(true);
                        }}
                      >
                        <Activity className="size-4 mr-1" />
                        Record Vitals
                      </Button>
                    </div>

                    {/* Vitals Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                      <div className="flex items-center gap-2 p-2 bg-card rounded">
                        <Heart className="size-4 text-destructive" />
                        <div>
                          <p className="text-xs text-muted-foreground">HR</p>
                          <p className="text-sm text-gray-900">
                            {patient.vitals.heartRate} bpm
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-card rounded">
                        <Activity className="size-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">BP</p>
                          <p className="text-sm text-gray-900">
                            {patient.vitals.bloodPressure}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-card rounded">
                        <Thermometer className="size-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Temp</p>
                          <p className="text-sm text-gray-900">
                            {patient.vitals.temperature}°F
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-card rounded">
                        <Droplet className="size-4 text-cyan-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">SpO2</p>
                          <p className="text-sm text-gray-900">
                            {patient.vitals.oxygenLevel}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-card rounded">
                        <Wind className="size-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">RR</p>
                          <p className="text-sm text-gray-900">
                            {patient.vitals.respiratoryRate}/min
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Medications */}
                    {patient.medications.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-2">Current Medications:</p>
                        <div className="flex flex-wrap gap-2">
                          {patient.medications.map((med, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <Pill className="size-3 mr-1" />
                              {med}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alerts */}
                    {patient.alerts.length > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                        <AlertCircle className="size-4 text-destructive" />
                        <div className="flex flex-wrap gap-2">
                          {patient.alerts.map((alert, idx) => (
                            <span key={idx} className="text-xs text-destructive">
                              {alert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Tasks */}
        <div className="space-y-6">
          {/* Todo List Widget */}
          <TodoListWidget maxItems={3} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5 text-primary" />
                Today&apos;s Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg border ${
                      task.status === 'completed'
                        ? 'bg-muted/50 border-border opacity-60'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant="outline"
                        className={getPriorityBadge(task.priority).className}
                      >
                        {getPriorityBadge(task.priority).label}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {task.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">{task.task}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {task.patientName} - Room {task.room}
                    </p>
                    {task.status === 'pending' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        Mark Complete
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-xs text-primary">
                        <ClipboardList className="size-3" />
                        Completed
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Shift Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vitals Recorded</span>
                <span className="text-sm text-gray-900">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Medications Given</span>
                <span className="text-sm text-gray-900">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tasks Completed</span>
                <span className="text-sm text-gray-900">
                  {tasks.filter((t) => t.status === 'completed').length}/
                  {tasks.length}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Shift Progress</span>
                  <span className="text-gray-900">
                    {Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100)}%
                  </span>
                </div>
                <Progress
                  value={(tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record Vitals Modal */}
      <Dialog open={isVitalsModalOpen} onOpenChange={setIsVitalsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Vital Signs</DialogTitle>
            <DialogDescription>
              Enter the patient's vital signs and any additional notes.
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-gray-900">{selectedPatient.name}</p>
                <p className="text-sm text-muted-foreground">
                  Room {selectedPatient.room} - Bed {selectedPatient.bed}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    value={vitalsData.heartRate}
                    onChange={(e) =>
                      setVitalsData({ ...vitalsData, heartRate: e.target.value })
                    }
                    placeholder={selectedPatient.vitals.heartRate.toString()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">Blood Pressure</Label>
                  <Input
                    id="bloodPressure"
                    value={vitalsData.bloodPressure}
                    onChange={(e) =>
                      setVitalsData({ ...vitalsData, bloodPressure: e.target.value })
                    }
                    placeholder={selectedPatient.vitals.bloodPressure}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°F)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={vitalsData.temperature}
                    onChange={(e) =>
                      setVitalsData({ ...vitalsData, temperature: e.target.value })
                    }
                    placeholder={selectedPatient.vitals.temperature.toString()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygenLevel">Oxygen Level (%)</Label>
                  <Input
                    id="oxygenLevel"
                    type="number"
                    value={vitalsData.oxygenLevel}
                    onChange={(e) =>
                      setVitalsData({ ...vitalsData, oxygenLevel: e.target.value })
                    }
                    placeholder={selectedPatient.vitals.oxygenLevel.toString()}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="respiratoryRate">Respiratory Rate (/min)</Label>
                  <Input
                    id="respiratoryRate"
                    type="number"
                    value={vitalsData.respiratoryRate}
                    onChange={(e) =>
                      setVitalsData({ ...vitalsData, respiratoryRate: e.target.value })
                    }
                    placeholder={selectedPatient.vitals.respiratoryRate.toString()}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={vitalsData.notes}
                    onChange={(e) =>
                      setVitalsData({ ...vitalsData, notes: e.target.value })
                    }
                    placeholder="Any observations or concerns..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsVitalsModalOpen(false);
                    setVitalsData({
                      heartRate: '',
                      bloodPressure: '',
                      temperature: '',
                      oxygenLevel: '',
                      respiratoryRate: '',
                      notes: '',
                    });
                    setSelectedPatient(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleRecordVitals}>Record Vitals</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

