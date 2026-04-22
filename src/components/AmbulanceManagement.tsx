import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Truck, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { ambulanceApi } from '../utils/api';
import { VoiceAgent } from './VoiceAgent';

interface AmbulanceCall {
  id: string;
  id: string;
  patientName: string;
  contactNumber: string;
  pickupAddress: string;
  destination: string;
  callTime: string;
  status: 'Pending' | 'Dispatched' | 'Completed';
  driverName: string;
  vehicleNumber: string;
  amount: number;
}

interface AmbulanceManagementProps {
  session: any;
}

export function AmbulanceManagement({ session }: AmbulanceManagementProps) {
  const [calls, setCalls] = useState<AmbulanceCall[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<AmbulanceCall>>({});

  useEffect(() => {
    ambulanceApi.getCalls().then(setCalls).catch(() => setCalls([]));
  }, []);

  const filteredCalls = calls.filter(call =>
    call.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.contactNumber?.includes(searchTerm) ||
    call.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.patientName || !formData.contactNumber || !formData.pickupAddress) {
      toast.error('Please fill in required fields');
      return;
    }

    const newCall = await ambulanceApi.create({
      patientName: formData.patientName,
      contactNumber: formData.contactNumber,
      pickupAddress: formData.pickupAddress,
      destination: formData.destination || 'Hospital',
      callTime: new Date().toLocaleString(),
      status: 'Pending',
      driverName: formData.driverName || '',
      vehicleNumber: formData.vehicleNumber || '',
      amount: formData.amount || 0
    });
    setCalls([...calls, newCall]);
    
    setFormData({});
    setIsAddModalOpen(false);
    toast.success('Ambulance call registered successfully!');
  };

  const updateStatus = async (id: string, status: AmbulanceCall['status']) => {
    const updated = await ambulanceApi.update(id, { status });
    setCalls(calls.map(c => c.id === id ? updated : c));
    toast.success('Status updated successfully!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this call?')) return;
    await ambulanceApi.delete(id);
    setCalls(calls.filter(c => c.id !== id));
    toast.success('Call deleted successfully!');
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Truck className="h-6 w-6 mr-2" />
                Ambulance Management
              </CardTitle>
              <div className="flex items-center gap-2">
                <VoiceAgent department="ambulance" userRole={session?.role || 'receptionist'} />
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData({})}>
                    <Plus className="size-4 mr-2" />
                    New Call
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Register Ambulance Call</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="contactNumber">Contact Number *</Label>
                        <Input
                          id="contactNumber"
                          value={formData.contactNumber || ''}
                          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                          placeholder="Enter contact number"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupAddress">Pickup Address *</Label>
                      <textarea
                        id="pickupAddress"
                        value={formData.pickupAddress || ''}
                        onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                        placeholder="Enter pickup address"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="driverName">Driver Name</Label>
                        <Input
                          id="driverName"
                          value={formData.driverName || ''}
                          onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                          placeholder="Enter driver name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                        <Input
                          id="vehicleNumber"
                          value={formData.vehicleNumber || ''}
                          onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                          placeholder="Enter vehicle number"
                        />
                      </div>
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
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd}>Register Call</Button>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Search calls..."
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
                    <th className="border border-border px-4 py-2 text-left">Contact</th>
                    <th className="border border-border px-4 py-2 text-left">Pickup Address</th>
                    <th className="border border-border px-4 py-2 text-left">Vehicle</th>
                    <th className="border border-border px-4 py-2 text-left">Status</th>
                    <th className="border border-border px-4 py-2 text-left">Amount</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-2">{call.patientName}</td>
                      <td className="border border-border px-4 py-2">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {call.contactNumber}
                        </div>
                      </td>
                      <td className="border border-border px-4 py-2">{call.pickupAddress}</td>
                      <td className="border border-border px-4 py-2">{call.vehicleNumber}</td>
                      <td className="border border-border px-4 py-2">
                        <select
                          value={call.status}
                          onChange={(e) => updateStatus(call.id, e.target.value as AmbulanceCall['status'])}
                          className={`px-2 py-1 rounded text-sm ${
                            call.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            call.status === 'Dispatched' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="border border-border px-4 py-2">${call.amount}</td>
                      <td className="border border-border px-4 py-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(call.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCalls.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No ambulance calls found.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


