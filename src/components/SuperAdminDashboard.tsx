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
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface SuperAdminDashboardProps {
  session: any;
}

// Mock data
const mockData = {
  serverStatus: {
    cpu: 45,
    memory: 68,
    disk: 72,
    uptime: '15d 7h 23m',
  },
  database: {
    status: 'active',
    avgResponseTime: 23,
    activeConnections: 47,
    lastBackup: '2024-01-15 03:00:00',
  },
  activeUsers: {
    total: 234,
    doctors: 45,
    nurses: 89,
    admin: 12,
    patients: 88,
    peakHour: '14:00-15:00',
    avgSession: '2h 15m',
  },
  performance: {
    apiResponseTime: 145,
    errorRate: 0.3,
    successfulTransactions: 15847,
    failedOperations: 23,
  },
  recentLogs: [
    { id: 1, timestamp: '2024-01-15 14:23:45', user: 'admin@hospital.com', action: 'User role updated', status: 'success', ip: '192.168.1.100' },
    { id: 2, timestamp: '2024-01-15 14:20:12', user: 'doctor@hospital.com', action: 'Patient record accessed', status: 'success', ip: '192.168.1.105' },
    { id: 3, timestamp: '2024-01-15 14:18:33', user: 'system', action: 'Database backup completed', status: 'success', ip: 'localhost' },
    { id: 4, timestamp: '2024-01-15 14:15:22', user: 'nurse@hospital.com', action: 'Failed login attempt', status: 'error', ip: '192.168.1.120' },
    { id: 5, timestamp: '2024-01-15 14:12:08', user: 'admin@hospital.com', action: 'System settings modified', status: 'warning', ip: '192.168.1.100' },
    { id: 6, timestamp: '2024-01-15 14:10:45', user: 'pharmacist@hospital.com', action: 'Inventory updated', status: 'success', ip: '192.168.1.115' },
    { id: 7, timestamp: '2024-01-15 14:08:19', user: 'system', action: 'Cache cleared', status: 'success', ip: 'localhost' },
    { id: 8, timestamp: '2024-01-15 14:05:33', user: 'reception@hospital.com', action: 'Payment processed', status: 'success', ip: '192.168.1.110' },
    { id: 9, timestamp: '2024-01-15 14:02:11', user: 'lab@hospital.com', action: 'Test results uploaded', status: 'success', ip: '192.168.1.125' },
    { id: 10, timestamp: '2024-01-15 14:00:00', user: 'system', action: 'Scheduled task executed', status: 'success', ip: 'localhost' },
  ],
};

export function SuperAdminDashboard({ session }: SuperAdminDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchActiveUsers();
    fetchSystemMetrics();
    const usersInterval = setInterval(fetchActiveUsers, 10000); // Refresh every 10 seconds
    const metricsInterval = setInterval(fetchSystemMetrics, 5000); // Refresh every 5 seconds
    return () => {
      clearInterval(usersInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  const fetchSystemMetrics = () => {
    // Simulate real-time metric updates
    mockData.serverStatus.cpu = Math.floor(Math.random() * 30) + 40;
    mockData.serverStatus.memory = Math.floor(Math.random() * 30) + 60;
    mockData.performance.apiResponseTime = Math.floor(Math.random() * 50) + 120;
    mockData.activeUsers.total = activeUsers.length;
  };

  const fetchActiveUsers = async () => {
    try {
      const { apiClient } = await import('../services/apiClient');
      const data = await apiClient.get('/users');
      setActiveUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const getColorClass = (value: number, type: 'cpu' | 'memory' | 'disk') => {
    if (value < 70) return 'text-primary';
    if (value < 90) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-primary bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-destructive bg-red-50';
      default: return 'text-muted-foreground bg-muted/50';
    }
  };

  const handleBackup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowBackupModal(false);
      toast.success('System backup completed successfully!');
    }, 2000);
  };

  const handleClearCache = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Cache cleared successfully!');
    }, 1000);
  };

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
              <Shield className="size-8 text-primary" />
              Super Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">System health monitoring and administration</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-100 text-destructive rounded-full text-xs font-semibold">
              SUPER ADMIN ACCESS
            </span>
          </div>
        </div>
      </motion.div>

      {/* System Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Server Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Server className="size-4 text-primary" />
                Server Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="size-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">CPU</span>
                </div>
                <span className={`text-sm font-bold ${getColorClass(mockData.serverStatus.cpu, 'cpu')}`}>
                  {mockData.serverStatus.cpu}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Memory</span>
                </div>
                <span className={`text-sm font-bold ${getColorClass(mockData.serverStatus.memory, 'memory')}`}>
                  {mockData.serverStatus.memory}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="size-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Disk</span>
                </div>
                <span className={`text-sm font-bold ${getColorClass(mockData.serverStatus.disk, 'disk')}`}>
                  {mockData.serverStatus.disk}%
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Uptime:</span>
                  <span className="text-xs font-semibold text-primary">{mockData.serverStatus.uptime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Database Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="size-4 text-primary" />
                Database Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Connection</span>
                <div className="flex items-center gap-1">
                  <CheckCircle className="size-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Avg Response</span>
                <span className="text-sm font-bold text-foreground">{mockData.database.avgResponseTime}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Connections</span>
                <span className="text-sm font-bold text-foreground">{mockData.database.activeConnections}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">Last Backup</div>
                <div className="text-xs font-semibold text-foreground mt-1">{mockData.database.lastBackup}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="size-4 text-primary" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center pb-2 border-b">
                <div className="text-3xl font-bold text-primary">{mockData.activeUsers.total}</div>
                <div className="text-xs text-muted-foreground">Users Online</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Doctors:</span>
                  <span className="font-bold text-foreground ml-1">{mockData.activeUsers.doctors}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Nurses:</span>
                  <span className="font-bold text-foreground ml-1">{mockData.activeUsers.nurses}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Admin:</span>
                  <span className="font-bold text-foreground ml-1">{mockData.activeUsers.admin}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Patients:</span>
                  <span className="font-bold text-foreground ml-1">{mockData.activeUsers.patients}</span>
                </div>
              </div>
              <div className="pt-2 border-t text-xs">
                <div className="text-muted-foreground">Peak: {mockData.activeUsers.peakHour}</div>
                <div className="text-muted-foreground">Avg Session: {mockData.activeUsers.avgSession}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">API Response</span>
                <span className="text-sm font-bold text-foreground">{mockData.performance.apiResponseTime}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Error Rate (24h)</span>
                <span className="text-sm font-bold text-primary">{mockData.performance.errorRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Successful</span>
                <span className="text-sm font-bold text-primary">{mockData.performance.successfulTransactions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Failed</span>
                <span className="text-sm font-bold text-destructive">{mockData.performance.failedOperations}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                onClick={() => setShowBackupModal(true)}
                className="bg-primary hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="size-4" />
                Run System Backup
              </Button>
              <Button
                onClick={() => {
                  setMaintenanceMode(!maintenanceMode);
                  toast.success(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'} successfully!`);
                }}
                variant={maintenanceMode ? 'destructive' : 'outline'}
                className="flex items-center gap-2"
              >
                <Power className="size-4" />
                {maintenanceMode ? 'Disable' : 'Enable'} Maintenance
              </Button>
              <Button
                onClick={handleClearCache}
                variant="outline"
                className="flex items-center gap-2"
                disabled={loading}
              >
                <Trash2 className="size-4" />
                Clear Cache
              </Button>
              <Button
                onClick={() => toast.success('System alert sent to all users!')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Bell className="size-4" />
                Send System Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Real-time Indicator */}
      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <span>Live Updates Active</span>
      </div>

      {/* Active Users Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="size-5 text-primary" />
                Active Users in System
                <span className="ml-2 px-2 py-1 bg-green-100 text-primary rounded-full text-xs font-semibold">
                  {activeUsers.length} Online
                </span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => {
                fetchActiveUsers();
                toast.success('Active users refreshed!');
              }}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-card-foreground font-semibold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{user.name || 'Unknown'}</h4>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'super_admin' ? 'bg-red-100 text-destructive' :
                      user.role === 'admin' ? 'bg-orange-100 text-primary' :
                      user.role === 'doctor' ? 'bg-blue-100 text-primary' :
                      user.role === 'nurse' ? 'bg-green-100 text-primary' :
                      user.role === 'pharmacist' ? 'bg-purple-100 text-primary' :
                      user.role === 'lab_technician' ? 'bg-yellow-100 text-yellow-700' :
                      user.role === 'receptionist' ? 'bg-pink-100 text-pink-700' :
                      'bg-muted text-foreground'
                    }`}>
                      {user.role === 'super_admin' ? 'Super Admin' :
                       user.role === 'admin' ? 'Admin' :
                       user.role === 'doctor' ? 'Doctor' :
                       user.role === 'nurse' ? 'Nurse' :
                       user.role === 'pharmacist' ? 'Pharmacist' :
                       user.role === 'lab_technician' ? 'Lab Tech' :
                       user.role === 'receptionist' ? 'Receptionist' : 'User'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      Online
                    </div>
                  </div>
                  {user.last_sign_in_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last login: {new Date(user.last_sign_in_at).toLocaleString()}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
            {activeUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No active users at the moment
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent System Logs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent System Logs</CardTitle>
              <Button variant="outline" size="sm" onClick={() => toast.info('Opening full system logs...')}>
                View All Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Timestamp</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">User</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Action</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.recentLogs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="py-3 px-2 text-muted-foreground">{log.timestamp}</td>
                      <td className="py-3 px-2 text-foreground">{log.user}</td>
                      <td className="py-3 px-2 text-foreground">{log.action}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status === 'success' && <CheckCircle className="size-3 inline mr-1" />}
                          {log.status === 'warning' && <AlertTriangle className="size-3 inline mr-1" />}
                          {log.status === 'error' && <XCircle className="size-3 inline mr-1" />}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground font-mono text-xs">{log.ip}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Backup Confirmation Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">Confirm System Backup</h3>
            <p className="text-muted-foreground mb-6">
              This will create a complete backup of the system database and files. This process may take several minutes.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleBackup}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-blue-700"
              >
                {loading ? 'Running Backup...' : 'Confirm Backup'}
              </Button>
              <Button
                onClick={() => setShowBackupModal(false)}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}


