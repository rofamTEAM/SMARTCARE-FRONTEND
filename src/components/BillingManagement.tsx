import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, DollarSign, FileText, TrendingUp, CreditCard, AlertCircle, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { billingApi } from '../utils/api';
import { AutoFillButton } from './AutoFillButton';
import { AIInsightPanel } from './AIInsightPanel';
import { VoiceAgent } from './VoiceAgent';

interface BillingRecord {
  id: string;
  patientId: string;
  patientName: string;
  billDate: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'Pending' | 'Partial' | 'Paid';
  services: string[];
  discount: number;
  tax: number;
  notes?: string;
}

interface BillingManagementProps {
  session: any;
}

export function BillingManagement({ session }: BillingManagementProps) {
  const [bills, setBills] = useState<BillingRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<BillingRecord>>({});
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const data = await billingApi.getAll();
      setBills(data || []);
    } catch (error) {
      setBills([]);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = [
    {
      label: 'Total Bills',
      value: bills.length.toString(),
      icon: FileText,
      color: 'bg-primary',
      change: '+12%'
    },
    {
      label: 'Total Revenue',
      value: `$${bills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(0)}`,
      icon: DollarSign,
      color: 'bg-primary',
      change: '+18%'
    },
    {
      label: 'Pending Amount',
      value: `$${bills.filter(b => b.status !== 'Paid').reduce((sum, bill) => sum + (bill.amount - bill.paidAmount), 0).toFixed(0)}`,
      icon: AlertCircle,
      color: 'bg-destructive',
      change: '-5%'
    },
    {
      label: 'Collection Rate',
      value: `${bills.length > 0 ? ((bills.reduce((sum, bill) => sum + bill.paidAmount, 0) / bills.reduce((sum, bill) => sum + bill.amount, 0)) * 100).toFixed(1) : 0}%`,
      icon: TrendingUp,
      color: 'bg-primary',
      change: '+3%'
    },
  ];

  // Chart data
  const statusData = [
    { name: 'Paid', value: bills.filter(b => b.status === 'Paid').length, color: 'hsl(var(--primary))' },
    { name: 'Partial', value: bills.filter(b => b.status === 'Partial').length, color: 'hsl(var(--primary))' },
    { name: 'Pending', value: bills.filter(b => b.status === 'Pending').length, color: 'hsl(var(--destructive))' },
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 45000, bills: 120 },
    { month: 'Feb', revenue: 52000, bills: 135 },
    { month: 'Mar', revenue: 48000, bills: 128 },
    { month: 'Apr', revenue: 61000, bills: 145 },
    { month: 'May', revenue: 58000, bills: 142 },
    { month: 'Jun', revenue: 65000, bills: 158 },
  ];

  const handleAdd = async () => {
    if (!formData.patientName || !formData.amount) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const newBill = await billingApi.create({
        patientName: formData.patientName,
        billDate: formData.billDate || new Date().toISOString().split('T')[0],
        dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: formData.amount || 0,
        paidAmount: formData.paidAmount || 0,
        status: (formData.paidAmount || 0) >= (formData.amount || 0) ? 'Paid' :
                (formData.paidAmount || 0) > 0 ? 'Partial' : 'Pending',
        services: formData.services || [],
        discount: formData.discount || 0,
        tax: formData.tax || 0,
        notes: formData.notes || ''
      });
      setBills([...bills, newBill]);
      
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Bill created successfully!');
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Failed to create bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (id: string, amount: number) => {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    try {
      const newPaidAmount = bill.paidAmount + amount;
      const updated = await billingApi.update(id, {
        paidAmount: newPaidAmount,
        status: newPaidAmount >= bill.amount ? 'Paid' : 'Partial'
      });
      setBills(bills.map(b => b.id === id ? updated : b));
      toast.success('Payment recorded successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to record payment.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    try {
      await billingApi.delete(id);
      setBills(bills.filter(b => b.id !== id));
      toast.success('Bill deleted successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete bill.');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <DollarSign className="size-8 text-primary" />
          Billing Management
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-muted-foreground">Manage patient bills and payments</p>
          <VoiceAgent department="billing" userRole={session?.role || 'receptionist'} />
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

      {/* AI Billing Insights */}
      <AIInsightPanel
        title="AI Revenue Insights"
        compact
        prompt={`Analyze billing data: Total bills: ${bills.length}, Total revenue: $${bills.reduce((s, b) => s + b.amount, 0).toFixed(0)}, Pending: ${bills.filter(b => b.status === 'Pending').length} bills, Paid: ${bills.filter(b => b.status === 'Paid').length} bills. Provide: 1) Revenue collection risk assessment, 2) Recommendations to improve collection rate, 3) Any billing anomalies to investigate.`}
      />

      <Tabs defaultValue="bills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Bills List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Bills</CardTitle>
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setFormData({})}>
                          <Plus className="size-4 mr-2" />
                          Create Bill
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create New Bill</DialogTitle>
                          <DialogDescription>
                            Enter the billing details below.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end mb-2">
                          <AutoFillButton
                            formType="billing"
                            onFill={(data) => setFormData((prev) => ({ ...prev, patientName: data.patientName, amount: data.amount, discount: data.discount, tax: data.tax, notes: data.notes, dueDate: data.dueDate }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="patientName">Patient Name *</Label>
                            <Input
                              id="patientName"
                              value={formData.patientName || ''}
                              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                              placeholder="Enter patient name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="amount">Amount ($) *</Label>
                            <Input
                              id="amount"
                              type="number"
                              value={formData.amount || ''}
                              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                              placeholder="Enter amount"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="billDate">Bill Date</Label>
                            <Input
                              id="billDate"
                              type="date"
                              value={formData.billDate || new Date().toISOString().split('T')[0]}
                              onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                              id="dueDate"
                              type="date"
                              value={formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="paidAmount">Paid Amount ($)</Label>
                            <Input
                              id="paidAmount"
                              type="number"
                              value={formData.paidAmount || ''}
                              onChange={(e) => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) })}
                              placeholder="Enter paid amount"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="discount">Discount ($)</Label>
                            <Input
                              id="discount"
                              type="number"
                              value={formData.discount || ''}
                              onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                              placeholder="Enter discount"
                            />
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                              id="notes"
                              value={formData.notes || ''}
                              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                              placeholder="Enter any additional notes"
                              className="w-full px-3 py-2 border border-border rounded-md"
                              rows={3}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAdd} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Bill'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                      <Input
                        placeholder="Search bills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    {filteredBills.map((bill, index) => (
                      <motion.div
                        key={bill.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="bg-primary p-3 rounded-xl text-card-foreground">
                              <FileText className="size-6" />
                            </div>
                            <div className="grid grid-cols-5 gap-4 flex-1">
                              <div>
                                <p className="text-xs text-muted-foreground">Bill ID</p>
                                <p className="text-sm font-medium text-gray-900">{bill.id}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Patient</p>
                                <p className="text-sm text-gray-900">{bill.patientName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Amount</p>
                                <p className="text-sm text-gray-900">${bill.amount}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Paid</p>
                                <p className="text-sm text-gray-900">${bill.paidAmount}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Status</p>
                                <Badge
                                  variant="outline"
                                  className={
                                    bill.status === 'Paid' ? 'border-primary text-primary bg-green-50' :
                                    bill.status === 'Partial' ? 'border-amber-500 text-amber-700 bg-amber-50' :
                                    'border-destructive text-destructive bg-red-50'
                                  }
                                >
                                  {bill.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {bill.status !== 'Paid' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const amount = prompt('Enter payment amount:');
                                  if (amount) handlePayment(bill.id, parseFloat(amount));
                                }}
                              >
                                <CreditCard className="size-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <FileText className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(bill.id)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        {bill.amount > bill.paidAmount && (
                          <div className="mt-3 ml-16">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Payment Progress</span>
                              <span className="text-gray-900">${bill.paidAmount} / ${bill.amount}</span>
                            </div>
                            <Progress value={(bill.paidAmount / bill.amount) * 100} className="mt-1" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {filteredBills.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        No bills found.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {statusData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="size-4 mr-2" />
                    Generate Invoice
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="size-4 mr-2" />
                    Record Payment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="size-4 mr-2" />
                    Payment Reminders
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bills Count */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bills" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center" variant="outline">
                  <FileText className="size-6 mb-2" />
                  Outstanding Bills Report
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center" variant="outline">
                  <DollarSign className="size-6 mb-2" />
                  Revenue Summary
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center" variant="outline">
                  <TrendingUp className="size-6 mb-2" />
                  Payment Analytics
                </Button>
                <Button className="h-20 flex flex-col items-center justify-center" variant="outline">
                  <Calendar className="size-6 mb-2" />
                  Monthly Statement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


