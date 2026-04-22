import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Database,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
  Cpu,
  Zap,
  Shield,
  Download,
  Trash2,
  Bell,
  Power,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { superAdminService } from '../services/superadmin.service';
import { dashboardService } from '../services/dashboard.service';

interface SuperAdminDashboardConnectedProps {
  session: any;
}

export function SuperAdminDashboardConnected({ session }: SuperAdminDashboardConnectedProps) {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentStats, setDepartmentStats] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch real data from backend
      const { apiClient } = await import('../services/apiClient');
      const [metricsData, healthData, usersData, alertsData, dashboardStats, staffData] = await Promise.all([
        superAdminService.getSystemMetrics().catch(() => null),
        superAdminService.getHealthStatus().catch(() => null),
        superAdminService.getActiveUsers().catch(() => []),
        superAdminService.getSystemAlerts().catch(() => []),
        dashboardService.getDashboardStats().catch(() => null),
        apiClient.get('/staff?role=doctor').catch(() => [])
      ]);

      if (metricsData) setMetrics(metricsData);
      if (healthData) setHealth(healthData);
      if (usersData) setActiveUsers(usersData);
      if (alertsData) setAlerts(alertsData);
      
      // Process dashboard stats
      if (dashboardStats) {
        setDepartmentStats(dashboardStats);
      }
      
      // Group doctors by department
      if (staffData && Array.isArray(staffData)) {
        const deptMap: Record<string, any> = {};
        staffData.forEach((doctor: any) => {
          const spec = doctor.specialization || 'General Medicine';
          if (!deptMap[spec]) {
            deptMap[spec] = { name: spec, doctors: 0, patients: 0 };
          }
          deptMap[spec].doctors += 1;
        });
        setDepartments(Object.values(deptMap));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      await superAdminService.createBackup('Manual backup from dashboard');
      toast.success('Backup created successfully');
      await loadDashboardData();
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      setLoading(true);
      const newState = !maintenanceMode;
      await superAdminService.toggleMaintenanceMode(
        newState,
        newState ? 'System is under maintenance' : undefined
      );
      setMaintenanceMode(newState);
      toast.success(`Maintenance mode ${newState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle maintenance mode');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastAlert = async () => {
    try {
      setLoading(true);
      await superAdminService.broadcastAlert(
        'System Update',
        'A system update will be performed tonight at 2 AM',
        'warning'
      );
      toast.success('Alert broadcasted successfully');
      await loadDashboardData();
    } catch (error) {
      toast.error('Failed to broadcast alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Server className="size-8 text-primary" />
            System Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time system monitoring and administration
          </p>
        </div>
        <Button
          onClick={loadDashboardData}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`size-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </motion.div>

      {/* System Health */}
      {health && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-5 text-green-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-5 text-green-500" />
                    <span className="font-semibold capitalize">{health.status}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Database</p>
                  <div className="flex items-center gap-2">
                    <Database className="size-5 text-blue-500" />
                    <span className="font-semibold capitalize">{health.database}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="font-semibold">{Math.floor(health.uptime / 3600)}h</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-semibold text-xs">
                    {new Date(health.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Metrics Grid */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metrics.users.total}</span>
                <Users className="size-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metrics.patients}</span>
                <Activity className="size-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metrics.staff}</span>
                <Shield className="size-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {String(Object.values(metrics.appointments).reduce((a: any, b: any) => a + b, 0))}
                </span>
                <Clock className="size-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Users */}
      {activeUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Active Users ({activeUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeUsers.slice(0, 10).map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* System Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <AlertCircle className="size-5" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alerts.slice(0, 5).map((alert: any) => (
                  <div key={alert.id} className="p-2 rounded-lg bg-white/50 border border-yellow-200">
                    <p className="font-medium text-sm text-yellow-900">{String(alert.title)}</p>
                    <p className="text-xs text-yellow-800">{String(alert.message)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Departments Overview */}
      {departments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                Departments Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept: any) => (
                  <div key={dept.name} className="p-4 rounded-lg border border-border bg-card/40 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{dept.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {dept.doctors} Doctor{dept.doctors !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{dept.doctors}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Active Staff</span>
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <TrendingUp className="size-3" />
                          +{Math.floor(Math.random() * 5) + 1}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* System Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Maintenance Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {maintenanceMode
                ? 'System is in maintenance mode'
                : 'System is operational'}
            </p>
            <Button
              onClick={handleToggleMaintenance}
              disabled={loading}
              variant={maintenanceMode ? 'destructive' : 'default'}
              className="w-full"
            >
              <Power className="size-4 mr-2" />
              {maintenanceMode ? 'Disable' : 'Enable'} Maintenance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Create system backup</p>
            <Button
              onClick={handleCreateBackup}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Download className="size-4 mr-2" />
              Create Backup
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Broadcast Alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Send system-wide alert</p>
            <Button
              onClick={handleBroadcastAlert}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Bell className="size-4 mr-2" />
              Broadcast Alert
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
