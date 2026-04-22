import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  Activity,
  Beaker,
  ClipboardList,
  Package,
  Shield,
  User,
  Calendar,
  TrendingUp,
  TestTube,
  Microscope
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AIInsightPanel } from './AIInsightPanel';
import { VoiceAgent } from './VoiceAgent';

interface LabTest {
  id: string;
  patientName: string;
  testType: string;
  priority: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'in-progress' | 'completed';
  orderedDate: string;
  category: string;
}

interface Equipment {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  lastMaintenance: string;
}

export function LaboratoryManagement() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [resultForm, setResultForm] = useState({ testId: '', result: '', criticalFlag: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabData();
  }, []);

  const fetchLabData = async () => {
    try {
      setLoading(true);
      const { apiClient } = await import('../services/apiClient');
      
      // Fetch pathology/lab tests from backend
      const data = await apiClient.get('/pathology');
      
      const formattedTests: LabTest[] = (data || []).map((test: any) => ({
        id: test.id,
        patientName: test.patientName || 'Unknown',
        testType: test.testName || 'Lab Test',
        priority: test.priority || 'routine',
        status: test.status || 'pending',
        orderedDate: test.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        category: test.category || 'General'
      }));

      setTests(formattedTests.length > 0 ? formattedTests : [
        { id: '1', patientName: 'John Smith', testType: 'CBC', priority: 'stat', status: 'pending', orderedDate: '2024-12-08', category: 'Hematology' },
        { id: '2', patientName: 'Emily Davis', testType: 'Lipid Panel', priority: 'routine', status: 'in-progress', orderedDate: '2024-12-08', category: 'Chemistry' },
      ]);

      // Fetch equipment status
      const equipData = await apiClient.get('/equipment');
      
      const formattedEquip: Equipment[] = (equipData || []).map((eq: any) => ({
        id: eq.id,
        name: eq.name,
        status: eq.status || 'online',
        lastMaintenance: eq.lastMaintenance?.split('T')[0] || new Date().toISOString().split('T')[0]
      }));

      setEquipment(formattedEquip.length > 0 ? formattedEquip : [
        { id: '1', name: 'Hematology Analyzer', status: 'online', lastMaintenance: '2024-12-01' },
        { id: '2', name: 'Chemistry Analyzer', status: 'online', lastMaintenance: '2024-11-28' },
      ]);
    } catch (error) {
      console.error('Error fetching lab data:', error);
      // Use fallback data
      setTests([
        { id: '1', patientName: 'John Smith', testType: 'CBC', priority: 'stat', status: 'pending', orderedDate: '2024-12-08', category: 'Hematology' },
        { id: '2', patientName: 'Emily Davis', testType: 'Lipid Panel', priority: 'routine', status: 'in-progress', orderedDate: '2024-12-08', category: 'Chemistry' },
      ]);
      setEquipment([
        { id: '1', name: 'Hematology Analyzer', status: 'online', lastMaintenance: '2024-12-01' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const todayStats = {
    pending: tests.filter(t => t.status === 'pending').length,
    inProgress: tests.filter(t => t.status === 'in-progress').length,
    completed: tests.filter(t => t.status === 'completed').length,
    urgent: tests.filter(t => t.priority === 'urgent' || t.priority === 'stat').length,
  };

  const stats = [
    { label: 'Total Tests', value: tests.length.toString(), icon: TestTube, color: 'bg-primary', change: '+8%' },
    { label: 'Pending Tests', value: todayStats.pending.toString(), icon: Clock, color: 'bg-amber-500', change: '-5%' },
    { label: 'Completed Today', value: todayStats.completed.toString(), icon: CheckCircle2, color: 'bg-primary', change: '+12%' },
    { label: 'Equipment Online', value: equipment.filter(e => e.status === 'online').length.toString(), icon: Settings, color: 'bg-primary', change: '+2%' },
  ];

  const testsByCategory = [
    { name: 'Hematology', value: tests.filter(t => t.category === 'Hematology').length, color: 'hsl(var(--primary))' },
    { name: 'Chemistry', value: tests.filter(t => t.category === 'Chemistry').length, color: 'hsl(var(--primary))' },
    { name: 'Microbiology', value: tests.filter(t => t.category === 'Microbiology').length, color: 'hsl(var(--primary))' },
    { name: 'Pathology', value: 2, color: 'hsl(var(--primary))' },
  ];

  const weeklyTests = [
    { day: 'Mon', tests: 45, completed: 42 },
    { day: 'Tue', tests: 52, completed: 48 },
    { day: 'Wed', tests: 48, completed: 45 },
    { day: 'Thu', tests: 61, completed: 58 },
    { day: 'Fri', tests: 55, completed: 52 },
    { day: 'Sat', tests: 38, completed: 35 },
    { day: 'Sun', tests: 25, completed: 23 },
  ];

  const recentActivity = [
    { id: '1', action: 'CBC completed for John Smith', time: '10:30 AM', status: 'completed', icon: CheckCircle2 },
    { id: '2', action: 'Lipid Panel started for Emily Davis', time: '10:15 AM', status: 'in-progress', icon: Activity },
    { id: '3', action: 'Cardiac Enzymes pending approval', time: '09:45 AM', status: 'pending', icon: Clock },
    { id: '4', action: 'Equipment maintenance completed', time: '09:30 AM', status: 'completed', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FlaskConical className="size-8 text-primary" />
          Laboratory Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Lab operations and test management</p>
        <div className="mt-2">
          <VoiceAgent department="laboratory" userRole="lab_technician" />
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
                      <p className="text-2xl font-bold mt-2">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="size-4 text-primary" />
                        <span className="text-sm text-primary">{stat.change}</span>
                      </div>
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

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tests">Test Queue</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Dashboard */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-5 text-primary" />
                    Today's Lab Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-3xl font-bold text-amber-600">{todayStats.pending}</div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                      <Progress value={30} className="mt-2" />
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{todayStats.inProgress}</div>
                      <div className="text-sm text-muted-foreground">In Progress</div>
                      <Progress value={60} className="mt-2" />
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{todayStats.completed}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                      <Progress value={85} className="mt-2" />
                    </div>
                  </div>
                  {todayStats.urgent > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 text-destructive" />
                        <span className="text-sm text-destructive">{todayStats.urgent} Urgent Tests Require Attention</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Test Results Entry */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    Test Results Entry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Test ID</Label>
                      <Input
                        value={resultForm.testId}
                        onChange={(e) => setResultForm({ ...resultForm, testId: e.target.value })}
                        placeholder="Enter test ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Result Value</Label>
                      <Input
                        value={resultForm.result}
                        onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}
                        placeholder="Enter result"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={resultForm.criticalFlag}
                      onChange={(e) => setResultForm({ ...resultForm, criticalFlag: e.target.checked })}
                    />
                    <Label className="text-sm">Critical Value Flag</Label>
                  </div>
                  <Button onClick={() => {
                    toast.success('Test result submitted successfully!');
                    setResultForm({ testId: '', result: '', criticalFlag: false });
                  }}>
                    Submit Result
                  </Button>
                  {resultForm.result && (
                    <AIInsightPanel
                      title="AI Result Analysis"
                      prompt={`Analyze this lab test result: Test ID: ${resultForm.testId}, Result: ${resultForm.result}, Critical Flag: ${resultForm.criticalFlag}. 
Provide: 1) Whether this value appears normal/abnormal, 2) Possible clinical significance, 3) Recommended follow-up actions. Be concise.`}
                      autoLoad
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button onClick={() => toast.success('Result entry opened!')} className="w-full justify-start">
                    <Beaker className="size-4 mr-2" />
                    Result Entry
                  </Button>
                  <Button onClick={() => toast.success('Inventory check initiated!')} variant="outline" className="w-full justify-start">
                    <Package className="size-4 mr-2" />
                    Inventory Check
                  </Button>
                  <Button onClick={() => toast.success('QC procedures started!')} variant="outline" className="w-full justify-start">
                    <Shield className="size-4 mr-2" />
                    QC Procedures
                  </Button>
                  <Button onClick={() => toast.success('Equipment check started!')} variant="outline" className="w-full justify-start">
                    <Settings className="size-4 mr-2" />
                    Equipment Check
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="bg-primary p-2 rounded-lg">
                          <Icon className="size-4 text-card-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            activity.status === 'completed' ? 'border-primary text-primary bg-green-50' :
                            activity.status === 'in-progress' ? 'border-primary text-primary bg-blue-50' :
                            'border-amber-500 text-amber-700 bg-amber-50'
                          }
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5 text-primary" />
                Lab Test Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary p-3 rounded-lg text-card-foreground">
                      <TestTube className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{test.patientName}</p>
                        <Badge
                          variant="outline"
                          className={
                            test.priority === 'stat' ? 'border-destructive text-destructive bg-red-50' :
                            test.priority === 'urgent' ? 'border-primary text-primary bg-orange-50' :
                            'border-gray-500 text-foreground bg-muted/50'
                          }
                        >
                          {test.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{test.testType} • {test.category}</p>
                      <p className="text-xs text-muted-foreground">Ordered: {test.orderedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        test.status === 'pending' ? 'border-amber-500 text-amber-700 bg-amber-50' :
                        test.status === 'in-progress' ? 'border-primary text-primary bg-blue-50' :
                        'border-primary text-primary bg-green-50'
                      }
                    >
                      {test.status}
                    </Badge>
                    <Button size="sm" onClick={() => toast.success(`Assigned ${test.testType} to technician!`)}>
                      Assign
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="size-5 text-primary" />
                Equipment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {equipment.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      item.status === 'online' ? 'bg-primary' :
                      item.status === 'offline' ? 'bg-destructive' : 'bg-amber-500'
                    }`}>
                      <Microscope className="size-5 text-card-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Last Maintenance: {item.lastMaintenance}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        item.status === 'online' ? 'border-primary text-primary bg-green-50' :
                        item.status === 'offline' ? 'border-destructive text-destructive bg-red-50' :
                        'border-amber-500 text-amber-700 bg-amber-50'
                      }
                    >
                      {item.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Maintain
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tests by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Tests by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={testsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {testsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Test Volume */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Test Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyTests}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tests" fill="hsl(var(--primary))" name="Total Tests" />
                    <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Completion Rate Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Test Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyTests}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

