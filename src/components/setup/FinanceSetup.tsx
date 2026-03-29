import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Trash2, Edit, Plus, Search, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { financeApi } from '../../utils/api';

interface IncomeHead { id: string; name: string; description?: string; isActive: boolean; createdAt: string; }
interface ExpenseHead { id: string; name: string; description?: string; isActive: boolean; createdAt: string; }

const DEFAULT_INCOME: IncomeHead[] = [
  { id: '1', name: 'OPD Consultation', description: 'Income from outpatient consultations', isActive: true, createdAt: new Date().toISOString() },
  { id: '2', name: 'IPD Services', description: 'Income from inpatient services', isActive: true, createdAt: new Date().toISOString() },
  { id: '3', name: 'Pharmacy Sales', description: 'Income from medicine sales', isActive: true, createdAt: new Date().toISOString() },
  { id: '4', name: 'Laboratory Tests', description: 'Income from pathology and radiology tests', isActive: true, createdAt: new Date().toISOString() },
  { id: '5', name: 'Operation Theatre', description: 'Income from surgical procedures', isActive: true, createdAt: new Date().toISOString() },
];

const DEFAULT_EXPENSE: ExpenseHead[] = [
  { id: '1', name: 'Staff Salaries', description: 'Monthly salaries and wages', isActive: true, createdAt: new Date().toISOString() },
  { id: '2', name: 'Medical Supplies', description: 'Purchase of medical equipment and supplies', isActive: true, createdAt: new Date().toISOString() },
  { id: '3', name: 'Utilities', description: 'Electricity, water, gas, and other utilities', isActive: true, createdAt: new Date().toISOString() },
  { id: '4', name: 'Maintenance', description: 'Equipment and facility maintenance costs', isActive: true, createdAt: new Date().toISOString() },
  { id: '5', name: 'Administrative', description: 'Office supplies and administrative expenses', isActive: true, createdAt: new Date().toISOString() },
];

export default function FinanceSetup() {
  const [incomeHeads, setIncomeHeads] = useState<IncomeHead[]>([]);
  const [expenseHeads, setExpenseHeads] = useState<ExpenseHead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('income');
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeHead | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseHead | null>(null);
  const [incomeForm, setIncomeForm] = useState({ name: '', description: '' });
  const [expenseForm, setExpenseForm] = useState({ name: '', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [incomeData, expenseData] = await Promise.allSettled([
        financeApi.getIncomeHeads(),
        financeApi.getExpenseHeads(),
      ]);
      setIncomeHeads(incomeData.status === 'fulfilled' && incomeData.value?.length ? incomeData.value : DEFAULT_INCOME);
      setExpenseHeads(expenseData.status === 'fulfilled' && expenseData.value?.length ? expenseData.value : DEFAULT_EXPENSE);
    } catch {
      setIncomeHeads(DEFAULT_INCOME);
      setExpenseHeads(DEFAULT_EXPENSE);
    }
  };

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeForm.name.trim()) return;
    const data: IncomeHead = {
      id: editingIncome?.id || Date.now().toString(),
      name: incomeForm.name.trim(),
      description: incomeForm.description.trim(),
      isActive: true,
      createdAt: editingIncome?.createdAt || new Date().toISOString(),
    };
    if (editingIncome) {
      await financeApi.updateIncome(editingIncome.id, data).catch(() => {});
      setIncomeHeads(prev => prev.map(i => i.id === editingIncome.id ? data : i));
    } else {
      await financeApi.createIncome(data).catch(() => {});
      setIncomeHeads(prev => [...prev, data]);
    }
    setIncomeForm({ name: '', description: '' });
    setEditingIncome(null);
    setIsIncomeDialogOpen(false);
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income head?')) return;
    await financeApi.deleteIncome(id).catch(() => {});
    setIncomeHeads(prev => prev.filter(i => i.id !== id));
  };

  const toggleIncomeStatus = async (id: string) => {
    const item = incomeHeads.find(i => i.id === id);
    if (!item) return;
    await financeApi.updateIncome(id, { isActive: !item.isActive }).catch(() => {});
    setIncomeHeads(prev => prev.map(i => i.id === id ? { ...i, isActive: !i.isActive } : i));
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.name.trim()) return;
    const data: ExpenseHead = {
      id: editingExpense?.id || Date.now().toString(),
      name: expenseForm.name.trim(),
      description: expenseForm.description.trim(),
      isActive: true,
      createdAt: editingExpense?.createdAt || new Date().toISOString(),
    };
    if (editingExpense) {
      await financeApi.updateExpense(editingExpense.id, data).catch(() => {});
      setExpenseHeads(prev => prev.map(e => e.id === editingExpense.id ? data : e));
    } else {
      await financeApi.createExpense(data).catch(() => {});
      setExpenseHeads(prev => [...prev, data]);
    }
    setExpenseForm({ name: '', description: '' });
    setEditingExpense(null);
    setIsExpenseDialogOpen(false);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense head?')) return;
    await financeApi.deleteExpense(id).catch(() => {});
    setExpenseHeads(prev => prev.filter(e => e.id !== id));
  };

  const toggleExpenseStatus = async (id: string) => {
    const item = expenseHeads.find(e => e.id === id);
    if (!item) return;
    await financeApi.updateExpense(id, { isActive: !item.isActive }).catch(() => {});
    setExpenseHeads(prev => prev.map(e => e.id === id ? { ...e, isActive: !e.isActive } : e));
  };

  const filteredIncome = incomeHeads.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredExpense = expenseHeads.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Finance Setup</h2>
          <p className="text-gray-600">Manage income and expense categories</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="flex items-center p-6"><DollarSign className="h-8 w-8 text-blue-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-600">Total Categories</p><p className="text-2xl font-bold">{incomeHeads.length + expenseHeads.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-6"><TrendingUp className="h-8 w-8 text-green-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-600">Income Heads</p><p className="text-2xl font-bold text-green-600">{incomeHeads.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-6"><TrendingDown className="h-8 w-8 text-red-600" /><div className="ml-4"><p className="text-sm font-medium text-gray-600">Expense Heads</p><p className="text-2xl font-bold text-red-600">{expenseHeads.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center p-6"><div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center"><div className="h-4 w-4 bg-blue-600 rounded-full"></div></div><div className="ml-4"><p className="text-sm font-medium text-gray-600">Active</p><p className="text-2xl font-bold text-blue-600">{incomeHeads.filter(i=>i.isActive).length + expenseHeads.filter(e=>e.isActive).length}</p></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income">Income Heads</TabsTrigger>
          <TabsTrigger value="expense">Expense Heads</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Income Heads ({filteredIncome.length})</h3>
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingIncome(null); setIncomeForm({ name: '', description: '' }); }}>
                  <Plus className="w-4 h-4 mr-2" />Add Income Head
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingIncome ? 'Edit Income Head' : 'Add Income Head'}</DialogTitle></DialogHeader>
                <form onSubmit={handleIncomeSubmit} className="space-y-4">
                  <div><Label>Income Head Name *</Label><Input value={incomeForm.name} onChange={(e) => setIncomeForm(p => ({ ...p, name: e.target.value }))} placeholder="Enter income head name" required /></div>
                  <div><Label>Description</Label><Textarea value={incomeForm.description} onChange={(e) => setIncomeForm(p => ({ ...p, description: e.target.value }))} placeholder="Enter description" rows={3} /></div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsIncomeDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingIncome ? 'Update' : 'Save'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4">
            {filteredIncome.map(income => (
              <Card key={income.id} className={`border-l-4 ${income.isActive ? 'border-l-green-500' : 'border-l-gray-400'}`}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className={`w-5 h-5 ${income.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={income.isActive ? '' : 'text-gray-600'}>{income.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${income.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{income.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => toggleIncomeStatus(income.id)} className={income.isActive ? 'text-orange-600' : 'text-green-600'}>{income.isActive ? 'Disable' : 'Enable'}</Button>
                      <Button variant="outline" size="sm" onClick={() => { setEditingIncome(income); setIncomeForm({ name: income.name, description: income.description || '' }); setIsIncomeDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteIncome(income.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                {income.description && <CardContent><p className="text-sm text-gray-600">{income.description}</p></CardContent>}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expense" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Expense Heads ({filteredExpense.length})</h3>
            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingExpense(null); setExpenseForm({ name: '', description: '' }); }}>
                  <Plus className="w-4 h-4 mr-2" />Add Expense Head
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingExpense ? 'Edit Expense Head' : 'Add Expense Head'}</DialogTitle></DialogHeader>
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div><Label>Expense Head Name *</Label><Input value={expenseForm.name} onChange={(e) => setExpenseForm(p => ({ ...p, name: e.target.value }))} placeholder="Enter expense head name" required /></div>
                  <div><Label>Description</Label><Textarea value={expenseForm.description} onChange={(e) => setExpenseForm(p => ({ ...p, description: e.target.value }))} placeholder="Enter description" rows={3} /></div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingExpense ? 'Update' : 'Save'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4">
            {filteredExpense.map(expense => (
              <Card key={expense.id} className={`border-l-4 ${expense.isActive ? 'border-l-red-500' : 'border-l-gray-400'}`}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className={`w-5 h-5 ${expense.isActive ? 'text-red-600' : 'text-gray-400'}`} />
                      <span className={expense.isActive ? '' : 'text-gray-600'}>{expense.name}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${expense.isActive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{expense.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => toggleExpenseStatus(expense.id)} className={expense.isActive ? 'text-orange-600' : 'text-green-600'}>{expense.isActive ? 'Disable' : 'Enable'}</Button>
                      <Button variant="outline" size="sm" onClick={() => { setEditingExpense(expense); setExpenseForm({ name: expense.name, description: expense.description || '' }); setIsExpenseDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteExpense(expense.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                {expense.description && <CardContent><p className="text-sm text-gray-600">{expense.description}</p></CardContent>}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
