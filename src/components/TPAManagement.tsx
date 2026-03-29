import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Shield, FileText, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { tpaApi } from '../utils/api';
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  policyTypes: string[];
  cashlessLimit: number;
  reimbursementLimit: number;
  status: 'Active' | 'Inactive';
  contractStart: string;
  contractEnd: string;
  commissionRate: number;
}

interface TPAManagementProps {
  session: any;
}

export function TPAManagement({ session }: TPAManagementProps) {
  const [tpas, setTpas] = useState<TPA[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<TPA>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTPAs();
  }, []);

  const fetchTPAs = async () => {
    try {
      const data = await tpaApi.getAll();
      setTpas(data || []);
    } catch (error) {
      setTpas([]);
    }
  };

  const filteredTPAs = tpas.filter(tpa =>
    tpa.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tpa.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.name || !formData.contactPerson || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newTPA = await tpaApi.create({
        name: formData.name,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email || '',
        address: formData.address || '',
        policyTypes: formData.policyTypes || [],
        cashlessLimit: formData.cashlessLimit || 0,
        reimbursementLimit: formData.reimbursementLimit || 0,
        status: 'Active',
        contractStart: formData.contractStart || '',
        contractEnd: formData.contractEnd || '',
        commissionRate: formData.commissionRate || 0
      });
      setTpas([...tpas, newTPA]);
      
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('TPA added successfully!');
    } catch (error) {
      console.error('Error adding TPA:', error);
      toast.error('Failed to add TPA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id: string) => {
    const tpa = tpas.find(t => t.id === id);
    if (!tpa) return;
    const updated = await tpaApi.update(id, { status: tpa.status === 'Active' ? 'Inactive' : 'Active' });
    setTpas(tpas.map(t => t.id === id ? updated : t));
    toast.success('TPA status updated successfully!');
  };

  const policyTypeOptions = [
    'Health Insurance',
    'Life Insurance',
    'Accident Insurance',
    'Critical Illness',
    'Maternity Coverage',
    'Dental Coverage',
    'Vision Coverage',
    'Disability Insurance'
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5" />
                TPA Management
              </CardTitle>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData({})}>
                    <Plus className="size-4 mr-2" />
                    Add TPA
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New TPA</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">TPA Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter TPA name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson || ''}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="Enter contact person name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <textarea
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter address"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cashlessLimit">Cashless Limit ($)</Label>
                      <Input
                        id="cashlessLimit"
                        type="number"
                        value={formData.cashlessLimit || ''}
                        onChange={(e) => setFormData({ ...formData, cashlessLimit: parseFloat(e.target.value) })}
                        placeholder="Enter cashless limit"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reimbursementLimit">Reimbursement Limit ($)</Label>
                      <Input
                        id="reimbursementLimit"
                        type="number"
                        value={formData.reimbursementLimit || ''}
                        onChange={(e) => setFormData({ ...formData, reimbursementLimit: parseFloat(e.target.value) })}
                        placeholder="Enter reimbursement limit"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contractStart">Contract Start</Label>
                      <Input
                        id="contractStart"
                        type="date"
                        value={formData.contractStart || ''}
                        onChange={(e) => setFormData({ ...formData, contractStart: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contractEnd">Contract End</Label>
                      <Input
                        id="contractEnd"
                        type="date"
                        value={formData.contractEnd || ''}
                        onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                      <Input
                        id="commissionRate"
                        type="number"
                        step="0.1"
                        value={formData.commissionRate || ''}
                        onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
                        placeholder="Enter commission rate"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdd} disabled={loading}>
                      {loading ? 'Adding...' : 'Add TPA'}
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
                placeholder="Search TPAs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTPAs.map((tpa) => (
                <motion.div
                  key={tpa.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="size-5 text-primary" />
                      <h3 className="font-semibold">{tpa.name}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      tpa.status === 'Active' ? 'bg-green-100 text-primary' : 'bg-red-100 text-destructive'
                    }`}>
                      {tpa.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Contact:</span> {tpa.contactPerson}</p>
                    <p><span className="font-medium">Phone:</span> {tpa.phone}</p>
                    <p><span className="font-medium">Email:</span> {tpa.email}</p>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Cashless Limit</p>
                        <p className="text-primary">${tpa.cashlessLimit?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Reimbursement</p>
                        <p className="text-primary">${tpa.reimbursementLimit?.toLocaleString()}</p>
                      </div>
                    </div>
                    {tpa.commissionRate > 0 && (
                      <p><span className="font-medium">Commission:</span> {tpa.commissionRate}%</p>
                    )}
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      variant={tpa.status === 'Active' ? 'destructive' : 'default'}
                      onClick={() => handleStatusToggle(tpa.id)}
                      className="flex-1"
                    >
                      {tpa.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="size-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <DollarSign className="size-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredTPAs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No TPAs found.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

