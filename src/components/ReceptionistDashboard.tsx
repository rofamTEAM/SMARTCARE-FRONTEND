import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Users,
  UserPlus,
  CalendarPlus,
  FileText,
  DollarSign,
  ClipboardList,
  UserCheck,
  Activity,
  ArrowRight,
  Clock,
  Phone,
  MessageSquare,
  Bell,
  Search,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { TodoListWidget } from './TodoListWidget';
import { appointmentsService } from '../services/appointments.service';
import { frontofficeService } from '../services/frontoffice.service';
import { patientsService } from '../services/patients.service';
import { toast } from 'sonner';
import { errorHandler } from '../utils/errorHandler';

interface ReceptionistDashboardProps {
  session: any;
}

interface DashboardStats {
  todayRegistrations: number;
  todayAppointments: number;
  currentPatients: number;
  emergencyArrivals: number;
  registered: number;
  inQueue: number;
  inConsultation: number;
  labPharmacy: number;
  completed: number;
}

interface QueueData {
  department: string;
  waiting: number;
  avgWait: string;
}

interface AppointmentData {
  time: string;
  patient: string;
  doctor: string;
  department: string;
  status: string;
}

interface VisitorData {
  name: string;
  visiting: string;
  time: string;
  status: string;
}

export function ReceptionistDashboard({ session }: ReceptionistDashboardProps) {
  const userName = session?.name || 'Receptionist';
  const [stats, setStats] = useState<DashboardStats>({
    todayRegistrations: 0,
    todayAppointments: 0,
    currentPatients: 0,
    emergencyArrivals: 0,
    registered: 0,
    inQueue: 0,
    inConsultation: 0,
    labPharmacy: 0,
    completed: 0,
  });
  const [queueStatus, setQueueStatus] = useState<QueueData[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentData[]>([]);
  const [recentVisitors, setRecentVisitors] = useState<VisitorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Fetch appointments
      const appointments = await appointmentsService.getAll();
      const todayAppts = appointments.filter(a => a.appointmentDate === today);
      
      // Fetch visitors
      const visitors = await frontofficeService.getVisitors();
      const todayVisitors = visitors.filter(v => v.visitDate === today);

      // Fetch patients
      const patientsData = await patientsService.getAll();
      const patientCount = Array.isArray(patientsData) ? patientsData.length : patientsData.data?.length || 0;

      // Calculate stats
      const scheduled = appointments.filter(a => a.status === 'scheduled').length;
      const completed = appointments.filter(a => a.status === 'completed').length;
      const inProgress = appointments.filter(a => a.status === 'scheduled' && a.appointmentDate === today).length;

      setStats({
        todayRegistrations: todayAppts.length,
        todayAppointments: todayAppts.length,
        currentPatients: patientCount,
        emergencyArrivals: Math.floor(Math.random() * 5), // This would come from a dedicated endpoint
        registered: patientCount,
        inQueue: scheduled,
        inConsultation: inProgress,
        labPharmacy: Math.floor(scheduled * 0.3),
        completed: completed,
      });

      // Format appointments for display
      const formattedAppts: AppointmentData[] = todayAppts.slice(0, 5).map(apt => ({
        time: apt.appointmentTime,
        patient: apt.patientId,
        doctor: apt.doctorId,
        department: 'General', // Would need to fetch from doctor details
        status: apt.status === 'scheduled' ? 'Confirmed' : apt.status === 'completed' ? 'Completed' : 'Waiting',
      }));
      setTodayAppointments(formattedAppts);

      // Format visitors for display
      const formattedVisitors: VisitorData[] = todayVisitors.slice(0, 3).map(v => ({
        name: v.name,
        visiting: `${v.patientId} (Room TBD)`,
        time: new Date(v.visitTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Active',
      }));
      setRecentVisitors(formattedVisitors);

      // Calculate queue status by department (mock departments)
      const departments = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics'];
      const queueData: QueueData[] = departments.map(dept => ({
        department: dept,
        waiting: Math.floor(Math.random() * 15),
        avgWait: `${Math.floor(Math.random() * 30) + 10} min`,
      }));
      setQueueStatus(queueData);
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Today's overview stats for receptionist
  const todayStats = [
    {
      label: "Today's Registrations",
      value: stats.todayRegistrations,
      icon: UserPlus,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: "Today's Appointments",
      value: stats.todayAppointments,
      icon: CalendarIcon,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Current Patients',
      value: stats.currentPatients,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Emergency Arrivals',
      value: stats.emergencyArrivals,
      icon: Activity,
      color: 'from-red-500 to-red-600',
    },
  ];

  // Front office quick actions
  const frontOfficeActions = [
    {
      title: 'Patient Registration',
      description: 'Register new patients',
      icon: UserPlus,
      color: 'bg-primary',
      action: 'register',
    },
    {
      title: 'New Appointment',
      description: 'Schedule appointments',
      icon: CalendarPlus,
      color: 'bg-primary',
      action: 'appointment',
    },
    {
      title: 'Generate Invoice',
      description: 'Create billing invoice',
      icon: FileText,
      color: 'bg-primary',
      action: 'invoice',
    },
    {
      title: 'Admit Patient',
      description: 'Patient admission process',
      icon: UserCheck,
      color: 'bg-primary',
      action: 'admit',
    },
    {
      title: 'OPD Queue',
      description: 'Outpatient department',
      icon: ClipboardList,
      color: 'bg-pink-500',
      action: 'opd',
    },
    {
      title: 'Billing Center',
      description: 'Payment & transactions',
      icon: DollarSign,
      color: 'bg-primary',
      action: 'billing',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-gray-900">Hello, {userName} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome to your reception desk. Here's today's overview and quick actions.
        </p>
      </motion.div>

      {/* Today's Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {todayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl`}>
                      <Icon className="size-6 text-card-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-gray-900">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Patient Workflow Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Patient Workflow Status</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Real-time patient journey tracking</p>
              </div>
              <Activity className="size-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <UserPlus className="size-6 text-card-foreground" />
                </div>
                <p className="text-2xl text-primary mb-1">{stats.registered}</p>
                <p className="text-xs text-muted-foreground">Registered</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <CalendarIcon className="size-6 text-card-foreground" />
                </div>
                <p className="text-2xl text-primary mb-1">{stats.inQueue}</p>
                <p className="text-xs text-muted-foreground">In Queue</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Activity className="size-6 text-card-foreground" />
                </div>
                <p className="text-2xl text-yellow-600 mb-1">{stats.inConsultation}</p>
                <p className="text-xs text-muted-foreground">In Consultation</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileText className="size-6 text-card-foreground" />
                </div>
                <p className="text-2xl text-primary mb-1">{stats.labPharmacy}</p>
                <p className="text-xs text-muted-foreground">Lab/Pharmacy</p>
              </div>
              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="size-6 text-card-foreground" />
                </div>
                <p className="text-2xl text-primary mb-1">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Front Office Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Front Office - Quick Actions</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Common reception operations for faster workflow</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {frontOfficeActions.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.action}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all group"
                  >
                    <div className={`${item.color} p-3 rounded-lg text-card-foreground`}>
                      <Icon className="size-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="text-sm text-gray-900 mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* OPD Queue Management */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>OPD Queue Status</CardTitle>
              <p className="text-sm text-muted-foreground">Current waiting patients by department</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queueStatus.map((queue, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-900">{queue.department}</p>
                      <p className="text-xs text-muted-foreground">Avg wait: {queue.avgWait}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg text-primary">{queue.waiting}</p>
                      <p className="text-xs text-muted-foreground">waiting</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Appointments */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <p className="text-sm text-muted-foreground">Scheduled appointments for today</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayAppointments.map((apt, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground w-16">{apt.time}</div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{apt.patient}</p>
                      <p className="text-xs text-muted-foreground">{apt.doctor} • {apt.department}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      apt.status === 'Confirmed' ? 'bg-green-100 text-primary' :
                      apt.status === 'Waiting' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-primary'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Todo List Widget */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <TodoListWidget session={session} maxItems={4} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Search & Lookup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Patient Search & Lookup</CardTitle>
              <p className="text-sm text-muted-foreground">Quick patient information access</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    placeholder="Search by name, phone, or patient ID..."
                    className="pl-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <Phone className="size-4 mr-2" />
                    Call Patient
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <MessageSquare className="size-4 mr-2" />
                    Send SMS
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <MapPin className="size-4 mr-2" />
                    Patient Location
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Bell className="size-4 mr-2" />
                    Notifications
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Visitor Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Visitor Management</CardTitle>
                  <p className="text-sm text-muted-foreground">Recent visitor registrations</p>
                </div>
                <Button size="sm">
                  <UserPlus className="size-4 mr-2" />
                  Register Visitor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentVisitors.map((visitor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-900">{visitor.name}</p>
                      <p className="text-xs text-muted-foreground">Visiting: {visitor.visiting}</p>
                      <p className="text-xs text-muted-foreground">{visitor.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      visitor.status === 'Active' 
                        ? 'bg-green-100 text-primary' 
                        : 'bg-muted text-foreground'
                    }`}>
                      {visitor.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

