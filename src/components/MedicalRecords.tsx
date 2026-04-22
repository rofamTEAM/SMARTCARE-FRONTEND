import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, FileText, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AIDiagnosisHelper } from './AIDiagnosisHelper';

interface MedicalRecord {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  prescription: string;
  notes: string;
}

export function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([
    {
      id: '1',
      patientName: 'John Doe',
      patientId: 'P001',
      doctorName: 'Dr. Sarah Johnson',
      date: '2024-11-25',
      diagnosis: 'Hypertension',
      symptoms: 'High blood pressure, headaches, dizziness',
      treatment: 'Prescribed medication and lifestyle changes',
      prescription: 'Lisinopril 10mg once daily',
      notes: 'Follow-up required in 2 weeks'
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      patientId: 'P002',
      doctorName: 'Dr. Michael Chen',
      date: '2024-11-28',
      diagnosis: 'Migraine',
      symptoms: 'Severe headache, sensitivity to light, nausea',
      treatment: 'Pain management and preventive medication',
      prescription: 'Sumatriptan 50mg as needed',
      notes: 'Advised to maintain headache diary'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<MedicalRecord | null>(null);
  const [formData, setFormData] = useState<Partial<MedicalRecord>>({});

  const filteredRecords = records.filter(record =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    const newRecord: MedicalRecord = {
      id: Date.now().toString(),
      patientName: formData.patientName || '',
      patientId: formData.patientId || '',
      doctorName: formData.doctorName || '',
      date: formData.date || new Date().toISOString().split('T')[0],
      diagnosis: formData.diagnosis || '',
      symptoms: formData.symptoms || '',
      treatment: formData.treatment || '',
      prescription: formData.prescription || '',
      notes: formData.notes || ''
    };
    setRecords([...records, newRecord]);
    setFormData({});
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Medical Records</CardTitle>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setFormData({});
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600"
                  >
                    <Plus className="size-4 mr-2" />
                    Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Medical Record</DialogTitle>
                  </DialogHeader>
                  <AIDiagnosisHelper
                    symptoms={formData.symptoms}
                    diagnosis={formData.diagnosis}
                    onSuggestion={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                  />
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Patient Name</Label>
                      <Input
                        id="patientName"
                        value={formData.patientName || ''}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        placeholder="Enter patient name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientId">Patient ID</Label>
                      <Input
                        id="patientId"
                        value={formData.patientId || ''}
                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                        placeholder="P001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctorName">Doctor Name</Label>
                      <Input
                        id="doctorName"
                        value={formData.doctorName || ''}
                        onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                        placeholder="Dr. John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date || ''}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Input
                        id="diagnosis"
                        value={formData.diagnosis || ''}
                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                        placeholder="Primary diagnosis"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="symptoms">Symptoms</Label>
                      <Textarea
                        id="symptoms"
                        value={formData.symptoms || ''}
                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                        placeholder="List of symptoms"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="treatment">Treatment Plan</Label>
                      <Textarea
                        id="treatment"
                        value={formData.treatment || ''}
                        onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                        placeholder="Describe treatment plan"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="prescription">Prescription</Label>
                      <Textarea
                        id="prescription"
                        value={formData.prescription || ''}
                        onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                        placeholder="Medication details"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any additional notes"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdd}>
                      Add Record
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
                  placeholder="Search by patient name, ID, or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 hover:shadow-md transition-all border border-indigo-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl text-card-foreground">
                        <FileText className="size-6" />
                      </div>
                      <div className="flex-1">
                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Patient</p>
                            <p className="text-sm text-gray-900">{record.patientName}</p>
                            <p className="text-xs text-muted-foreground">{record.patientId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Doctor</p>
                            <p className="text-sm text-gray-900">{record.doctorName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="text-sm text-gray-900">{record.date}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Diagnosis</p>
                            <p className="text-sm text-gray-900">{record.diagnosis}</p>
                          </div>
                        </div>
                        <div className="bg-card/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Symptoms:</p>
                          <p className="text-sm text-gray-900">{record.symptoms}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewRecord(record)}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Medical Record Details</DialogTitle>
                          </DialogHeader>
                          {viewRecord && (
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Patient Name</p>
                                  <p className="text-gray-900">{viewRecord.patientName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Patient ID</p>
                                  <p className="text-gray-900">{viewRecord.patientId}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Doctor</p>
                                  <p className="text-gray-900">{viewRecord.doctorName}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Date</p>
                                  <p className="text-gray-900">{viewRecord.date}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Diagnosis</p>
                                <p className="text-gray-900">{viewRecord.diagnosis}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Symptoms</p>
                                <p className="text-gray-900">{viewRecord.symptoms}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Treatment Plan</p>
                                <p className="text-gray-900">{viewRecord.treatment}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Prescription</p>
                                <p className="text-gray-900">{viewRecord.prescription}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                                <p className="text-gray-900">{viewRecord.notes}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end">
                            <Button variant="outline">
                              <Download className="size-4 mr-2" />
                              Download PDF
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredRecords.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No medical records found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


