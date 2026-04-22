import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Patient } from '@/types/patient';
import { patientsService } from '@/services/patients.service';

export function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    patientsService.getAll().then(res => setPatients(res.data || [])).catch(() => setPatients([]));
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mobileno.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.patient_name || !formData.mobileno || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Prepare data with camelCase for API (backend will convert to snake_case)
      const patientData = {
        patientName: formData.patient_name,
        age: formData.age || '0',
        gender: formData.gender || 'Other',
        mobileno: formData.mobileno,
        email: formData.email || '',
        address: formData.address,
        bloodGroup: formData.blood_group || 'Unknown',
        dob: formData.dob || '',
        guardianName: formData.guardian_name || '',
        guardianPhone: formData.guardian_phone || '',
        maritalStatus: formData.marital_status || 'Single',
        knownAllergies: formData.known_allergies || 'None',
        note: formData.note || '',
      };

      const newPatient = await patientsService.create(patientData);
      setPatients([...patients, newPatient]);
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Patient added successfully!');
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('Failed to add patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData(patient);
    setIsAddModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedPatient?.id) return;

    setLoading(true);
    try {
      const patientData = {
        patientName: formData.patient_name,
        age: formData.age || '0',
        gender: formData.gender || 'Other',
        mobileno: formData.mobileno,
        email: formData.email || '',
        address: formData.address,
        bloodGroup: formData.blood_group || 'Unknown',
        dob: formData.dob || '',
        guardianName: formData.guardian_name || '',
        guardianPhone: formData.guardian_phone || '',
        maritalStatus: formData.marital_status || 'Single',
        knownAllergies: formData.known_allergies || 'None',
        note: formData.note || '',
      };

      const updated = await patientsService.update(selectedPatient.id.toString(), patientData);
      setPatients(patients.map(p => p.id === selectedPatient.id ? updated : p));
      setSelectedPatient(null);
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Patient updated successfully!');
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Failed to update patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this patient?')) return;

    setLoading(true);
    try {
      await patientsService.delete(id.toString());
      setPatients(patients.filter(p => p.id !== id));
      toast.success('Patient deleted successfully!');
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <CardTitle>Patient Management</CardTitle>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setSelectedPatient(null);
                      setFormData({});
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    <Plus className="size-4 mr-2" />
                    Add Patient
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{selectedPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient_name">Full Name</Label>
                      <Input
                        id="patient_name"
                        value={formData.patient_name || ''}
                        onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age || ''}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="Enter age"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Input
                        id="gender"
                        value={formData.gender || ''}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        placeholder="Enter gender"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blood_group">Blood Type</Label>
                      <Input
                        id="blood_group"
                        value={formData.blood_group || ''}
                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                        placeholder="e.g., O+, A-, AB+"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobileno">Phone</Label>
                      <Input
                        id="mobileno"
                        value={formData.mobileno || ''}
                        onChange={(e) => setFormData({ ...formData, mobileno: e.target.value })}
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
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admission_date">Admission Date</Label>
                      <Input
                        id="admission_date"
                        type="date"
                        value={formData.admission_date || ''}
                        onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={selectedPatient ? handleUpdate : handleAdd}>
                      {selectedPatient ? 'Update' : 'Add'} Patient
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
                  placeholder="Search patients by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-sm text-gray-900">{patient.patient_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Age / Gender</p>
                        <p className="text-sm text-gray-900">{patient.age} / {patient.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Blood Type</p>
                        <p className="text-sm text-gray-900">{patient.blood_group}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm text-gray-900">{patient.mobileno}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Admission</p>
                        <p className="text-sm text-gray-900">{patient.admission_date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(patient)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(patient.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredPatients.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No patients found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


