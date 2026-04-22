import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { staffApi } from '../utils/api';

interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity' | 'Emergency' | 'Personal';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

interface LeaveBalance {
  staffId: string;
  staffName: string;
  annual: number;
  sick: number;
  personal: number;
  used: { annual: number; sick: number; personal: number };
}

export function LeaveManagement({ session }: { session: any }) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<LeaveRequest>>({});
  const [activeTab, setActiveTab] = useState<'requests' | 'balances'>('requests');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requests, staffData] = await Promise.allSettled([
        staffApi.getAll('type=leave_requests'),
        staffApi.getAll(),
      ]);
      if (requests.status === 'fulfilled') setLeaveRequests(requests.value || []);
      if (staffData.status === 'fulfilled') setStaff(staffData.value || []);
    } catch (error) {
      setLeaveRequests([]); setStaff([]);
    }
  };

  const handleAddRequest = async () => {
    if (!formData.staffId || !formData.leaveType || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDate = new Date(formData.startDate!);
    const endDate = new Date(formData.endDate!);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const selectedStaff = staff.find(s => s.id === formData.staffId);
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      staffId: formData.staffId!,
      staffName: selectedStaff?.name || '',
      leaveType: formData.leaveType!,
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      days,
      reason: formData.reason || '',
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    const updatedRequests = [...leaveRequests, newRequest];
    setLeaveRequests(updatedRequests);
    await staffApi.create({ ...newRequest, type: 'leave_request' }).catch(() => {});
    
    setFormData({});
    setIsAddModalOpen(false);
    toast.success('Leave request submitted successfully!');
  };

  const handleApproval = async (id: string, status: 'Approved' | 'Rejected') => {
    const updatedRequests = leaveRequests.map(request =>
      request.id === id
        ? { ...request, status, approvedBy: session?.name || 'Admin', approvedDate: new Date().toISOString().split('T')[0] }
        : request
    );
    setLeaveRequests(updatedRequests);
    await staffApi.update(id, { status, type: 'leave_request' }).catch(() => {});
    
    if (status === 'Approved') {
      updateLeaveBalance(id);
    }
    
    toast.success(`Leave request ${status.toLowerCase()} successfully!`);
  };

  const updateLeaveBalance = async (requestId: string) => {
    const request = leaveRequests.find(r => r.id === requestId);
    if (!request) return;

    const updatedBalances = leaveBalances.map(balance => {
      if (balance.staffId === request.staffId) {
        const leaveType = request.leaveType.toLowerCase() as keyof typeof balance.used;
        if (leaveType in balance.used) {
          return {
            ...balance,
            used: {
              ...balance.used,
              [leaveType]: balance.used[leaveType] + request.days
            }
          };
        }
      }
      return balance;
    });

    setLeaveBalances(updatedBalances);
    await staffApi.update(request.staffId, { leaveBalance: updatedBalances, type: 'leave_balance' }).catch(() => {});
  };

  const filteredRequests = leaveRequests.filter(request =>
    request.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.leaveType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-primary';
      case 'Rejected': return 'bg-red-100 text-destructive';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 mb-2">Leave Management</h2>
            <p className="text-muted-foreground text-sm">Manage staff leave requests and balances</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData({})}>
                <Plus className="size-4 mr-2" />
                New Leave Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Leave Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Staff Member *</Label>
                  <select
                    value={formData.staffId || ''}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  >
                    <option value="">Select staff member</option>
                    {staff.map(member => (
                      <option key={member.id} value={member.id}>{member.name} - {member.role}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Leave Type *</Label>
                  <select
                    value={formData.leaveType || ''}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as LeaveRequest['leaveType'] })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  >
                    <option value="">Select leave type</option>
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                    <option value="Personal">Personal Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <textarea
                    value={formData.reason || ''}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Enter reason for leave"
                    className="w-full px-3 py-2 border border-border rounded-md"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAddRequest}>Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === 'requests' ? 'default' : 'outline'}
            onClick={() => setActiveTab('requests')}
          >
            Leave Requests
          </Button>
          <Button
            variant={activeTab === 'balances' ? 'default' : 'outline'}
            onClick={() => setActiveTab('balances')}
          >
            Leave Balances
          </Button>
        </div>

        {activeTab === 'requests' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Leave Requests</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border px-4 py-2 text-left">Staff</th>
                      <th className="border border-border px-4 py-2 text-left">Leave Type</th>
                      <th className="border border-border px-4 py-2 text-left">Duration</th>
                      <th className="border border-border px-4 py-2 text-left">Days</th>
                      <th className="border border-border px-4 py-2 text-left">Status</th>
                      <th className="border border-border px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-muted/50">
                        <td className="border border-border px-4 py-2">
                          <div className="flex items-center gap-2">
                            <User className="size-4" />
                            {request.staffName}
                          </div>
                        </td>
                        <td className="border border-border px-4 py-2">{request.leaveType}</td>
                        <td className="border border-border px-4 py-2">
                          {request.startDate} to {request.endDate}
                        </td>
                        <td className="border border-border px-4 py-2">{request.days}</td>
                        <td className="border border-border px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="border border-border px-4 py-2">
                          {request.status === 'Pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproval(request.id, 'Approved')}
                                className="bg-primary hover:bg-green-700"
                              >
                                <CheckCircle className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApproval(request.id, 'Rejected')}
                                className="bg-destructive hover:bg-red-700"
                              >
                                <XCircle className="size-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'balances' && (
          <Card>
            <CardHeader>
              <CardTitle>Leave Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="size-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Annual:</span>
                        <span>20 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sick:</span>
                        <span>10 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Personal:</span>
                        <span>5 days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

