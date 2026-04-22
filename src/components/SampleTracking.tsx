import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Beaker, Clock, CheckCircle, AlertTriangle, QrCode, Printer } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface Sample {
  id: string;
  sample_id: string;
  patient_name: string;
  patient_id: string;
  test_type: string;
  sample_type: string;
  collection_time: string;
  collected_by: string;
  status: 'collected' | 'received' | 'processing' | 'completed' | 'rejected';
  priority: 'routine' | 'urgent' | 'stat';
  location: string;
  temperature: string;
  notes?: string;
  results?: string;
  verified_by?: string;
}

interface QualityControl {
  id: string;
  test_name: string;
  control_type: 'normal' | 'high' | 'low';
  expected_range: string;
  actual_value: string;
  status: 'pass' | 'fail' | 'pending';
  run_date: string;
  technician: string;
}

export function SampleTracking({ session }: { session: any }) {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [qcRecords, setQcRecords] = useState<QualityControl[]>([]);
  const [activeTab, setActiveTab] = useState<'samples' | 'quality_control'>('samples');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddSample, setShowAddSample] = useState(false);
  const [showQcModal, setShowQcModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    // Mock data - replace with actual API calls
    const mockSamples: Sample[] = [
      {
        id: '1',
        sample_id: 'LAB001',
        patient_name: 'John Smith',
        patient_id: 'P001',
        test_type: 'Complete Blood Count',
        sample_type: 'Blood',
        collection_time: '2024-01-15 08:30',
        collected_by: 'Nurse Johnson',
        status: 'processing',
        priority: 'routine',
        location: 'Hematology Lab',
        temperature: 'Room Temperature'
      },
      {
        id: '2',
        sample_id: 'LAB002',
        patient_name: 'Emily Davis',
        patient_id: 'P002',
        test_type: 'Cardiac Enzymes',
        sample_type: 'Serum',
        collection_time: '2024-01-15 09:15',
        collected_by: 'Tech Wilson',
        status: 'completed',
        priority: 'stat',
        location: 'Chemistry Lab',
        temperature: 'Refrigerated',
        results: 'Troponin I: 0.02 ng/mL (Normal)',
        verified_by: 'Dr. Anderson'
      }
    ];

    const mockQc: QualityControl[] = [
      {
        id: '1',
        test_name: 'Glucose',
        control_type: 'normal',
        expected_range: '90-110 mg/dL',
        actual_value: '98 mg/dL',
        status: 'pass',
        run_date: '2024-01-15',
        technician: 'Tech Smith'
      },
      {
        id: '2',
        test_name: 'Hemoglobin',
        control_type: 'high',
        expected_range: '16-18 g/dL',
        actual_value: '19.2 g/dL',
        status: 'fail',
        run_date: '2024-01-15',
        technician: 'Tech Johnson'
      }
    ];

    setSamples(mockSamples);
    setQcRecords(mockQc);
  };

  const handleUpdateSampleStatus = (sampleId: string, newStatus: Sample['status']) => {
    setSamples(samples.map(sample => 
      sample.id === sampleId 
        ? { ...sample, status: newStatus }
        : sample
    ));
    toast.success(`Sample status updated to ${newStatus}`);
  };

  const handleAddResults = (sampleId: string, results: string) => {
    setSamples(samples.map(sample => 
      sample.id === sampleId 
        ? { 
            ...sample, 
            results, 
            status: 'completed' as const,
            verified_by: session?.name || 'Current User'
          }
        : sample
    ));
    toast.success('Results added successfully!');
  };

  const generateSampleId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `LAB${timestamp}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collected': return 'bg-blue-100 text-primary';
      case 'received': return 'bg-purple-100 text-primary';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-primary';
      case 'rejected': return 'bg-red-100 text-destructive';
      case 'pass': return 'bg-green-100 text-primary';
      case 'fail': return 'bg-red-100 text-destructive';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-muted text-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat': return 'bg-red-100 text-destructive';
      case 'urgent': return 'bg-orange-100 text-primary';
      case 'routine': return 'bg-green-100 text-primary';
      default: return 'bg-muted text-foreground';
    }
  };

  const filteredSamples = samples.filter(sample => {
    const matchesSearch = sample.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.sample_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sample.test_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sample.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sample Tracking & QC</h1>
          <p className="text-muted-foreground">Track samples and manage quality control</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddSample(true)}>
            <Plus className="size-4 mr-2" />
            Add Sample
          </Button>
          <Button variant="outline" onClick={() => setShowQcModal(true)}>
            <CheckCircle className="size-4 mr-2" />
            QC Check
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('samples')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'samples'
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-gray-900'
          }`}
        >
          <Beaker className="size-4 mr-2 inline" />
          Sample Tracking
        </button>
        <button
          onClick={() => setActiveTab('quality_control')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'quality_control'
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-gray-900'
          }`}
        >
          <CheckCircle className="size-4 mr-2 inline" />
          Quality Control
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search samples..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {activeTab === 'samples' && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="collected">Collected</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Content */}
      {activeTab === 'samples' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="size-5 text-primary" />
              Sample Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSamples.map((sample) => (
                <motion.div
                  key={sample.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Beaker className="size-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{sample.sample_id}</h3>
                          <Badge className={getPriorityColor(sample.priority)}>
                            {sample.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{sample.patient_name} (ID: {sample.patient_id})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(sample.status)}>
                        {sample.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <QrCode className="size-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium">Test Type:</span>
                      <p className="text-gray-900">{sample.test_type}</p>
                    </div>
                    <div>
                      <span className="font-medium">Sample Type:</span>
                      <p className="text-gray-900">{sample.sample_type}</p>
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>
                      <p className="text-gray-900">{sample.location}</p>
                    </div>
                    <div>
                      <span className="font-medium">Temperature:</span>
                      <p className="text-gray-900">{sample.temperature}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium">Collection Time:</span>
                      <p className="text-gray-900 flex items-center gap-1">
                        <Clock className="size-4" />
                        {new Date(sample.collection_time).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Collected By:</span>
                      <p className="text-gray-900">{sample.collected_by}</p>
                    </div>
                  </div>

                  {sample.results && (
                    <div className="mb-3 p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-800">Results:</span>
                      <p className="text-green-900">{sample.results}</p>
                      {sample.verified_by && (
                        <p className="text-sm text-primary mt-1">Verified by: {sample.verified_by}</p>
                      )}
                    </div>
                  )}

                  {sample.notes && (
                    <div className="mb-3 text-sm">
                      <span className="font-medium">Notes:</span>
                      <p className="text-foreground">{sample.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t">
                    {sample.status === 'collected' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateSampleStatus(sample.id, 'received')}
                      >
                        Mark Received
                      </Button>
                    )}
                    {sample.status === 'received' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateSampleStatus(sample.id, 'processing')}
                      >
                        Start Processing
                      </Button>
                    )}
                    {sample.status === 'processing' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const results = prompt('Enter test results:');
                          if (results) handleAddResults(sample.id, results);
                        }}
                        className="bg-primary hover:bg-green-700"
                      >
                        Add Results
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSample(sample)}
                    >
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'quality_control' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-primary" />
              Quality Control Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-2 text-left">Test Name</th>
                    <th className="border border-border px-4 py-2 text-left">Control Type</th>
                    <th className="border border-border px-4 py-2 text-left">Expected Range</th>
                    <th className="border border-border px-4 py-2 text-left">Actual Value</th>
                    <th className="border border-border px-4 py-2 text-left">Status</th>
                    <th className="border border-border px-4 py-2 text-left">Run Date</th>
                    <th className="border border-border px-4 py-2 text-left">Technician</th>
                  </tr>
                </thead>
                <tbody>
                  {qcRecords.map((qc) => (
                    <tr key={qc.id} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-2 font-medium">{qc.test_name}</td>
                      <td className="border border-border px-4 py-2">
                        <Badge variant="outline">{qc.control_type}</Badge>
                      </td>
                      <td className="border border-border px-4 py-2">{qc.expected_range}</td>
                      <td className="border border-border px-4 py-2">{qc.actual_value}</td>
                      <td className="border border-border px-4 py-2">
                        <Badge className={getStatusColor(qc.status)}>
                          {qc.status}
                        </Badge>
                      </td>
                      <td className="border border-border px-4 py-2">{qc.run_date}</td>
                      <td className="border border-border px-4 py-2">{qc.technician}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Sample Modal */}
      <Dialog open={showAddSample} onOpenChange={setShowAddSample}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Sample</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sample ID</Label>
                <Input value={generateSampleId()} disabled />
              </div>
              <div>
                <Label>Patient ID</Label>
                <Input placeholder="Enter patient ID" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Patient Name</Label>
                <Input placeholder="Enter patient name" />
              </div>
              <div>
                <Label>Test Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbc">Complete Blood Count</SelectItem>
                    <SelectItem value="chemistry">Basic Chemistry Panel</SelectItem>
                    <SelectItem value="cardiac">Cardiac Enzymes</SelectItem>
                    <SelectItem value="lipid">Lipid Panel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sample Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sample type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood">Blood</SelectItem>
                    <SelectItem value="serum">Serum</SelectItem>
                    <SelectItem value="plasma">Plasma</SelectItem>
                    <SelectItem value="urine">Urine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="stat">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-md"
                rows={3}
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Add Sample</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddSample(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sample Details Modal */}
      <Dialog open={!!selectedSample} onOpenChange={() => setSelectedSample(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sample Details</DialogTitle>
          </DialogHeader>
          {selectedSample && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sample ID</Label>
                  <p className="font-medium">{selectedSample.sample_id}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedSample.status)}>
                    {selectedSample.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient</Label>
                  <p className="font-medium">{selectedSample.patient_name}</p>
                </div>
                <div>
                  <Label>Test Type</Label>
                  <p className="font-medium">{selectedSample.test_type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Collection Time</Label>
                  <p>{new Date(selectedSample.collection_time).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Collected By</Label>
                  <p>{selectedSample.collected_by}</p>
                </div>
              </div>
              {selectedSample.results && (
                <div>
                  <Label>Results</Label>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-green-900">{selectedSample.results}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

