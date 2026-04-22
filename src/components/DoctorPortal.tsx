import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Clock,
  FileText,
  Activity,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Video,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { TodoListWidget } from './TodoListWidget';
import { appointmentsService } from '@/services/appointments.service';

interface DoctorPortalProps {
  session: any;
}

export function DoctorPortal({ session }: DoctorPortalProps) {
  const doctorName = session?.name || 'Doctor';
  const doctorId = session?.id;
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState([
    { label: 'Today\'s Appointments', value: '0', icon: Calendar, color: 'bg-primary' },
    { label: 'Patients Treated', value: '0', icon: Users, color: 'bg-primary' },
    { label: 'Pending Consultations', value: '0', icon: Clock, color: 'bg-amber-500' },
    { label: 'Lab Reports', value: '0', icon: FileText, color: 'bg-primary' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorAppointments();
  }, [doctorId]);

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch all appointments and filter by doctor
      const appointments = await appointmentsService.getAll();
      
      // Filter appointments for this doctor
      const doctorAppointments = appointments.filter(apt => 
        apt.doctorId === doctorId || apt.doctorId === doctorName
      );
      
      // Get today's appointments
      const todayAppts = doctorAppointments.filter(apt => apt.appointmentDate === today);
      
      // Format appointments for display
      const formattedAppts = todayAppts.map(apt => ({
        id: apt.id,
        time: apt.appointmentTime,
        patient: apt.patientId,
        type: apt.reason || 'Consultation',
        status: apt.status === 'scheduled' ? 'scheduled' : apt.status === 'completed' ? 'completed' : 'in-progress',
      }));
      
      setTodayAppointments(formattedAppts);
      
      // Update stats
      const completed = doctorAppointments.filter(a => a.status === 'completed').length;
      const scheduled = doctorAppointments.filter(a => a.status === 'scheduled').length;
      
      setStats([
        { label: 'Today\'s Appointments', value: todayAppts.length.toString(), icon: Calendar, color: 'bg-primary' },
        { label: 'Patients Treated', value: completed.toString(), icon: Users, color: 'bg-primary' },
        { label: 'Pending Consultations', value: scheduled.toString(), icon: Clock, color: 'bg-amber-500' },
        { label: 'Lab Reports', value: '15', icon: FileText, color: 'bg-primary' },
      ]);
    } catch (error) {
      console.error('Failed to fetch doctor appointments:', error);
      setTodayAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const recentPatients = [
    { id: '1', name: 'John Smith', diagnosis: 'Hypertension', lastVisit: '2 hours ago', status: 'stable' },
    { id: '2', name: 'Sarah Johnson', diagnosis: 'Diabetes Type 2', lastVisit: '1 day ago', status: 'monitoring' },
    { id: '3', name: 'Michael Brown', diagnosis: 'Asthma', lastVisit: '3 days ago', status: 'improved' },
    { id: '4', name: 'Emily Davis', diagnosis: 'Migraine', lastVisit: '1 week ago', status: 'stable' },
  ];

  const pendingReports = [
    { id: '1', patient: 'John Smith', test: 'Blood Test', ordered: '2 hours ago', priority: 'high' },
    { id: '2', patient: 'Sarah Johnson', test: 'X-Ray Chest', ordered: '5 hours ago', priority: 'normal' },
    { id: '3', patient: 'Michael Brown', test: 'ECG', ordered: '1 day ago', priority: 'urgent' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-card-foreground"
      >
        <h1 className="text-2xl mb-2">Welcome back, Dr. {doctorName}</h1>
        <p className="text-card-foreground/90">You have 4 appointments scheduled for today</p>
      </motion.div>

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
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                Today&apos;s Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm text-primary">{appointment.time}</div>
                      </div>
                      <div>
                        <p className="text-gray-900">{appointment.patient}</p>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          appointment.status === 'completed'
                            ? 'default'
                            : appointment.status === 'in-progress'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={
                          appointment.status === 'completed'
                            ? 'bg-green-100 text-primary'
                            : appointment.status === 'in-progress'
                            ? 'bg-amber-100 text-amber-700'
                            : ''
                        }
                      >
                        {appointment.status}
                      </Badge>
                      {appointment.status === 'scheduled' && (
                        <Button size="sm" variant="outline">
                          <Video className="size-4 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                Recent Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <motion.div
                    key={patient.id}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
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
                        <p className="text-gray-900">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.diagnosis}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{patient.lastVisit}</p>
                      <Badge
                        variant="outline"
                        className={
                          patient.status === 'stable'
                            ? 'border-primary text-primary'
                            : patient.status === 'improved'
                            ? 'border-primary text-primary'
                            : 'border-amber-500 text-amber-700'
                        }
                      >
                        {patient.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Todo List Widget */}
          <TodoListWidget session={session} maxItems={3} />

          {/* Pending Lab Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5 text-primary" />
                Pending Lab Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-gray-900">{report.patient}</p>
                      <Badge
                        variant="outline"
                        className={
                          report.priority === 'urgent'
                            ? 'border-destructive text-destructive'
                            : report.priority === 'high'
                            ? 'border-amber-500 text-amber-700'
                            : 'border-gray-500 text-foreground'
                        }
                      >
                        {report.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.test}</p>
                    <p className="text-xs text-muted-foreground mt-1">{report.ordered}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Reports
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="size-4 mr-2" />
                Write Prescription
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="size-4 mr-2" />
                Order Lab Test
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="size-4 mr-2" />
                Patient Messages
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="size-4 mr-2" />
                Manage Schedule
              </Button>
              <Button className="w-full justify-start bg-primary text-card-foreground hover:bg-primary/90">
                <Activity className="size-4 mr-2" />
                Patient Workflow
              </Button>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Patients Treated</span>
                <span className="text-sm text-gray-900">142</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Consultations</span>
                <span className="text-sm text-gray-900">168</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <span className="text-sm text-primary">96.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Patient Satisfaction</span>
                <span className="text-sm text-primary">4.8/5.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



