import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Trash2, Edit, Plus, Search, Calendar, Building2, UserCog } from 'lucide-react';
import { departmentsApi, staffApi } from '../../utils/api';

interface LeaveType { id: string; type: string; isActive: boolean; createdAt: string; }
interface Department { id: string; departmentName: string; isActive: boolean; createdAt: string; }
interface Designation { id: string; name: string; isActive: boolean; createdAt: string; }

const DEFAULT_LEAVES: LeaveType[] = [
  { id: '1', type: 'Sick Leave', isActive: true, createdAt: new Date().toISOString() },
  { id: '2', type: 'Casual Leave', isActive: true, createdAt: new Date().toISOString() },
  { id: '3', type: 'Annual Leave', isActive: true, createdAt: new Date().toISOString() },
  { id: '4', type: 'Maternity Leave', isActive: true, createdAt: new Date().toISOString() },
  { id: '5', type: 'Emergency Leave', isActive: true, createdAt: new Date().toISOString() },
];

const DEFAULT_DESIGS: Designation[] = [
  { id: '1', name: 'Chief Medical Officer', isActive: true, createdAt: new Date().toISOString() },
  { id: '2', name: 'Senior Consultant', isActive: true, createdAt: new Date().toISOString() },
  { id: '3', name: 'Junior Doctor', isActive: true, createdAt: new Date().toISOString() },
  { id: '4', name: 'Staff Nurse', isActive: true, createdAt: new Date().toISOString() },
  { id: '5', name: 'Pharmacist', isActive: true, createdAt: new Date().toISOString() },
  { id: '6', name: 'Lab Technician', isActive: true, createdAt: new Date().toISOString() },
  { id: '7', name: 'Receptionist', isActive: true, createdAt: new Date().toISOString() },
];

export default function HumanResourceSetup() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('leaves');
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [isDesigDialogOpen, setIsDesigDialogOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveType | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingDesig, setEditingDesig] = useState<Designation | null>(null);
  const [leaveForm, setLeaveForm] = useState({ type: '' });
  const [deptForm, setDeptForm] = useState({ departmentName: '' });
  const [desigForm, setDesigForm] = useState({ name: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [deptsData, leavesData] = await Promise.allSettled([
        departmentsApi.getAll(),
        staffApi.getAll('type=leave_types'),
      ]);
      if (deptsData.status === 'fulfilled' && deptsData.value?.length) {
        setDepartments(deptsData.value.map((d: any) => ({
          id: String(d.id), departmentName: d.departmentName || d.name, isActive: d.isActive ?? true, createdAt: d.createdAt || new Date().toISOString()
        })));
      } else {
        setDepartments([
          { id: '1', departmentName: 'Cardiology', isActive: true, createdAt: new Date().toISOString() },
          { id: '2', departmentName: 'Neurology', isActive: true, createdAt: new Date().toISOString() },
          { id: '3', departmentName: 'Orthopedics', isActive: true, createdAt: new Date().toISOString() },
          { id: '4', departmentName: 'Pediatrics', isActive: true, createdAt: new Date().toISOString() },
          { id: '5', departmentName: 'Emergency', isActive: true, createdAt: new Date().toISOString() },
          { id: '6', departmentName: 'Administration', isActive: true, createdAt: new Date().toISOString() },
        ]);
      }
      if (leavesData.status === 'fulfilled' && leavesData.value?.length) {
        setLeaveTypes(leavesData.value);
      } else {
        setLeaveTypes(DEFAULT_LEAVES);
      }
      setDesignations(DEFAULT_DESIGS);
    } catch {
      setLeaveTypes(DEFAULT_LEAVES);
      setDesignations(DEFAULT_DESIGS);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.type.trim()) return;
    const data: LeaveType = { id: editingLeave?.id || Date.now().toString(), type: leaveForm.type.trim(), isActive: true, createdAt: editingLeave?.createdAt || new Date().toISOString() };
    if (editingLeave) {
      await staffApi.update(editingLeave.id, { ...data, type_field: 'leave_type' }).catch(() => {});
      setLeaveTypes(prev => prev.map(l => l.id === editingLeave.id ? data : l));
    } else {
      await staffApi.create({ ...data, type: 'leave_type' }).catch(() => {});
      setLeaveTypes(prev => [...prev, data]);
    }
    setLeaveForm({ type: '' }); setEditingLeave(null); setIsLeaveDialogOpen(false);
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.departmentName.trim()) return;
    const data: Department = { id: editingDept?.id || Date.now().toString(), departmentName: deptForm.departmentName.trim(), isActive: true, createdAt: editingDept?.createdAt || new Date().toISOString() };
    if (editingDept) {
      await departmentsApi.update(editingDept.id, { departmentName: data.departmentName }).catch(() => {});
      setDepartments(prev => prev.map(d => d.id === editingDept.id ? data : d));
    } else {
      await departmentsApi.create({ departmentName: data.departmentName, isActive: 'Active' }).catch(() => {});
      setDepartments(prev => [...prev, data]);
    }
    setDeptForm({ departmentName: '' }); setEditingDept(null); setIsDeptDialogOpen(false);
  };

  const handleDesigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigForm.name.trim()) return;
    const data: Designation = { id: editingDesig?.id || Date.now().toString(), name: desigForm.name.trim(), isActive: true, createdAt: editingDesig?.createdAt || new Date().toISOString() };
    if (editingDesig) {
      setDesignations(prev => prev.map(d => d.id === editingDesig.id ? data : d));
    } else {
      setDesignations(prev => [...prev, data]);
    }
    setDesigForm({ name: '' }); setEditingDesig(null); setIsDesigDialogOpen(false);
  };

  const filteredLeaves = leaveTypes.filter(l => l.type.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDepts = departments.filter(d => d.departmentName.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDesigs = designations.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold">Human Resource Setup</h2><p className="text-gray-600">Manage leave types, departments, and designations</p></div>
        <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="flex items-center p-6"><Calendar className="h-8 w-8 text-blue-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-600">Leave Types</p><p className="text-2xl font-bold">{leaveTypes.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-6"><Building2 className="h-8 w-8 text-green-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-600">Departments</p><p className="text-2xl font-bold">{departments.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-6"><UserCog className="h-8 w-8 text-purple-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-600">Designations</p><p className="text-2xl font-bold">{designations.length}</p></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaves">Leave Types</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="designations">Designations</TabsTrigger>
        </TabsList>

        <TabsContent value="leaves" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Leave Types ({filteredLeaves.length})</h3>
            <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
              <DialogTrigger asChild><Button onClick={() => { setEditingLeave(null); setLeaveForm({ type: '' }); }}><Plus className="w-4 h-4 mr-2" />Add Leave Type</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingLeave ? 'Edit Leave Type' : 'Add Leave Type'}</DialogTitle></DialogHeader>
                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div><Label>Leave Type Name *</Label><Input value={leaveForm.type} onChange={(e) => setLeaveForm({ type: e.target.value })} placeholder="Enter leave type name" required /></div>
                  <div className="flex justify-end space-x-2"><Button type="button" variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>Cancel</Button><Button type="submit">{editingLeave ? 'Update' : 'Save'}</Button></div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4">
            {filteredLeaves.map(leave => (
              <Card key={leave.id}><CardHeader><CardTitle className="flex justify-between items-center">
                <div className="flex items-center space-x-2"><Calendar className="w-5 h-5 text-blue-600" /><span>{leave.type}</span></div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditingLeave(leave); setLeaveForm({ type: leave.type }); setIsLeaveDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => { if (confirm('Are you sure?')) setLeaveTypes(prev => prev.filter(l => l.id !== leave.id)); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardTitle></CardHeader></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Departments ({filteredDepts.length})</h3>
            <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
              <DialogTrigger asChild><Button onClick={() => { setEditingDept(null); setDeptForm({ departmentName: '' }); }}><Plus className="w-4 h-4 mr-2" />Add Department</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingDept ? 'Edit Department' : 'Add Department'}</DialogTitle></DialogHeader>
                <form onSubmit={handleDeptSubmit} className="space-y-4">
                  <div><Label>Department Name *</Label><Input value={deptForm.departmentName} onChange={(e) => setDeptForm({ departmentName: e.target.value })} placeholder="Enter department name" required /></div>
                  <div className="flex justify-end space-x-2"><Button type="button" variant="outline" onClick={() => setIsDeptDialogOpen(false)}>Cancel</Button><Button type="submit">{editingDept ? 'Update' : 'Save'}</Button></div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4">
            {filteredDepts.map(dept => (
              <Card key={dept.id}><CardHeader><CardTitle className="flex justify-between items-center">
                <div className="flex items-center space-x-2"><Building2 className="w-5 h-5 text-green-600" /><span>{dept.departmentName}</span></div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditingDept(dept); setDeptForm({ departmentName: dept.departmentName }); setIsDeptDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" onClick={async () => { if (confirm('Are you sure?')) { await departmentsApi.delete(dept.id).catch(() => {}); setDepartments(prev => prev.filter(d => d.id !== dept.id)); } }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardTitle></CardHeader></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="designations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Designations ({filteredDesigs.length})</h3>
            <Dialog open={isDesigDialogOpen} onOpenChange={setIsDesigDialogOpen}>
              <DialogTrigger asChild><Button onClick={() => { setEditingDesig(null); setDesigForm({ name: '' }); }}><Plus className="w-4 h-4 mr-2" />Add Designation</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingDesig ? 'Edit Designation' : 'Add Designation'}</DialogTitle></DialogHeader>
                <form onSubmit={handleDesigSubmit} className="space-y-4">
                  <div><Label>Designation Name *</Label><Input value={desigForm.name} onChange={(e) => setDesigForm({ name: e.target.value })} placeholder="Enter designation name" required /></div>
                  <div className="flex justify-end space-x-2"><Button type="button" variant="outline" onClick={() => setIsDesigDialogOpen(false)}>Cancel</Button><Button type="submit">{editingDesig ? 'Update' : 'Save'}</Button></div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4">
            {filteredDesigs.map(desig => (
              <Card key={desig.id}><CardHeader><CardTitle className="flex justify-between items-center">
                <div className="flex items-center space-x-2"><UserCog className="w-5 h-5 text-purple-600" /><span>{desig.name}</span></div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditingDesig(desig); setDesigForm({ name: desig.name }); setIsDesigDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => { if (confirm('Are you sure?')) setDesignations(prev => prev.filter(d => d.id !== desig.id)); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardTitle></CardHeader></Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
