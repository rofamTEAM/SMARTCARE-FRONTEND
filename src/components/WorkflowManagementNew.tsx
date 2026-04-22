import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Play, Pause, CheckCircle, Clock, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { eventsApi } from '../utils/api';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  estimatedTime: number;
  actualTime?: number;
  dependencies: string[];
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'patient_care' | 'administrative' | 'emergency' | 'maintenance';
  status: 'active' | 'inactive' | 'draft';
  steps: WorkflowStep[];
  createdDate: string;
  lastModified: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  workflowName: string;
  patientId?: string;
  patientName?: string;
  status: 'running' | 'completed' | 'paused' | 'cancelled';
  currentStep: number;
  startedDate: string;
  completedDate?: string;
  assignedStaff: string[];
}

interface WorkflowManagementProps {
  session: any;
}

export function WorkflowManagement({ session }: WorkflowManagementProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowForm, setWorkflowForm] = useState<Partial<Workflow>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkflows();
    fetchInstances();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const { apiClient } = await import('../services/apiClient');
      // Fetch workflows from backend
      const data = await apiClient.get('/workflows');
      
      const formattedWorkflows: Workflow[] = (data || []).map((wf: any) => ({
        id: wf.id,
        name: wf.name,
        description: wf.description,
        category: wf.category || 'patient_care',
        status: wf.status || 'active',
        priority: wf.priority || 'medium',
        createdDate: wf.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        lastModified: wf.updatedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        steps: wf.steps || []
      }));

      setWorkflows(formattedWorkflows.length > 0 ? formattedWorkflows : [
        {
          id: '1',
          name: 'Patient Admission Process',
          description: 'Complete workflow for admitting new patients',
          category: 'patient_care',
          status: 'active',
          priority: 'high',
          createdDate: '2024-12-01',
          lastModified: '2024-12-07',
          steps: [
            {
              id: 's1',
              name: 'Patient Registration',
              description: 'Register patient details and insurance',
              assignedTo: 'Reception',
              status: 'completed',
              estimatedTime: 15,
              actualTime: 12,
              dependencies: []
            },
          ]
        }
      ]);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      // Use fallback data
      setWorkflows([
        {
          id: '1',
          name: 'Patient Admission Process',
          description: 'Complete workflow for admitting new patients',
          category: 'patient_care',
          status: 'active',
          priority: 'high',
          createdDate: '2024-12-01',
          lastModified: '2024-12-07',
          steps: []
        }
      ]);
    }
  };

  const fetchInstances = async () => {
    try {
      const { apiClient } = await import('../services/apiClient');
      // Fetch workflow instances from backend
      const data = await apiClient.get('/workflows/instances');
      
      const formattedInstances: WorkflowInstance[] = (data || []).map((inst: any) => ({
        id: inst.id,
        workflowId: inst.workflowId,
        workflowName: inst.workflowName,
        patientId: inst.patientId,
        patientName: inst.patientName,
        status: inst.status || 'running',
        currentStep: inst.currentStep || 0,
        startedDate: inst.startedDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        completedDate: inst.completedDate?.split('T')[0],
        assignedStaff: inst.assignedStaff || []
      }));

      setInstances(formattedInstances);
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
      setInstances([]);
    }
  };
            },
            {
              id: 's3',
              name: 'Doctor Consultation',
              description: 'Primary physician consultation',
              assignedTo: 'Doctor',
              status: 'pending',
              estimatedTime: 45,
              dependencies: ['s2']
            },
            {
              id: 's4',
              name: 'Bed Assignment',
              description: 'Assign appropriate bed and ward',
              assignedTo: 'Bed Management',
              status: 'pending',
              estimatedTime: 10,
              dependencies: ['s3']
            }
          ]
        },
        {
          id: '2',
          name: 'Emergency Response Protocol',
          description: 'Critical patient emergency response workflow',
          category: 'emergency',
          status: 'active',
          priority: 'critical',
          createdDate: '2024-11-15',
          lastModified: '2024-12-05',
          steps: [
            {
              id: 'e1',
              name: 'Triage Assessment',
              description: 'Immediate patient triage and priority assignment',
              assignedTo: 'Emergency Nurse',
              status: 'completed',
              estimatedTime: 5,
              actualTime: 3,
              dependencies: []
            },
            {
              id: 'e2',
              name: 'Vital Signs Check',
              description: 'Complete vital signs assessment',
              assignedTo: 'Emergency Nurse',
              status: 'completed',
              estimatedTime: 10,
              actualTime: 8,
              dependencies: ['e1']
            },
            {
              id: 'e3',
              name: 'Emergency Treatment',
              description: 'Immediate medical intervention',
              assignedTo: 'Emergency Doctor',
              status: 'in_progress',
              estimatedTime: 60,
              dependencies: ['e2']
            }
          ]
        }
      ];
      setWorkflows(mockWorkflows);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to load workflows');
    }
  };

  const fetchInstances = async () => {
    try {
      const mockInstances: WorkflowInstance[] = [
        {
          id: 'i1',
          workflowId: '1',
          workflowName: 'Patient Admission Process',
          patientId: 'P001',
          patientName: 'John Smith',
          status: 'running',
          currentStep: 2,
          startedDate: '2024-12-08T09:00:00',
          assignedStaff: ['Nurse Jane', 'Dr. Wilson']
        },
        {
          id: 'i2',
          workflowId: '2',
          workflowName: 'Emergency Response Protocol',
          patientId: 'P002',
          patientName: 'Emergency Patient',
          status: 'running',
          currentStep: 3,
          startedDate: '2024-12-08T14:30:00',
          assignedStaff: ['Emergency Team']
        }
      ];
      setInstances(mockInstances);
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
      toast.error('Failed to load workflow instances');
    }
  };

  const handleCreateWorkflow = async () => {
    if (!workflowForm.name || !workflowForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newWorkflow: Workflow = {
        id: Date.now().toString(),
        name: workflowForm.name || '',
        description: workflowForm.description || '',
        category: workflowForm.category || 'administrative',
        status: 'draft',
        priority: workflowForm.priority || 'medium',
        steps: [],
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };

      setWorkflows([...workflows, newWorkflow]);
      setWorkflowForm({});
      setIsWorkflowModalOpen(false);
      toast.success('Workflow created successfully!');
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkflow = async (workflowId: string, patientId?: string, patientName?: string) => {
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) return;

      const newInstance: WorkflowInstance = {
        id: Date.now().toString(),
        workflowId,
        workflowName: workflow.name,
        patientId,
        patientName,
        status: 'running',
        currentStep: 1,
        startedDate: new Date().toISOString(),
        assignedStaff: []
      };

      setInstances([...instances, newInstance]);
      toast.success('Workflow started successfully!');
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error('Failed to start workflow');
    }
  };

  const handlePauseWorkflow = async (instanceId: string) => {
    try {
      setInstances(instances.map(instance =>
        instance.id === instanceId
          ? { ...instance, status: 'paused' as const }
          : instance
      ));
      toast.success('Workflow paused');
    } catch (error) {
      console.error('Error pausing workflow:', error);
      toast.error('Failed to pause workflow');
    }
  };

  const handleCompleteWorkflow = async (instanceId: string) => {
    try {
      setInstances(instances.map(instance =>
        instance.id === instanceId
          ? { ...instance, status: 'completed' as const, completedDate: new Date().toISOString() }
          : instance
      ));
      toast.success('Workflow completed');
    } catch (error) {
      console.error('Error completing workflow:', error);
      toast.error('Failed to complete workflow');
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || workflow.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-primary',
      'inactive': 'bg-muted text-foreground',
      'draft': 'bg-yellow-100 text-yellow-700',
      'running': 'bg-blue-100 text-primary',
      'completed': 'bg-green-100 text-primary',
      'paused': 'bg-orange-100 text-primary',
      'cancelled': 'bg-red-100 text-destructive'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-foreground';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-blue-100 text-primary',
      'medium': 'bg-yellow-100 text-yellow-700',
      'high': 'bg-orange-100 text-primary',
      'critical': 'bg-red-100 text-destructive'
    };
    return colors[priority as keyof typeof colors] || 'bg-muted text-foreground';
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="size-4 text-primary" />;
      case 'in_progress': return <Clock className="size-4 text-primary" />;
      case 'blocked': return <AlertTriangle className="size-4 text-destructive" />;
      default: return <Clock className="size-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Management</h1>
          <p className="text-muted-foreground">Manage hospital workflows and processes</p>
        </div>
        <Button onClick={() => setIsWorkflowModalOpen(true)} className="bg-[#38bdf8] hover:bg-[#0ea5e9]">
          <Plus className="size-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="instances">Active Instances</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Workflow Templates</CardTitle>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md"
                  >
                    <option value="all">All Categories</option>
                    <option value="patient_care">Patient Care</option>
                    <option value="administrative">Administrative</option>
                    <option value="emergency">Emergency</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      placeholder="Search workflows..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWorkflows.map((workflow) => (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                          <Badge className={getPriorityColor(workflow.priority)}>
                            {workflow.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{workflow.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Category: {workflow.category.replace('_', ' ')}</span>
                          <span>Steps: {workflow.steps.length}</span>
                          <span>Modified: {workflow.lastModified}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStartWorkflow(workflow.id)}
                          className="bg-[#38bdf8] hover:bg-[#0ea5e9]"
                        >
                          <Play className="size-4 mr-1" />
                          Start
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="size-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>

                    {workflow.steps.length > 0 && (
                      <div className="border-t pt-3">
                        <h4 className="text-sm font-medium text-foreground mb-2">Workflow Steps:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                          {workflow.steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-2 text-sm">
                              {getStepStatusIcon(step.status)}
                              <span className="truncate">{index + 1}. {step.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflow Instances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instances.map((instance) => (
                  <motion.div
                    key={instance.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{instance.workflowName}</h3>
                          <Badge className={getStatusColor(instance.status)}>
                            {instance.status}
                          </Badge>
                        </div>
                        {instance.patientName && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Patient: {instance.patientName} ({instance.patientId})
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Step: {instance.currentStep}</span>
                          <span>Started: {new Date(instance.startedDate).toLocaleString()}</span>
                          <span>Staff: {instance.assignedStaff.join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {instance.status === 'running' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePauseWorkflow(instance.id)}
                            >
                              <Pause className="size-4 mr-1" />
                              Pause
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCompleteWorkflow(instance.id)}
                              className="bg-primary hover:bg-green-700"
                            >
                              <CheckCircle className="size-4 mr-1" />
                              Complete
                            </Button>
                          </>
                        )}
                        {instance.status === 'paused' && (
                          <Button
                            size="sm"
                            onClick={() => setInstances(instances.map(i =>
                              i.id === instance.id ? { ...i, status: 'running' } : i
                            ))}
                            className="bg-[#38bdf8] hover:bg-[#0ea5e9]"
                          >
                            <Play className="size-4 mr-1" />
                            Resume
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {instances.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active workflow instances
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Workflows</p>
                    <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
                  </div>
                  <Users className="size-8 text-[#38bdf8]" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Instances</p>
                    <p className="text-2xl font-bold text-gray-900">{instances.filter(i => i.status === 'running').length}</p>
                  </div>
                  <Play className="size-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Today</p>
                    <p className="text-2xl font-bold text-gray-900">{instances.filter(i => i.status === 'completed').length}</p>
                  </div>
                  <CheckCircle className="size-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Workflow Modal */}
      <Dialog open={isWorkflowModalOpen} onOpenChange={setIsWorkflowModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  value={workflowForm.name || ''}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                  placeholder="Enter workflow name"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  value={workflowForm.category || ''}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select Category</option>
                  <option value="patient_care">Patient Care</option>
                  <option value="administrative">Administrative</option>
                  <option value="emergency">Emergency</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <select
                value={workflowForm.priority || ''}
                onChange={(e) => setWorkflowForm({ ...workflowForm, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                value={workflowForm.description || ''}
                onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md h-24 resize-none"
                placeholder="Describe the workflow purpose and process"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsWorkflowModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={loading} className="bg-[#38bdf8] hover:bg-[#0ea5e9]">
              {loading ? 'Creating...' : 'Create Workflow'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

