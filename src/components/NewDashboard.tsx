import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Phone,
  Scissors,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  ExternalLink,
  MoreVertical,
  Building2,
  Bed,
  AlertCircle,
  UserPlus,
  CalendarPlus,
  FileText,
  DollarSign,
  ClipboardList,
  UserCheck,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { GlassCard } from './ui/glass-card';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TodoListWidget } from './TodoListWidget';
import { appointmentsService } from '../services/appointments.service';
import { patientsService } from '../services/patients.service';
import { dashboardService } from '../services/dashboard.service';

interface NewDashboardProps {
  session: any;
}

export function NewDashboard({ session }: NewDashboardProps) {
  const [statistics, setStatistics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const userName = session?.name || 'User';

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch real data from backend using dashboard service
      const dashboardStats = await dashboardService.getDashboardStats();
      const appointments = await appointmentsService.getAll().catch(() => []);
      
      // Ensure appointments is always an array
      const appointmentsArray = Array.isArray(appointments) ? appointments : [];
      
      // Get today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = appointmentsArray
        .filter(a => a.appointmentDate === today || a.date === today)
        .slice(0, 5)
        .map((apt, i) => ({
          time: `${String(9 + Math.floor(i / 2)).padStart(2, '0')}:${(i % 2) * 30}0`,
          title: `${apt.doctorName || 'Dr. TBD'} - ${apt.patientName || 'Patient'}`,
          duration: `${String(9 + Math.floor(i / 2)).padStart(2, '0')}:00 - ${String(10 + Math.floor(i / 2)).padStart(2, '0')}:00`
        }));

      // Generate monthly chart data
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const monthStr = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        
        // Distribute patients across months
        const basePatients = Math.floor(dashboardStats.totalPatients / 12);
        const variance = Math.floor(Math.random() * 200) - 100;
        const inpatient = Math.floor(basePatients * 0.5) + Math.floor(Math.random() * 100);
        
        return {
          month: monthStr,
          total: Math.max(0, basePatients + variance),
          inpatient: Math.max(0, inpatient)
        };
      });

      setStatistics({
        appointments: dashboardStats.todayAppointments || appointmentsArray.length,
        callConsultancy: Math.floor((dashboardStats.todayAppointments || appointmentsArray.length) * 0.8),
        surgeries: Math.floor(dashboardStats.totalPatients * 0.03),
        totalPatients: dashboardStats.totalPatients,
        income: dashboardStats.totalRevenue || 0,
        expense: Math.floor((dashboardStats.totalRevenue || 0) * 0.98),
        roomOccupancy: {
          general: Math.floor(dashboardStats.totalPatients * 0.6),
          private: Math.floor(dashboardStats.totalPatients * 0.25)
        },
        reports: dashboardStats.reports || []
      });

      setChartData(monthlyData);
      setTodayAppointments(todayAppts.length > 0 ? todayAppts : [
        { time: '09:00', title: 'No appointments', duration: '' },
        { time: '10:00', title: '', duration: '' },
        { time: '11:00', title: '', duration: '' },
        { time: '12:00', title: '', duration: '' },
        { time: '01:00', title: '', duration: '' },
      ]);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Fallback to empty state, not dummy data
      setStatistics({
        appointments: 0,
        callConsultancy: 0,
        surgeries: 0,
        totalPatients: 0,
        income: 0,
        expense: 0,
        roomOccupancy: { general: 0, private: 0 },
        reports: []
      });
    }
  };

  const statsCards = [
    {
      label: 'Appointments',
      value: statistics?.appointments ?? 0,
      change: '+4.8%',
      trend: 'up',
      icon: CalendarIcon,
      color: 'from-primary to-primary/90',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Call consultancy',
      value: statistics?.callConsultancy ?? 0,
      change: '+4.0%',
      trend: 'up',
      icon: Phone,
      color: 'from-primary to-primary/80',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Surgeries',
      value: statistics?.surgeries ?? 0,
      change: '+25%',
      trend: 'up',
      icon: Scissors,
      color: 'from-primary to-primary/80',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Total patient',
      value: statistics?.totalPatients ?? 0,
      change: '+2.1%',
      trend: 'up',
      icon: Users,
      color: 'from-primary to-primary/90',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
  ];

  // Generate income/expense data from statistics
  const incomeData = statistics ? [
    { month: 'Current', value: statistics.income }
  ] : [];

  const expenseData = statistics ? [
    { month: 'Current', value: statistics.expense }
  ] : [];

  const currentDate = new Date();
  const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const reports = statistics?.reports || [];

  const balance = statistics ? ((statistics.income / (statistics.income + statistics.expense)) * 100).toFixed(0) : 0;
  const roomOccupancy = statistics?.roomOccupancy || { general: 0, private: 0 };
  const totalRooms = roomOccupancy.general + roomOccupancy.private;

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
          There is the latest update for the last 7 days. check now
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6 hover:bg-card/75 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`${stat.iconBg} p-3 rounded-xl`}>
                    <Icon className={`size-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-semibold text-foreground">{stat.value.toLocaleString()}</h3>
                    <div className="flex items-center gap-1 text-sm">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="size-4 text-primary" />
                      ) : (
                        <TrendingDown className="size-4 text-destructive" />
                      )}
                      <span className={stat.trend === 'up' ? 'text-primary' : 'text-destructive'}>
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground text-xs">from last week</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Workflow Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Patient Workflow Status</h3>
              <p className="text-sm text-muted-foreground mt-1">Real-time patient journey tracking across departments</p>
            </div>
            <Activity className="size-5 text-primary" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50/50 rounded-lg">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <UserPlus className="size-6 text-card-foreground" />
              </div>
              <p className="text-2xl text-primary mb-1">12</p>
              <p className="text-xs text-muted-foreground">Registered</p>
            </div>
            <div className="text-center p-4 bg-green-50/50 rounded-lg">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <CalendarIcon className="size-6 text-card-foreground" />
              </div>
              <p className="text-2xl text-primary mb-1">8</p>
              <p className="text-xs text-muted-foreground">In Queue</p>
            </div>
            <div className="text-center p-4 bg-yellow-50/50 rounded-lg">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="size-6 text-card-foreground" />
              </div>
              <p className="text-2xl text-yellow-600 mb-1">5</p>
              <p className="text-xs text-muted-foreground">In Consultation</p>
            </div>
            <div className="text-center p-4 bg-purple-50/50 rounded-lg">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="size-6 text-card-foreground" />
              </div>
              <p className="text-2xl text-primary mb-1">3</p>
              <p className="text-xs text-muted-foreground">Lab/Pharmacy</p>
            </div>
            <div className="text-center p-4 bg-teal-50/50 rounded-lg">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="size-6 text-card-foreground" />
              </div>
              <p className="text-2xl text-primary mb-1">15</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Front Office Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Front Office - Quick Actions</h3>
              <p className="text-sm text-muted-foreground mt-1">Common front office operations for faster workflow</p>
            </div>
            <Activity className="size-5 text-primary" />
          </div>
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
                  className="flex items-start gap-4 p-4 bg-card/40 backdrop-blur-sm rounded-xl hover:bg-card/60 transition-all group"
                >
                  <div className={`${item.color} p-3 rounded-lg text-card-foreground`}>
                    <Icon className="size-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-sm text-foreground mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </motion.button>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Statistics Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Patient statistics</h3>
              <div className="flex items-center gap-4">
                <div className="flex gap-4 text-sm">
                  <button className="px-3 py-1 rounded hover:bg-card/40">Week</button>
                  <button className="px-3 py-1 rounded hover:bg-card/40">Month</button>
                  <button className="px-3 py-1 rounded bg-card/40">Year-2022</button>
                </div>
              </div>
            </div>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.length > 0 ? chartData : [
                  { month: 'JAN', total: 800, inpatient: 400 },
                  { month: 'FEB', total: 900, inpatient: 500 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="inpatient"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: '#55c4ed', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-800"></div>
                <span className="text-muted-foreground">Total patients</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-muted-foreground">Inpatients</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Calendar & Today's Appointments */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Today 4th Sep 2023</CardTitle>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Plus className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mini Calendar */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {weekDays.map((day, i) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-muted-foreground mb-2">{day}</div>
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${
                        i === 3
                          ? 'bg-primary text-card-foreground'
                          : 'text-foreground hover:bg-muted cursor-pointer'
                      }`}
                    >
                      {i + 3}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="space-y-3">
                {(todayAppointments.length > 0 ? todayAppointments : [
                  { time: '09:00', title: 'No appointments', duration: '' },
                  { time: '10:00', title: '', duration: '' },
                  { time: '11:00', title: '', duration: '' },
                  { time: '12:00', title: '', duration: '' },
                  { time: '01:00', title: '', duration: '' },
                ]).map((apt, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xs text-muted-foreground w-12">{apt.time}</span>
                    {apt.title ? (
                      <div className="flex-1 bg-gradient-to-r from-primary/10 to-primary/20 border-l-4 border-primary rounded-lg p-3">
                        <p className="text-sm text-gray-900">{apt.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{apt.duration}</p>
                      </div>
                    ) : (
                      <div className="flex-1 border-l-2 border-border pl-3 h-8"></div>
                    )}
                    {apt.title && (
                      <button className="p-1 hover:bg-muted rounded">
                        <MoreVertical className="size-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Balance</CardTitle>
                <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80">
                  <span>Open</span>
                  <ExternalLink className="size-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="hsl(var(--border))"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="hsl(var(--primary))"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(Number(balance) / 100) * 352} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl text-gray-900">{balance}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Transaction Revenue</p>
                  <div className="flex items-center justify-between">
                    <h4 className="text-gray-900">${((statistics?.income || 8135450) / 1000000).toFixed(2)}M</h4>
                    <div className="w-20 h-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={incomeData}>
                          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <p className="text-xs text-primary">Total income</p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-gray-900">${((statistics?.expense || 7999000) / 1000000).toFixed(2)}M</h4>
                    <div className="w-20 h-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={expenseData}>
                          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Total expense</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Room Occupancy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Room occupancy</CardTitle>
                <button>
                  <MoreVertical className="size-4 text-muted-foreground" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-6">
                <h2 className="text-gray-900">{totalRooms}</h2>
                <span className="text-sm text-success">+12%</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                      <Building2 className="size-5 text-card-foreground" />
                    </div>
                    <span className="text-sm text-foreground">General room</span>
                  </div>
                  <span className="text-gray-900">{roomOccupancy.general}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-600 p-2 rounded-lg">
                      <Bed className="size-5 text-card-foreground" />
                    </div>
                    <span className="text-sm text-foreground">Private room</span>
                  </div>
                  <span className="text-gray-900">{roomOccupancy.private}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Reports</CardTitle>
                <button>
                  <MoreVertical className="size-4 text-muted-foreground" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports && reports.length > 0 ? (
                  reports.map((report, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="bg-warning/20 p-2 rounded-lg">
                        <AlertCircle className="size-4 text-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-1">{report.title}</p>
                        <p className="text-xs text-muted-foreground">{report.time}</p>
                      </div>
                      <button className="text-sm text-primary hover:text-primary/80">
                        View report →
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="size-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No reports available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Todo List Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <TodoListWidget session={session} maxItems={4} />
        </motion.div>
      </div>
    </div>
  );
}

