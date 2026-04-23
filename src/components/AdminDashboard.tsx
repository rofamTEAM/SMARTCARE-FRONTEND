import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWebSocket } from '../hooks/useWebSocket';
import { 
  Users, Calendar, Stethoscope, Pill, TestTube, 
  Droplet, FileText, Settings, BarChart3, 
  UserPlus, Activity, Clock, DollarSign, Search,
  Truck, Database, AlertTriangle, TrendingUp, Bed
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { dashboardService } from '../services/dashboard.service';
import { PatientManagement } from './PatientManagement';
import { AppointmentsPage } from './AppointmentsPage';
import { DoctorManagement } from './DoctorManagement';
import { BloodBankManagement } from './BloodBankManagement';
import { PathologyManagement } from './PathologyManagement';
import { RadiologyManagement } from './RadiologyManagement';
import { BillingManagement } from './BillingManagement';
import { ReportsManagement } from './ReportsManagement';
import { SystemSettings } from './SystemSettings';
import { BackupManagement } from './BackupManagement';
import { ChangePassword } from './ChangePassword';
import { SearchPatients } from './SearchPatients';
import { ExpenseManagement } from './ExpenseManagement';
import { IncomeManagement } from './IncomeManagement';
import { AmbulanceManagement } from './AmbulanceManagement';
import { OperationTheatreManagement } from './OperationTheatreManagement';
import { StaffManagement } from './StaffManagement';
import { PayrollManagement } from './PayrollManagement';
import { AttendanceManagement } from './AttendanceManagement';
import { BedManagement } from './BedManagement';
import { DepartmentManagement } from './DepartmentManagement';
import { EmergencyManagement } from './EmergencyManagement';
import { InpatientManagement } from './InpatientManagement';
import { OutpatientManagement } from './OutpatientManagement';
import { VisitorManagement } from './VisitorManagement';
import { WorkflowManagement } from './WorkflowManagementNew';
import { QueueManagement } from './QueueManagementNew';
import { UserManagement } from './UserManagementNew';
import { TodoListWidget } from './TodoListWidget';

interface AdminDashboardProps {
  session: any;
}

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  activeDoctors: number;
  pendingBills: number;
  bloodUnits: number;
  pendingTests: number;
  revenue: number;
  bedOccupancy: number;
}

export function AdminDashboard({ session }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    activeDoctors: 0,
    pendingBills: 0,
    bloodUnits: 0,
    pendingTests: 0,
    revenue: 0,
    bedOccupancy: 0
  });

  // WebSocket listeners for real-time updates
  const handlePatientCreated = useCallback((data: any) => {
    console.log('📊 Patient created event received, refreshing stats...');
    fetchDashboardStats();
    fetchRecentActivities();
  }, []);

  const handlePatientUpdated = useCallback((data: any) => {
    console.log('📊 Patient updated event received, refreshing stats...');
    fetchDashboardStats();
    fetchRecentActivities();
  }, []);

  const handlePatientDeleted = useCallback((data: any) => {
    console.log('📊 Patient deleted event received, refreshing stats...');
    fetchDashboardStats();
    fetchRecentActivities();
  }, []);

  // Initialize WebSocket connection
  const { isConnected } = useWebSocket({
    userId: session?.id,
    role: session?.role,
    onPatientCreated: handlePatientCreated,
    onPatientUpdated: handlePatientUpdated,
    onPatientDeleted: handlePatientDeleted,
    enabled: true
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivities();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats({
        totalPatients: data.totalPatients ?? 0,
        todayAppointments: data.todayAppointments ?? 0,
        activeDoctors: data.activeDoctors ?? 0,
        pendingBills: data.pendingBills ?? 0,
        bloodUnits: data.bloodUnits ?? 0,
        pendingTests: data.pendingTests ?? 0,
        revenue: data.totalRevenue ?? data.totalIncome ?? 0,
        bedOccupancy: data.bedOccupancy ?? 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // keep default zeros
    }
  };

  // Sample data for charts
  const weeklyData = [
    { day: 'Mon', patients: 45, revenue: 12000, appointments: 32 },
    { day: 'Tue', patients: 52, revenue: 15000, appointments: 38 },
    { day: 'Wed', patients: 48, revenue: 13500, appointments: 35 },
    { day: 'Thu', patients: 61, revenue: 18000, appointments: 42 },
    { day: 'Fri', patients: 55, revenue: 16500, appointments: 40 },
    { day: 'Sat', patients: 38, revenue: 11000, appointments: 28 },
    { day: 'Sun', patients: 25, revenue: 8000, appointments: 20 },
  ];

  const departmentData = [
    { name: 'Cardiology', patients: 120, color: 'hsl(var(--primary))' },
    { name: 'Neurology', patients: 95, color: 'hsl(var(--primary))' },
    { name: 'Orthopedics', patients: 85, color: 'hsl(var(--primary))' },
    { name: 'Pediatrics', patients: 75, color: 'hsl(var(--primary))' },
    { name: 'General', patients: 65, color: 'hsl(var(--destructive))' },
  ];

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const activities = await dashboardService.getRecentActivities();
      const formattedActivities = activities.map((activity: any) => {
        const icon = activity.type === 'patient_registration' ? Users : Calendar;
        return {
          action: activity.description,
          time: formatTimeAgo(activity.timestamp),
          type: activity.type === 'patient_registration' ? 'patient' : 'appointment',
          icon: icon
        };
      });
      
      setRecentActivities(formattedActivities.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      setRecentActivities([]);
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour ago`;
    return `${Math.floor(seconds / 86400)} day ago`;
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-primary',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'bg-primary',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Active Doctors',
      value: stats.activeDoctors,
      icon: Stethoscope,
      color: 'bg-primary',
      change: '+2%',
      changeType: 'positive'
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue.toFixed(0)}`,
      icon: DollarSign,
      color: 'bg-accent',
      change: '+15%',
      changeType: 'positive'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="size-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Hospital management overview and analytics</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Live Sync' : 'Offline'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-foreground mb-2">{stat.value}</h3>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="size-4 text-primary" />
                        <span className="text-sm text-primary">{stat.change}</span>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`${stat.color} p-3 rounded-xl`}
                    >
                      <Icon className="size-6 text-primary-foreground" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Units</p>
                    <p className="text-2xl font-bold">{stats.bloodUnits}</p>
                  </div>
                  <Droplet className="size-8 text-destructive" />
                </div>
                <Progress value={75} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-1">75% of target</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Tests</p>
                    <p className="text-2xl font-bold">{stats.pendingTests}</p>
                  </div>
                  <TestTube className="size-8 text-primary" />
                </div>
                <Badge variant="outline" className="mt-3 border-accent text-accent">
                  {stats.pendingTests > 10 ? 'High' : 'Normal'} Load
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bed Occupancy</p>
                    <p className="text-2xl font-bold">{stats.bedOccupancy}%</p>
                  </div>
                  <Bed className="size-8 text-primary" />
                </div>
                <Progress value={stats.bedOccupancy} className="mt-3" />
                <p className="text-xs text-muted-foreground mt-1">{100 - stats.bedOccupancy}% available</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Bills</p>
                    <p className="text-2xl font-bold">{stats.pendingBills}</p>
                  </div>
                  <FileText className="size-8 text-primary" />
                </div>
                <Badge variant="outline" className="mt-3 border-destructive text-destructive">
                  Needs Attention
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-20 flex flex-col items-center justify-center bg-primary hover:bg-primary/90 text-card-foreground">
                    <UserPlus className="h-6 w-6 mb-2" />
                    Add Patient
                  </Button>
                  <Button className="h-20 flex flex-col items-center justify-center bg-primary hover:bg-primary/90 text-card-foreground">
                    <Clock className="h-6 w-6 mb-2" />
                    Schedule Appointment
                  </Button>
                  <Button className="h-20 flex flex-col items-center justify-center bg-primary hover:bg-primary/90 text-card-foreground">
                    <Pill className="h-6 w-6 mb-2" />
                    Manage Pharmacy
                  </Button>
                  <Button className="h-20 flex flex-col items-center justify-center bg-primary hover:bg-primary/90 text-card-foreground">
                    <FileText className="h-6 w-6 mb-2" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Todo List Widget */}
            <TodoListWidget session={session} maxItems={4} />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Trends */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Weekly Patient Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="patients" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Trends */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Weekly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Appointments Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Weekly Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Department Patient Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="patients"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {departmentData.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept.color }} />
                        <span className="font-medium">{dept.name}</span>
                      </div>
                      <Badge variant="outline">{dept.patients} patients</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="bg-primary p-2 rounded-lg">
                        <Icon className="size-5 text-card-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {activity.type}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


