import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Calendar as CalendarIcon, Clock, Users, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { appointmentsService, Appointment } from '../services/appointments.service';
import { AutoFillButton } from './AutoFillButton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { VoiceAgent } from './VoiceAgent';
import { errorHandler } from '../utils/errorHandler';
import { useFormSubmit } from '../hooks/useFormSubmit';



interface AppointmentsPageProps {
  session: any;
}

export function AppointmentsPage({ session }: AppointmentsPageProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Appointment>>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { submit: submitAdd, loading: addLoading } = useFormSubmit({
    successMessage: 'Appointment scheduled successfully!',
    errorMessage: 'Failed to schedule appointment. Please try again.',
  });

  const { submit: submitDelete, loading: deleteLoading } = useFormSubmit({
    successMessage: 'Appointment deleted successfully!',
    errorMessage: 'Failed to delete appointment. Please try again.',
    showToast: false,
  });

  const loading = addLoading || deleteLoading;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentsService.getAll();
      // Ensure data is an array
      const appointmentsArray = Array.isArray(data) ? data : [];
      setAppointments(appointmentsArray);
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
      setAppointments([]);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment && (
      appointment.doctorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = [
    { 
      label: 'Total Appointments', 
      value: appointments.length.toString(), 
      icon: CalendarIcon, 
      color: 'bg-primary' 
    },
    { 
      label: 'Scheduled Today', 
      value: appointments.filter(a => a.appointmentDate === new Date().toISOString().split('T')[0]).length.toString(), 
      icon: Clock, 
      color: 'bg-amber-500' 
    },
    { 
      label: 'Completed', 
      value: appointments.filter(a => a.status === 'completed').length.toString(), 
      icon: CheckCircle, 
      color: 'bg-primary' 
    },
    { 
      label: 'Active Doctors', 
      value: new Set(appointments.map(a => a.doctorId)).size.toString(), 
      icon: Users, 
      color: 'bg-primary' 
    },
  ];

  // Chart data
  const statusData = [
    { name: 'Scheduled', value: appointments.filter(a => a.status === 'scheduled').length, color: 'hsl(var(--primary))' },
    { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: 'hsl(var(--primary))' },
    { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: 'hsl(var(--destructive))' },
  ];

  const handleAdd = async () => {
    if (!formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await submitAdd(async () => {
        const newAppointment = await appointmentsService.create({
          patientId: formData.patientId || 'temp-patient-id',
          doctorId: formData.doctorId,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          reason: formData.reason || 'General Consultation',
          notes: formData.notes
        });

        setAppointments([...appointments, newAppointment]);
        
        setFormData({});
        setIsAddModalOpen(false);
        
        return newAppointment;
      });
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      await submitDelete(async () => {
        await appointmentsService.delete(id);
        setAppointments(appointments.filter(appointment => appointment.id !== id));
        toast.success('Appointment deleted successfully!');
        return null;
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CalendarIcon className="size-8 text-primary" />
          Appointment Management
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-muted-foreground">Schedule and manage patient appointments</p>
          <VoiceAgent department="appointments" userRole={session?.role || 'receptionist'} />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
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
        {/* Main Appointments List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Appointments</CardTitle>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => setFormData({})}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="size-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Schedule New Appointment</DialogTitle>
                      <DialogDescription>
                        Fill in the details to schedule a new appointment.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mb-2">
                      <AutoFillButton
                        formType="appointment"
                        onFill={(data) => setFormData({ ...formData, ...data })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="doctorId">Doctor ID</Label>
                        <Input
                          id="doctorId"
                          value={formData.doctorId || ''}
                          onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                          placeholder="Enter doctor ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appointmentDate">Date</Label>
                        <Input
                          id="appointmentDate"
                          type="date"
                          value={formData.appointmentDate || ''}
                          onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appointmentTime">Time</Label>
                        <Input
                          id="appointmentTime"
                          type="time"
                          value={formData.appointmentTime || ''}
                          onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status || 'scheduled'} onValueChange={(value) => setFormData({ ...formData, status: value as 'scheduled' | 'completed' | 'cancelled' | 'no-show' })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no-show">No Show</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="reason">Reason for Visit</Label>
                        <Input
                          id="reason"
                          value={formData.reason || ''}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          placeholder="Enter reason for appointment"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          value={formData.notes || ''}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Enter appointment notes"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAdd}
                        disabled={loading || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {loading ? 'Scheduling...' : 'Schedule'} Appointment
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-primary p-3 rounded-xl text-card-foreground">
                          <CalendarIcon className="size-6" />
                        </div>
                      <div className="grid grid-cols-4 gap-4 flex-1">
                          <div>
                            <p className="text-xs text-muted-foreground">Doctor</p>
                            <p className="text-sm text-gray-900">{appointment.doctorId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Date & Time</p>
                            <p className="text-sm text-gray-900">{appointment.appointmentDate} {appointment.appointmentTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <Badge
                              variant="outline"
                              className={
                                appointment.status === 'scheduled' ? 'border-amber-500 text-amber-700 bg-amber-50' :
                                appointment.status === 'completed' ? 'border-primary text-primary bg-green-50' :
                                'border-destructive text-destructive bg-red-50'
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(appointment.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-3 ml-16">
                        <p className="text-xs text-muted-foreground">Notes:</p>
                        <p className="text-sm text-gray-900">{appointment.notes}</p>
                      </div>
                    )}
                  </motion.div>
                ))}

                {filteredAppointments.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No appointments found. Click "Schedule Appointment" to create one.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Statistics */}
        <div className="space-y-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <CalendarIcon className="size-4 mr-2" />
                View Calendar
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="size-4 mr-2" />
                Today's Schedule
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="size-4 mr-2" />
                Doctor Availability
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


