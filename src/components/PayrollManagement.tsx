import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, DollarSign, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { staffApi } from '../utils/api';

interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  payPeriod: string;
  status: 'Pending' | 'Paid';
  payDate?: string;
}

interface PayrollManagementProps {
  session: any;
}

export function PayrollManagement({ session }: PayrollManagementProps) {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PayrollRecord>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayrolls();
    fetchStaff();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const data = await staffApi.getAll('type=payroll');
      setPayrolls(data || []);
    } catch (error) {
      setPayrolls([]);
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await staffApi.getAll();
      setStaff(data || []);
    } catch (error) {
      setStaff([]);
    }
  };

  const handleAdd = async () => {
    if (!formData.staffId || !formData.basicSalary || !formData.payPeriod) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const selectedStaff = staff.find(s => s.id === formData.staffId);
      const allowances = formData.allowances || 0;
      const deductions = formData.deductions || 0;
      const netSalary = (formData.basicSalary || 0) + allowances - deductions;

      const newPayroll = await staffApi.create({
        staffId: formData.staffId,
        staffName: selectedStaff?.name || '',
        basicSalary: formData.basicSalary || 0,
        allowances,
        deductions,
        netSalary,
        payPeriod: formData.payPeriod,
        status: 'Pending',
        type: 'payroll'
      });
      setPayrolls([...payrolls, newPayroll]);
      
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Payroll record created successfully!');
    } catch (error) {
      toast.error('Failed to create payroll record');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string) => {
    const updated = await staffApi.update(id, { status: 'Paid', payDate: new Date().toISOString().split('T')[0], type: 'payroll' });
    setPayrolls(payrolls.map(p => p.id === id ? updated : p));
    toast.success('Payroll marked as paid!');
  };

  const filteredPayrolls = payrolls.filter(payroll =>
    payroll.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.payPeriod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payroll Management</CardTitle>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData({})}>
                    <Plus className="size-4 mr-2" />
                    Generate Payroll
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Payroll</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="staffId">Staff Member *</Label>
                      <select
                        id="staffId"
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="basicSalary">Basic Salary ($) *</Label>
                        <Input
                          id="basicSalary"
                          type="number"
                          value={formData.basicSalary || ''}
                          onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) })}
                          placeholder="Enter basic salary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="allowances">Allowances ($)</Label>
                        <Input
                          id="allowances"
                          type="number"
                          value={formData.allowances || ''}
                          onChange={(e) => setFormData({ ...formData, allowances: parseFloat(e.target.value) })}
                          placeholder="Enter allowances"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deductions">Deductions ($)</Label>
                        <Input
                          id="deductions"
                          type="number"
                          value={formData.deductions || ''}
                          onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) })}
                          placeholder="Enter deductions"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payPeriod">Pay Period *</Label>
                        <Input
                          id="payPeriod"
                          value={formData.payPeriod || ''}
                          onChange={(e) => setFormData({ ...formData, payPeriod: e.target.value })}
                          placeholder="e.g., January 2024"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd} disabled={loading}>
                      {loading ? 'Generating...' : 'Generate Payroll'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Search payrolls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-2 text-left">Staff</th>
                    <th className="border border-border px-4 py-2 text-left">Pay Period</th>
                    <th className="border border-border px-4 py-2 text-left">Basic Salary</th>
                    <th className="border border-border px-4 py-2 text-left">Allowances</th>
                    <th className="border border-border px-4 py-2 text-left">Deductions</th>
                    <th className="border border-border px-4 py-2 text-left">Net Salary</th>
                    <th className="border border-border px-4 py-2 text-left">Status</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrolls.map((payroll) => (
                    <tr key={payroll.id} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-2">{payroll.staffName}</td>
                      <td className="border border-border px-4 py-2">{payroll.payPeriod}</td>
                      <td className="border border-border px-4 py-2">${payroll.basicSalary}</td>
                      <td className="border border-border px-4 py-2">${payroll.allowances}</td>
                      <td className="border border-border px-4 py-2">${payroll.deductions}</td>
                      <td className="border border-border px-4 py-2 font-semibold">${payroll.netSalary}</td>
                      <td className="border border-border px-4 py-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          payroll.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payroll.status}
                        </span>
                      </td>
                      <td className="border border-border px-4 py-2">
                        {payroll.status === 'Pending' && (
                          <Button
                            size="sm"
                            onClick={() => markAsPaid(payroll.id)}
                            className="bg-[#38bdf8] hover:bg-[#0ea5e9]"
                          >
                            <DollarSign className="size-4 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPayrolls.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No payroll records found.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

