import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, FileText, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { pathologyApi } from '../utils/api';
import { VoiceAgent } from './VoiceAgent';

interface PathologyTest {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  testType: string;
  doctorName: string;
  sampleDate: string;
  reportDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  results?: string;
  cost: number;
  notes?: string;
}

interface PathologyManagementProps {
  session: any;
}

export function PathologyManagement({ session }: PathologyManagementProps) {
  const [tests, setTests] = useState<PathologyTest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PathologyTest>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const data = await pathologyApi.getAll();
      setTests(data || []);
    } catch (error) {
      setTests([]);
    }
  };

  const filteredTests = tests.filter(test =>
    test.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.patientName || !formData.testName || !formData.doctorName || !formData.cost) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newTest = await pathologyApi.create({
        patientName: formData.patientName,
        testName: formData.testName,
        testType: formData.testType || 'Blood Test',
        doctorName: formData.doctorName,
        sampleDate: formData.sampleDate || new Date().toISOString().split('T')[0],
        status: 'Pending',
        cost: formData.cost || 0,
        notes: formData.notes || ''
      });
      setTests([...tests, newTest]);
      
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Pathology test added successfully!');
    } catch (error) {
      console.error('Error adding test:', error);
      toast.error('Failed to add test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: PathologyTest['status']) => {
    const updated = await pathologyApi.update(id, {
      status,
      reportDate: status === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
    });
    setTests(tests.map(t => t.id === id ? updated : t));
    toast.success('Test status updated successfully!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    await pathologyApi.delete(id);
    setTests(tests.filter(t => t.id !== id));
    toast.success('Test deleted successfully!');
  };

  const testTypes = [
    'Blood Test', 'Urine Test', 'Stool Test', 'Biopsy', 'Culture Test',
    'Glucose Test', 'Cholesterol Test', 'Liver Function Test', 'Kidney Function Test'
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
              <CardTitle>Pathology Management</CardTitle>
              <div className="flex items-center gap-2">
                <VoiceAgent department="pathology" userRole={session?.role || 'lab_technician'} />
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData({})}>
                    <Plus className="size-4 mr-2" />
                    Add Test
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Pathology Test</DialogTitle>
                    <DialogDescription>
                      Enter the test details below.
                    </DialogDescription>
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
                      <Label htmlFor="testName">Test Name *</Label>
                      <Input
                        id="testName"
                        value={formData.testName || ''}
                        onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                        placeholder="Enter test name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="testType">Test Type</Label>
                      <select
                        id="testType"
                        value={formData.testType || 'Blood Test'}
                        onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        {testTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctorName">Doctor Name *</Label>
                      <Input
                        id="doctorName"
                        value={formData.doctorName || ''}
                        onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                        placeholder="Enter doctor name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sampleDate">Sample Date</Label>
                      <Input
                        id="sampleDate"
                        type="date"
                        value={formData.sampleDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, sampleDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">Cost ($) *</Label>
                      <Input
                        id="cost"
                        type="number"
                        value={formData.cost || ''}
                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                        placeholder="Enter cost"
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
                      {loading ? 'Adding...' : 'Add Test'}
                    </Button>
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
                placeholder="Search tests..."
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
                    <th className="border border-border px-4 py-2 text-left">Test Name</th>
                    <th className="border border-border px-4 py-2 text-left">Type</th>
                    <th className="border border-border px-4 py-2 text-left">Doctor</th>
                    <th className="border border-border px-4 py-2 text-left">Sample Date</th>
                    <th className="border border-border px-4 py-2 text-left">Status</th>
                    <th className="border border-border px-4 py-2 text-left">Cost</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map((test) => (
                    <tr key={test.id} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-2">{test.patientName}</td>
                      <td className="border border-border px-4 py-2">{test.testName}</td>
                      <td className="border border-border px-4 py-2">{test.testType}</td>
                      <td className="border border-border px-4 py-2">{test.doctorName}</td>
                      <td className="border border-border px-4 py-2">{test.sampleDate}</td>
                      <td className="border border-border px-4 py-2">
                        <select
                          value={test.status}
                          onChange={(e) => handleStatusUpdate(test.id, e.target.value as PathologyTest['status'])}
                          className={`px-2 py-1 rounded text-sm ${
                            test.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            test.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="border border-border px-4 py-2">${test.cost}</td>
                      <td className="border border-border px-4 py-2">
                        <div className="flex space-x-2">
                          {test.status === 'Completed' && (
                            <Button size="sm" variant="outline">
                              <Download className="size-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(test.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pathology tests found.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

