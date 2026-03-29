import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Eye, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { radiologyApi } from '../utils/api';
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  testType: string;
  doctorName: string;
  testDate: string;
  reportDate?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  results?: string;
  cost: number;
  notes?: string;
  imageUrl?: string;
}

interface RadiologyManagementProps {
  session: any;
}

export function RadiologyManagement({ session }: RadiologyManagementProps) {
  const [tests, setTests] = useState<RadiologyTest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<RadiologyTest>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const data = await radiologyApi.getAll();
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
      const newTest = await radiologyApi.create({
        patientName: formData.patientName,
        testName: formData.testName,
        testType: formData.testType || 'X-Ray',
        doctorName: formData.doctorName,
        testDate: formData.testDate || new Date().toISOString().split('T')[0],
        status: 'Scheduled',
        cost: formData.cost || 0,
        notes: formData.notes || ''
      });
      setTests([...tests, newTest]);
      
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Radiology test scheduled successfully!');
    } catch (error) {
      console.error('Error adding test:', error);
      toast.error('Failed to schedule test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: RadiologyTest['status']) => {
    const updated = await radiologyApi.update(id, {
      status,
      reportDate: status === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
    });
    setTests(tests.map(t => t.id === id ? updated : t));
    toast.success('Test status updated successfully!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    await radiologyApi.delete(id);
    setTests(tests.filter(t => t.id !== id));
    toast.success('Test deleted successfully!');
  };

  const testTypes = [
    'X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Mammography', 
    'Fluoroscopy', 'Nuclear Medicine', 'PET Scan', 'Angiography'
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
              <CardTitle>Radiology Management</CardTitle>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData({})}>
                    <Plus className="size-4 mr-2" />
                    Schedule Test
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule New Radiology Test</DialogTitle>
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
                        value={formData.testType || 'X-Ray'}
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
                      <Label htmlFor="testDate">Test Date</Label>
                      <Input
                        id="testDate"
                        type="date"
                        value={formData.testDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
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
                      {loading ? 'Scheduling...' : 'Schedule Test'}
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
                    <th className="border border-border px-4 py-2 text-left">Test Date</th>
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
                      <td className="border border-border px-4 py-2">{test.testDate}</td>
                      <td className="border border-border px-4 py-2">
                        <select
                          value={test.status}
                          onChange={(e) => handleStatusUpdate(test.id, e.target.value as RadiologyTest['status'])}
                          className={`px-2 py-1 rounded text-sm ${
                            test.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            test.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="border border-border px-4 py-2">${test.cost}</td>
                      <td className="border border-border px-4 py-2">
                        <div className="flex space-x-2">
                          {test.status === 'Completed' && (
                            <>
                              <Button size="sm" variant="outline">
                                <Eye className="size-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="size-4" />
                              </Button>
                            </>
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
                No radiology tests found.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

