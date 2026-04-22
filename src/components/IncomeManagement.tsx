import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { financeApi } from '../utils/api';

interface Income {
  id: string;
  name: string;
  date: string;
  amount: number;
  category: string;
  description: string;
}

interface IncomeManagementProps {
  session: any;
}

export function IncomeManagement({ session }: IncomeManagementProps) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Income>>({});

  useEffect(() => {
    financeApi.getIncome().then(setIncomes).catch(() => setIncomes([]));
  }, []);

  const filteredIncomes = incomes.filter(income =>
    income.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    income.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.name || !formData.amount || !formData.category) {
      toast.error('Please fill in required fields');
      return;
    }

    const newIncome = await financeApi.createIncome({
      name: formData.name,
      date: formData.date || new Date().toISOString().split('T')[0],
      amount: formData.amount || 0,
      category: formData.category,
      description: formData.description || ''
    });
    setIncomes([...incomes, newIncome]);
    
    setFormData({});
    setIsAddModalOpen(false);
    toast.success('Income added successfully!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income record?')) return;
    await financeApi.deleteIncome(id);
    setIncomes(incomes.filter(i => i.id !== id));
    toast.success('Income record deleted successfully!');
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Income Management</CardTitle>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData({})}>
                    <Plus className="size-4 mr-2" />
                    Add Income
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Income</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Income Source *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter income source"
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
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="">Select category</option>
                        <option value="OPD">OPD</option>
                        <option value="IPD">IPD</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Pathology">Pathology</option>
                        <option value="Radiology">Radiology</option>
                        <option value="Blood Bank">Blood Bank</option>
                        <option value="Ambulance">Ambulance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter description"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd}>Add Income</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  placeholder="Search income records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="size-4 text-primary" />
                <span className="font-semibold">Total: ${totalIncome.toFixed(2)}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-2 text-left">Source</th>
                    <th className="border border-border px-4 py-2 text-left">Category</th>
                    <th className="border border-border px-4 py-2 text-left">Amount</th>
                    <th className="border border-border px-4 py-2 text-left">Date</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomes.map((income) => (
                    <tr key={income.id} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-2">{income.name}</td>
                      <td className="border border-border px-4 py-2">{income.category}</td>
                      <td className="border border-border px-4 py-2">${income.amount}</td>
                      <td className="border border-border px-4 py-2">{income.date}</td>
                      <td className="border border-border px-4 py-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(income.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredIncomes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No income records found.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

