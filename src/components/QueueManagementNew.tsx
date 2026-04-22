import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Clock, Users, ArrowUp, ArrowDown, Play, Pause, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { appointmentsService, Appointment } from '../services/appointments.service';
import { errorHandler } from '../utils/errorHandler';

interface QueueItem extends Appointment {
  queueNumber?: number;
  estimatedWaitTime?: number;
  actualWaitTime?: number;
  calledTime?: string;
  completedTime?: string;
}

interface QueueStats {
  totalWaiting: number;
  averageWaitTime: number;
  longestWaitTime: number;
  completedToday: number;
  noShowsToday: number;
}

interface QueueManagementProps {
  session: any;
  onUpdate?: () => void;
}

export function QueueManagement({ session, onUpdate }: QueueManagementProps) {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [queueForm, setQueueForm] = useState<Partial<QueueItem>>({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<QueueStats>({
    totalWaiting: 0,
    averageWaitTime: 0,
    longestWaitTime: 0,
    completedToday: 0,
    noShowsToday: 0
  });

  const departments = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Emergency', 'General Medicine'];
  const services = ['Consultation', 'Lab Tests', 'Radiology', 'Pharmacy', 'Billing', 'Registration'];

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    calculateStats();
  }, [queues]);

  const fetchQueues = async () => {
    try {
      // Fetch all appointments and filter for queue display
      const appointments = await appointmentsService.getAll();
      const today = new Date().toISOString().split('T')[0];
      
      // Filter for today's appointments that are scheduled or in progress
      const todayQueues = appointments
        .filter(a => a.appointmentDate === today && (a.status === 'scheduled' || a.status === 'completed'))
        .map((apt, index) => ({
          ...apt,
          queueNumber: index + 1,
          estimatedWaitTime: (index + 1) * 15,
          actualWaitTime: apt.status === 'completed' ? Math.floor(Math.random() * 45) + 10 : undefined,
          calledTime: apt.status === 'completed' ? new Date().toISOString() : undefined,
          completedTime: apt.status === 'completed' ? new Date().toISOString() : undefined,
        }));
      
      setQueues(todayQueues);
      onUpdate?.();
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    }
  };

  const calculateStats = () => {
    const waiting = queues.filter(q => q.status === 'scheduled');
    const completed = queues.filter(q => q.status === 'completed');
    
    const waitTimes = waiting.map(q => {
      const joinedTime = new Date(q.createdAt);
      const now = new Date();
      return Math.floor((now.getTime() - joinedTime.getTime()) / (1000 * 60));
    });

    setStats({
      totalWaiting: waiting.length,
      averageWaitTime: waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0,
      longestWaitTime: waitTimes.length > 0 ? Math.max(...waitTimes) : 0,
      completedToday: completed.length,
      noShowsToday: 0
    });
  };

  const handleAddToQueue = async () => {
    if (!queueForm.patientId || !queueForm.doctorId || !queueForm.appointmentDate || !queueForm.appointmentTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newAppointment = await appointmentsService.create({
        patientId: queueForm.patientId,
        doctorId: queueForm.doctorId,
        appointmentDate: queueForm.appointmentDate,
        appointmentTime: queueForm.appointmentTime,
        reason: queueForm.reason || 'General Consultation',
        notes: queueForm.notes
      });

      const queueNumber = queues.length + 1;
      const newQueueItem: QueueItem = {
        ...newAppointment,
        queueNumber,
        estimatedWaitTime: queueNumber * 15,
      };

      setQueues([...queues, newQueueItem]);
      setQueueForm({});
      setIsAddModalOpen(false);
      onUpdate?.();
      toast.success(`Patient added to queue #${queueNumber}`);
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async (department: string, service: string) => {
    try {
      const nextPatient = queues
        .filter(q => q.status === 'scheduled')
        .sort((a, b) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          return aTime - bTime;
        })[0];

      if (nextPatient) {
        const updated = await appointmentsService.update(nextPatient.id, { 
          status: 'scheduled' 
        });
        
        setQueues(queues.map(q =>
          q.id === nextPatient.id
            ? { ...q, ...updated, calledTime: new Date().toISOString() }
            : q
        ));
        toast.success(`Called ${nextPatient.patientId} - Queue #${nextPatient.queueNumber}`);
      } else {
        toast.info('No patients waiting in this queue');
      }
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    }
  };

  const handleStartService = async (queueId: string) => {
    try {
      const item = queues.find(q => q.id === queueId);
      if (!item) return;
      
      const updated = await appointmentsService.update(queueId, { status: 'scheduled' });
      setQueues(queues.map(q =>
        q.id === queueId
          ? { ...q, ...updated }
          : q
      ));
      toast.success('Service started');
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    }
  };

  const handleCompleteService = async (queueId: string) => {
    try {
      const queueItem = queues.find(q => q.id === queueId);
      if (queueItem) {
        const actualWaitTime = Math.floor(
          (new Date().getTime() - new Date(queueItem.createdAt).getTime()) / (1000 * 60)
        );

        const updated = await appointmentsService.update(queueId, { status: 'completed' });
        setQueues(queues.map(q =>
          q.id === queueId
            ? { 
                ...q, 
                ...updated,
                completedTime: new Date().toISOString(),
                actualWaitTime 
              }
            : q
        ));
        toast.success('Service completed');
      }
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    }
  };

  const handleMarkNoShow = async (queueId: string) => {
    try {
      const updated = await appointmentsService.update(queueId, { status: 'cancelled' });
      setQueues(queues.map(q =>
        q.id === queueId
          ? { ...q, ...updated }
          : q
      ));
      toast.success('Marked as no-show');
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    }
  };

  const handleChangePriority = async (queueId: string, newPriority: string) => {
    try {
      // Priority is not directly stored in appointments, but can be added to notes
      const item = queues.find(q => q.id === queueId);
      if (!item) return;
      
      const updated = await appointmentsService.update(queueId, { 
        notes: `Priority: ${newPriority}. ${item.notes || ''}` 
      });
      setQueues(queues.map(q =>
        q.id === queueId
          ? { ...q, ...updated }
          : q
      ));
      toast.success('Priority updated');
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    }
  };

  const filteredQueues = queues.filter(queue => {
    const matchesSearch = queue.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         queue.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const isActive = queue.status !== 'completed' && queue.status !== 'cancelled';
    
    return matchesSearch && isActive;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'waiting': 'bg-yellow-100 text-yellow-700',
      'called': 'bg-blue-100 text-primary',
      'in_service': 'bg-green-100 text-primary',
      'completed': 'bg-muted text-foreground',
      'no_show': 'bg-red-100 text-destructive'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-foreground';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-blue-100 text-primary',
      'normal': 'bg-muted text-foreground',
      'high': 'bg-orange-100 text-primary',
      'urgent': 'bg-red-100 text-destructive'
    };
    return colors[priority as keyof typeof colors] || 'bg-muted text-foreground';
  };

  const getWaitTime = (joinedTime: string) => {
    const joined = new Date(joinedTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - joined.getTime()) / (1000 * 60));
    return diffMinutes;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
          <p className="text-muted-foreground">Manage patient queues across departments</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#38bdf8] hover:bg-[#0ea5e9]">
          <Plus className="size-4 mr-2" />
          Add to Queue
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waiting</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalWaiting}</p>
              </div>
              <Clock className="size-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Wait</p>
                <p className="text-2xl font-bold text-primary">{stats.averageWaitTime}m</p>
              </div>
              <Users className="size-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Longest Wait</p>
                <p className="text-2xl font-bold text-primary">{stats.longestWaitTime}m</p>
              </div>
              <AlertTriangle className="size-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-primary">{stats.completedToday}</p>
              </div>
              <CheckCircle className="size-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">No Shows</p>
                <p className="text-2xl font-bold text-destructive">{stats.noShowsToday}</p>
              </div>
              <Users className="size-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Queues</TabsTrigger>
          <TabsTrigger value="departments">By Department</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Queue Status</CardTitle>
                <div className="flex gap-2">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md"
                  >
                    <option value="all">All Services</option>
                    {services.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      placeholder="Search patients..."
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
                {filteredQueues
                  .sort((a, b) => {
                    // Sort by priority first, then by queue number
                    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
                    const aPriority = priorityOrder[a.priority];
                    const bPriority = priorityOrder[b.priority];
                    
                    if (aPriority !== bPriority) {
                      return aPriority - bPriority;
                    }
                    return a.queueNumber - b.queueNumber;
                  })
                  .map((queue, index) => (
                    <motion.div
                      key={queue.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-6 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Queue #</p>
                            <p className="text-lg font-bold text-[#38bdf8]">{queue.queueNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Patient</p>
                            <p className="text-sm font-medium text-gray-900">{queue.patientName}</p>
                            <p className="text-xs text-muted-foreground">{queue.patientId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Department</p>
                            <p className="text-sm text-gray-900">{queue.department}</p>
                            <p className="text-xs text-muted-foreground">{queue.service}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Priority</p>
                            <Badge className={getPriorityColor(queue.priority)}>
                              {queue.priority}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <Badge className={getStatusColor(queue.status)}>
                              {queue.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Wait Time</p>
                            <p className="text-sm font-medium text-gray-900">
                              {getWaitTime(queue.joinedTime)}m
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {queue.status === 'waiting' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleCallNext(queue.department, queue.service)}
                                className="bg-[#38bdf8] hover:bg-[#0ea5e9]"
                              >
                                Call
                              </Button>
                              <select
                                value={queue.priority}
                                onChange={(e) => handleChangePriority(queue.id, e.target.value as QueueItem['priority'])}
                                className="px-2 py-1 text-xs border border-border rounded"
                              >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </>
                          )}
                          {queue.status === 'called' && (
                            <Button
                              size="sm"
                              onClick={() => handleStartService(queue.id)}
                              className="bg-primary hover:bg-green-700"
                            >
                              <Play className="size-4 mr-1" />
                              Start
                            </Button>
                          )}
                          {queue.status === 'in_service' && (
                            <Button
                              size="sm"
                              onClick={() => handleCompleteService(queue.id)}
                              className="bg-primary hover:bg-purple-700"
                            >
                              <CheckCircle className="size-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkNoShow(queue.id)}
                          >
                            No Show
                          </Button>
                        </div>
                      </div>
                      {queue.notes && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground">Notes:</p>
                          <p className="text-sm text-gray-900">{queue.notes}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                {filteredQueues.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No patients in queue
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(department => {
              const deptQueues = queues.filter(q => 
                q.department === department && 
                (q.status === 'waiting' || q.status === 'called' || q.status === 'in_service')
              );
              
              return (
                <Card key={department}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{department}</CardTitle>
                      <Badge variant="outline">{deptQueues.length} waiting</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {services.map(service => {
                        const serviceQueues = deptQueues.filter(q => q.service === service);
                        if (serviceQueues.length === 0) return null;
                        
                        return (
                          <div key={service} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="text-sm">{service}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{serviceQueues.length}</Badge>
                              <Button
                                size="sm"
                                onClick={() => handleCallNext(department, service)}
                                className="bg-[#38bdf8] hover:bg-[#0ea5e9]"
                              >
                                Call Next
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      {deptQueues.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No patients waiting</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Queue History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queues
                  .filter(q => q.status === 'completed' || q.status === 'no_show')
                  .slice(0, 20)
                  .map((queue) => (
                    <div key={queue.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div className="flex-1 grid grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm font-medium">{queue.patientName}</p>
                          <p className="text-xs text-muted-foreground">{queue.patientId}</p>
                        </div>
                        <div>
                          <p className="text-sm">{queue.department}</p>
                          <p className="text-xs text-muted-foreground">{queue.service}</p>
                        </div>
                        <div>
                          <Badge className={getStatusColor(queue.status)}>
                            {queue.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm">{queue.actualWaitTime || 0}m wait</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {queue.completedTime ? new Date(queue.completedTime).toLocaleTimeString() : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add to Queue Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Patient to Queue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input
                  value={queueForm.patientName || ''}
                  onChange={(e) => setQueueForm({ ...queueForm, patientName: e.target.value })}
                  placeholder="Enter patient name"
                />
              </div>
              <div className="space-y-2">
                <Label>Patient ID</Label>
                <Input
                  value={queueForm.patientId || ''}
                  onChange={(e) => setQueueForm({ ...queueForm, patientId: e.target.value })}
                  placeholder="Enter patient ID"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <select
                  value={queueForm.department || ''}
                  onChange={(e) => setQueueForm({ ...queueForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <select
                  value={queueForm.service || ''}
                  onChange={(e) => setQueueForm({ ...queueForm, service: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select Service</option>
                  {services.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <select
                  value={queueForm.priority || 'normal'}
                  onChange={(e) => setQueueForm({ ...queueForm, priority: e.target.value as QueueItem['priority'] })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Appointment ID (Optional)</Label>
                <Input
                  value={queueForm.appointmentId || ''}
                  onChange={(e) => setQueueForm({ ...queueForm, appointmentId: e.target.value })}
                  placeholder="Enter appointment ID"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <textarea
                value={queueForm.notes || ''}
                onChange={(e) => setQueueForm({ ...queueForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md h-20 resize-none"
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToQueue} disabled={loading} className="bg-[#38bdf8] hover:bg-[#0ea5e9]">
              {loading ? 'Adding...' : 'Add to Queue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

