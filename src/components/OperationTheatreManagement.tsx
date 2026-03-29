import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Calendar, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { otApi } from '../utils/api';
  id: string;
  patientName: string;
  surgeonName: string;
  operationType: string;
  operationDate: string;
  operationTime: string;
  otNumber: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  duration: string;
  notes: string;
  amount: number;
}

interface OperationTheatreManagementProps {
  session: any;
}

export function OperationTheatreManagement({ session }: OperationTheatreManagementProps) {
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Surgery>>({});

  useEffect(() => {
    otApi.getAll().then(setSurgeries).catch(() => setSurgeries([]));
  }, []);

  const filteredSurgeries = surgeries.filter(surgery =>
    surgery.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surgery.surgeonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surgery.operationType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!formData.patientName || !formData.surgeonName || !formData.operationType) {
      toast.error('Please fill in required fields');
      return;
    }

    const newSurgery = await otApi.create({
      patientName: formData.patientName,
      surgeonName: formData.surgeonName,
      operationType: formData.operationType,
      operationDate: formData.operationDate || new Date().toISOString().split('T')[0],
      operationTime: formData.operationTime || '09:00',
      otNumber: formData.otNumber || 'OT-1',
      status: 'Scheduled',
      duration: formData.duration || '2 hours',
      notes: formData.notes || '',
      amount: formData.amount || 0
    });
    setSurgeries([...surgeries, newSurgery]);
    
    setFormData({});
    setIsAddModalOpen(false);
    toast.success('Surgery scheduled successfully!');
  };

  const updateStatus = async (id: string, status: Surgery['status']) => {
    const updated = await otApi.update(id, { status });
    setSurgeries(surgeries.map(s => s.id === id ? updated : s));
    toast.success('Status updated successfully!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this surgery?')) return;
    await otApi.delete(id);
    setSurgeries(surgeries.filter(s => s.id !== id));
    toast.success('Surgery deleted successfully!');
  };

  const operationTypes = [
    'Appendectomy', 'Cholecystectomy', 'Hernia Repair', 'Cataract Surgery',
    'Knee Replacement', 'Hip Replacement', 'Cardiac Surgery', 'Brain Surgery',
    'Gastric Surgery', 'Orthopedic Surgery', 'Plastic Surgery', 'Other'
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Operation Theatre Management</CardTitle>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData({})}>
                    <Plus className="size-4 mr-2" />
                    Schedule Surgery
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule New Surgery</DialogTitle>
                  </DialogHeader>
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
                      <Label htmlFor="surgeonName">Surgeon Name *</Label>
                      <Input
                        id="surgeonName"
                        value={formData.surgeonName || ''}
                        onChange={(e) => setFormData({ ...formData, surgeonName: e.target.value })}
                        placeholder="Enter surgeon name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="operationType">Operation Type *</Label>
                      <select
                        id="operationType"
                        value={formData.operationType || ''}
                        onChange={(e) => setFormData({ ...formData, operationType: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="">Select operation type</option>
                        {operationTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otNumber">OT Number</Label>
                      <select
                        id="otNumber"
                        value={formData.otNumber || 'OT-1'}
                        onChange={(e) => setFormData({ ...formData, otNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="OT-1">OT-1</option>
                        <option value="OT-2">OT-2</option>
                        <option value="OT-3">OT-3</option>
                        <option value="OT-4">OT-4</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="operationDate">Operation Date</Label>
                      <Input
                        id="operationDate"
                        type="date"
                        value={formData.operationDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, operationDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="operationTime">Operation Time</Label>
                      <Input
                        id="operationTime"
                        type="time"
                        value={formData.operationTime || '09:00'}
                        onChange={(e) => setFormData({ ...formData, operationTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={formData.duration || '2 hours'}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g., 2 hours"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <textarea
                        id="notes"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Enter any notes"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd}>Schedule Surgery</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Search surgeries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-2 text-left">Patient</th>
                    <th className="border border-border px-4 py-2 text-left">Surgeon</th>
                    <th className="border border-border px-4 py-2 text-left">Operation</th>
                    <th className="border border-border px-4 py-2 text-left">Date & Time</th>
                    <th className="border border-border px-4 py-2 text-left">OT</th>
                    <th className="border border-border px-4 py-2 text-left">Status</th>
                    <th className="border border-border px-4 py-2 text-left">Amount</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSurgeries.map((surgery) => (
                    <tr key={surgery.id} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-2">{surgery.patientName}</td>
                      <td className="border border-border px-4 py-2">{surgery.surgeonName}</td>
                      <td className="border border-border px-4 py-2">{surgery.operationType}</td>
                      <td className="border border-border px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{surgery.operationDate}</span>
                          <Clock className="h-4 w-4" />
                          <span>{surgery.operationTime}</span>
                        </div>
                      </td>
                      <td className="border border-border px-4 py-2">{surgery.otNumber}</td>
                      <td className="border border-border px-4 py-2">
                        <select
                          value={surgery.status}
                          onChange={(e) => updateStatus(surgery.id, e.target.value as Surgery['status'])}
                          className={`px-2 py-1 rounded text-sm ${
                            surgery.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            surgery.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            surgery.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="border border-border px-4 py-2">${surgery.amount}</td>
                      <td className="border border-border px-4 py-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(surgery.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSurgeries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No surgeries scheduled.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

