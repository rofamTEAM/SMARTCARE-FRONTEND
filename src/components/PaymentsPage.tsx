import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, CreditCard, Users, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { billingApi } from '../utils/api';
import { AutoFillButton } from './AutoFillButton';

interface PaymentsPageProps {
  session: any;
}

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  patient_id?: string;
  created_at: string;
}

export function PaymentsPage({ session }: PaymentsPageProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<Partial<Payment>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await billingApi.getAll();
      setPayments(data || []);
    } catch (error) {
      toast.error('Failed to fetch payments');
      setPayments([]);
    }
  };

  const handleAdd = async () => {
    if (!formData.amount || !formData.payment_method) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newPayment = await billingApi.create({
        patient_id: formData.patient_id || 'temp-patient-id',
        amount: formData.amount,
        payment_method: formData.payment_method,
        status: formData.status || 'pending',
        description: formData.description
      });
      
      setPayments([...payments, newPayment]);
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Payment added successfully!');
    } catch (error) {
      toast.error('Failed to add payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPayment) return;
    setLoading(true);
    
    try {
      const updatedPayment = await billingApi.update(selectedPayment.id, {
        amount: formData.amount,
        payment_method: formData.payment_method,
        status: formData.status,
        description: formData.description
      });
      
      setPayments(payments.map(p => p.id === selectedPayment.id ? updatedPayment : p));
      setSelectedPayment(null);
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Payment updated successfully!');
    } catch (error) {
      toast.error('Failed to update payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.payment_method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+12.5%', icon: DollarSign, color: 'from-green-500 to-green-600' },
    { label: 'Total Payments', value: payments.length.toString(), change: '+8.2%', icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
    { label: 'Pending Payments', value: `$${pendingPayments.toLocaleString()}`, change: '-5.4%', icon: CreditCard, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Completed', value: payments.filter(p => p.status === 'completed').length.toString(), change: '+15.3%', icon: Users, color: 'from-green-500 to-green-600' },
  ];



  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-gray-900 mb-2">Payments & Billing</h2>
        <p className="text-muted-foreground text-sm">Manage all financial transactions</p>
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
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl`}>
                      <Icon className="size-6 text-card-foreground" />
                    </div>
                    <span className="text-sm text-primary">{stat.change}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <h3 className="text-gray-900">{stat.value}</h3>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Payments Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Management</CardTitle>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setSelectedPayment(null);
                      setFormData({});
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="size-4 mr-2" />
                    Add Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedPayment ? 'Edit Payment' : 'Add New Payment'}</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-end mb-2">
                    <AutoFillButton
                      formType="billing"
                      onFill={(data) => setFormData((prev) => ({ ...prev, amount: data.amount, payment_method: 'Cash', description: data.notes, status: 'pending' }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <select
                        id="payment_method"
                        value={formData.payment_method || ''}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="">Select Method</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="insurance">Insurance</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        value={formData.status || 'pending'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'completed' | 'failed' })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter payment description"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={selectedPayment ? handleUpdate : handleAdd}
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {loading ? 'Saving...' : selectedPayment ? 'Update' : 'Add'} Payment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-3">
              {filteredPayments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <DollarSign className="size-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-gray-900">{payment.description || 'Payment'}</p>
                      <p className="text-sm text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-gray-900">${payment.amount}</span>
                    <span className="text-sm text-muted-foreground">{payment.payment_method}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      payment.status === 'completed' 
                        ? 'bg-green-100 text-primary' 
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-destructive'
                    }`}>
                      {payment.status}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setFormData(payment);
                          setIsAddModalOpen(true);
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredPayments.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No payments found. Click "Add Payment" to create one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


