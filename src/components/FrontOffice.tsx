import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, ClipboardList, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PatientRegistration } from './PatientRegistration';
import { VisitorManagement } from './VisitorManagement';
import { QueueManagement } from './QueueManagement';
import { VoiceAgent } from './VoiceAgent';
import { frontofficeService } from '../services/frontoffice.service';
import { toast } from 'sonner';
import { errorHandler } from '../utils/errorHandler';

interface FrontOfficeProps {
  session: any;
}

export function FrontOffice({ session }: FrontOfficeProps) {
  const [stats, setStats] = useState({
    todayRegistrations: 0,
    activeVisitors: 0,
    queueLength: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch appointments to calculate stats
      const appointments = await frontofficeService.getAppointments();
      const visitors = await frontofficeService.getVisitors();
      
      const today = new Date().toISOString().split('T')[0];
      
      setStats({
        todayRegistrations: appointments.filter(a => a.appointmentDate === today).length,
        activeVisitors: visitors.filter(v => v.visitDate === today).length,
        queueLength: appointments.filter(a => a.status === 'scheduled').length,
        completedToday: appointments.filter(a => a.status === 'completed' && a.appointmentDate === today).length,
      });
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Today Registrations', value: stats.todayRegistrations, icon: UserPlus, color: 'bg-primary' },
    { title: 'Active Visitors', value: stats.activeVisitors, icon: Users, color: 'bg-success' },
    { title: 'Queue Length', value: stats.queueLength, icon: Clock, color: 'bg-warning' },
    { title: 'Completed Today', value: stats.completedToday, icon: CheckCircle, color: 'bg-primary' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-gray-900">Front Office Management</h1>
          <VoiceAgent department="front-office" userRole={session?.role || 'receptionist'} />
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl mt-2">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-xl text-card-foreground`}>
                        <Icon className="size-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="registration" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="registration">Patient Registration</TabsTrigger>
                <TabsTrigger value="visitors">Visitor Management</TabsTrigger>
                <TabsTrigger value="queue">Queue Management</TabsTrigger>
              </TabsList>
              <TabsContent value="registration">
                <PatientRegistration session={session} onUpdate={fetchStats} />
              </TabsContent>
              <TabsContent value="visitors">
                <VisitorManagement session={session} onUpdate={fetchStats} />
              </TabsContent>
              <TabsContent value="queue">
                <QueueManagement session={session} onUpdate={fetchStats} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


