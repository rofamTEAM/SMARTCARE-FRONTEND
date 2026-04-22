import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, Trash } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { patientsApi } from '../utils/api';
import { VoiceAgent } from './VoiceAgent';
import { useFormSubmit } from '../hooks/useFormSubmit';

interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: string;
  bloodType?: string;
  address?: string;
  condition?: string;
  admissionDate?: string;
  patientType?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianAddress?: string;
  guardianEmail?: string;
  maritalStatus?: string;
  knownAllergies?: string;
  organisation?: string;
  note?: string;
}

interface PatientsPageProps {
  session: any;
}

export function PatientsPage({ session }: PatientsPageProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set());
  const [isDeleteAllLoading, setIsDeleteAllLoading] = useState(false);
  
  const { submit: submitAdd, loading: addLoading } = useFormSubmit({
    successMessage: 'Patient added successfully!',
    errorMessage: 'Failed to add patient. Please try again.',
  });

  const { submit: submitUpdate, loading: updateLoading } = useFormSubmit({
    successMessage: 'Patient updated successfully!',
    errorMessage: 'Failed to update patient. Please try again.',
  });

  const loading = addLoading || updateLoading;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await patientsApi.getAll();
      // Transform snake_case to camelCase
      const transformedPatients = (data || []).map((patient: any) => ({
        id: patient.id?.toString() || '',
        name: patient.patient_name || patient.patientName || '',
        phone: patient.mobileno || patient.phone || '',
        email: patient.email || '',
        age: patient.age ? parseInt(patient.age) : 0,
        gender: patient.gender || '',
        bloodType: patient.blood_group || patient.bloodGroup || '',
        address: patient.address || '',
        condition: patient.condition || 'Stable',
        admissionDate: patient.admission_date || patient.admissionDate || '',
        patientType: patient.patient_type || patient.patientType || '',
        guardianName: patient.guardian_name || patient.guardianName || '',
        guardianPhone: patient.guardian_phone || patient.guardianPhone || '',
        guardianAddress: patient.guardian_address || patient.guardianAddress || '',
        guardianEmail: patient.guardian_email || patient.guardianEmail || '',
        maritalStatus: patient.marital_status || patient.maritalStatus || '',
        knownAllergies: patient.known_allergies || patient.knownAllergies || '',
        organisation: patient.organisation || '',
        note: patient.note || ''
      }));
      setPatients(transformedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load patients. Please try again.';
      toast.error(errorMessage);
      setPatients([]);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in all required fields (Name and Phone)');
      return;
    }

    if (!formData.address) {
      toast.error('Please fill in all required fields (Address is required)');
      return;
    }

    try {
      await submitAdd(async () => {
        const newPatient = {
          patientName: formData.name,
          mobileno: formData.phone,
          email: formData.email || '',
          address: formData.address,
          age: formData.age ? String(formData.age) : '0',
          gender: formData.gender || '',
          bloodGroup: formData.bloodType || 'Unknown',
          patientType: formData.patientType || 'General',
          dob: formData.admissionDate || null,
          guardianName: formData.guardianName || '',
          guardianPhone: formData.guardianPhone || '',
          guardianAddress: formData.guardianAddress || '',
          guardianEmail: formData.guardianEmail || '',
          maritalStatus: formData.maritalStatus || 'Single',
          knownAllergies: formData.knownAllergies || 'None',
          organisation: formData.organisation || 'Self',
          note: formData.note || ''
        };
        
        const savedPatient = await patientsApi.create(newPatient);
        
        // Transform snake_case response to camelCase
        const transformedPatient: Patient = {
          id: savedPatient.id?.toString() || '',
          name: savedPatient.patient_name || savedPatient.patientName || '',
          phone: savedPatient.mobileno || savedPatient.phone || '',
          email: savedPatient.email || '',
          age: savedPatient.age ? parseInt(savedPatient.age) : 0,
          gender: savedPatient.gender || '',
          bloodType: savedPatient.blood_group || savedPatient.bloodGroup || '',
          address: savedPatient.address || '',
          condition: savedPatient.condition || 'Stable',
          admissionDate: savedPatient.admission_date || savedPatient.admissionDate || '',
          patientType: savedPatient.patient_type || savedPatient.patientType || '',
          guardianName: savedPatient.guardian_name || savedPatient.guardianName || '',
          guardianPhone: savedPatient.guardian_phone || savedPatient.guardianPhone || '',
          guardianAddress: savedPatient.guardian_address || savedPatient.guardianAddress || '',
          guardianEmail: savedPatient.guardian_email || savedPatient.guardianEmail || '',
          maritalStatus: savedPatient.marital_status || savedPatient.maritalStatus || '',
          knownAllergies: savedPatient.known_allergies || savedPatient.knownAllergies || '',
          organisation: savedPatient.organisation || '',
          note: savedPatient.note || ''
        };
        
        setPatients([...patients, transformedPatient]);
        
        setFormData({});
        setIsAddModalOpen(false);
        
        return transformedPatient;
      });
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    // Ensure form data has all fields properly set
    setFormData({
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      age: patient.age,
      gender: patient.gender,
      bloodType: patient.bloodType,
      address: patient.address,
      condition: patient.condition,
      admissionDate: patient.admissionDate,
      patientType: patient.patientType,
      guardianName: patient.guardianName,
      guardianPhone: patient.guardianPhone,
      guardianAddress: patient.guardianAddress,
      guardianEmail: patient.guardianEmail,
      maritalStatus: patient.maritalStatus,
      knownAllergies: patient.knownAllergies,
      organisation: patient.organisation,
      note: patient.note
    });
    setIsAddModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedPatient) return;
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in all required fields (Name and Phone)');
      return;
    }
    
    if (!formData.address) {
      toast.error('Please fill in all required fields (Address is required)');
      return;
    }
    
    try {
      await submitUpdate(async () => {
        const updatedPatientResponse = await patientsApi.update(selectedPatient.id, {
          patientName: formData.name,
          mobileno: formData.phone,
          email: formData.email,
          address: formData.address,
          dob: formData.admissionDate,
          gender: formData.gender,
          age: formData.age ? String(formData.age) : '0',
          bloodGroup: formData.bloodType,
          guardianName: formData.guardianName,
          guardianPhone: formData.guardianPhone,
          guardianAddress: formData.guardianAddress,
          guardianEmail: formData.guardianEmail,
          maritalStatus: formData.maritalStatus,
          knownAllergies: formData.knownAllergies,
          organisation: formData.organisation,
          note: formData.note
        });
        
        // Transform snake_case response to camelCase
        const updatedPatient: Patient = {
          id: updatedPatientResponse.id?.toString() || selectedPatient.id,
          name: updatedPatientResponse.patient_name || updatedPatientResponse.patientName || formData.name || '',
          phone: updatedPatientResponse.mobileno || updatedPatientResponse.phone || formData.phone || '',
          email: updatedPatientResponse.email || formData.email || '',
          age: updatedPatientResponse.age ? parseInt(updatedPatientResponse.age) : (formData.age || 0),
          gender: updatedPatientResponse.gender || formData.gender || '',
          bloodType: updatedPatientResponse.blood_group || updatedPatientResponse.bloodGroup || formData.bloodType || '',
          address: updatedPatientResponse.address || formData.address || '',
          condition: updatedPatientResponse.condition || formData.condition || 'Stable',
          admissionDate: updatedPatientResponse.admission_date || updatedPatientResponse.admissionDate || formData.admissionDate || '',
          patientType: updatedPatientResponse.patient_type || updatedPatientResponse.patientType || formData.patientType || '',
          guardianName: updatedPatientResponse.guardian_name || updatedPatientResponse.guardianName || formData.guardianName || '',
          guardianPhone: updatedPatientResponse.guardian_phone || updatedPatientResponse.guardianPhone || formData.guardianPhone || '',
          guardianAddress: updatedPatientResponse.guardian_address || updatedPatientResponse.guardianAddress || formData.guardianAddress || '',
          guardianEmail: updatedPatientResponse.guardian_email || updatedPatientResponse.guardianEmail || formData.guardianEmail || '',
          maritalStatus: updatedPatientResponse.marital_status || updatedPatientResponse.maritalStatus || formData.maritalStatus || '',
          knownAllergies: updatedPatientResponse.known_allergies || updatedPatientResponse.knownAllergies || formData.knownAllergies || '',
          organisation: updatedPatientResponse.organisation || formData.organisation || '',
          note: updatedPatientResponse.note || formData.note || ''
        };
        
        setPatients(patients.map(p => p.id === selectedPatient.id ? updatedPatient : p));
        setSelectedPatient(null);
        setFormData({});
        setIsAddModalOpen(false);
        
        return updatedPatient;
      });
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    try {
      await patientsApi.delete(id);
      setPatients(patients.filter(patient => patient.id !== id));
      toast.success('Patient deleted successfully!');
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient. Please try again.');
    }
  };

  const handleSelectPatient = (id: string) => {
    const newSelected = new Set(selectedPatientIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPatientIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPatientIds.size === filteredPatients.length) {
      setSelectedPatientIds(new Set());
    } else {
      setSelectedPatientIds(new Set(filteredPatients.map(p => p.id)));
    }
  };

  const handleDeleteAll = async () => {
    if (selectedPatientIds.size === 0) {
      toast.error('Please select at least one patient to delete');
      return;
    }

    const count = selectedPatientIds.size;
    if (!confirm(`Are you sure you want to delete ${count} patient${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleteAllLoading(true);
    const failedIds: string[] = [];
    
    try {
      const deletePromises = Array.from(selectedPatientIds).map(async (id) => {
        try {
          await patientsApi.delete(id);
        } catch (error) {
          console.error(`Error deleting patient ${id}:`, error);
          failedIds.push(id);
        }
      });

      await Promise.all(deletePromises);
      
      if (failedIds.length === 0) {
        // All deletions successful
        setPatients(patients.filter(p => !selectedPatientIds.has(p.id)));
        setSelectedPatientIds(new Set());
        toast.success(`${count} patient${count > 1 ? 's' : ''} deleted successfully!`);
      } else if (failedIds.length === count) {
        // All deletions failed
        toast.error('Failed to delete all patients. Please try again.');
      } else {
        // Partial success
        const successCount = count - failedIds.length;
        setPatients(patients.filter(p => !selectedPatientIds.has(p.id) || failedIds.includes(p.id)));
        setSelectedPatientIds(new Set(failedIds));
        toast.warning(`${successCount} patient${successCount > 1 ? 's' : ''} deleted. ${failedIds.length} failed.`);
      }
    } catch (error) {
      console.error('Error deleting patients:', error);
      toast.error('Failed to delete some patients. Please try again.');
    } finally {
      setIsDeleteAllLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg sm:text-xl">Patient Management</CardTitle>
                <VoiceAgent department="patients" userRole={session?.role || 'doctor'} />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {selectedPatientIds.size > 0 && (
                  <Button
                    onClick={handleDeleteAll}
                    disabled={isDeleteAllLoading}
                    className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
                  >
                    <Trash className="size-4 mr-2" />
                    Delete {selectedPatientIds.size} Patient{selectedPatientIds.size > 1 ? 's' : ''}
                  </Button>
                )}
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setSelectedPatient(null);
                        setFormData({});
                      }}
                      className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                    >
                      <Plus className="size-4 mr-2" />
                      Add Patient
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                  <DialogHeader>
                    <DialogTitle className="text-lg">{selectedPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter full name"
                        className="h-10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age || ''}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) || 0 : 0 })}
                        placeholder="Enter age"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm">Gender</Label>
                      <select
                        id="gender"
                        value={formData.gender || ''}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-2 h-10 rounded-md bg-background border border-input text-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodType" className="text-sm">Blood Type</Label>
                      <select
                        id="bloodType"
                        value={formData.bloodType || ''}
                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                        className="w-full px-3 py-2 h-10 rounded-md bg-background border border-input text-sm"
                      >
                        <option value="">Select Blood Type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter phone number"
                        className="h-10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address" className="text-sm">Address *</Label>
                      <Input
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter address"
                        className="h-10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientType" className="text-sm">Patient Type</Label>
                      <select
                        id="patientType"
                        value={formData.patientType || ''}
                        onChange={(e) => setFormData({ ...formData, patientType: e.target.value })}
                        className="w-full px-3 py-2 h-10 rounded-md bg-background border border-input text-sm"
                      >
                        <option value="">Select Type</option>
                        <option value="inpatient">Inpatient</option>
                        <option value="outpatient">Outpatient</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition" className="text-sm">Condition</Label>
                      <select
                        id="condition"
                        value={formData.condition || ''}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                        className="w-full px-3 py-2 h-10 rounded-md bg-background border border-input text-sm"
                      >
                        <option value="">Select Condition</option>
                        <option value="Stable">Stable</option>
                        <option value="Critical">Critical</option>
                        <option value="Serious">Serious</option>
                        <option value="Fair">Fair</option>
                        <option value="Good">Good</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admissionDate" className="text-sm">Admission Date</Label>
                      <Input
                        id="admissionDate"
                        type="date"
                        value={formData.admissionDate || ''}
                        onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button 
                      onClick={selectedPatient ? handleUpdate : handleAdd}
                      disabled={loading || !formData.name || !formData.phone || !formData.address}
                      className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                    >
                      {loading ? 'Saving...' : selectedPatient ? 'Update' : 'Add'} Patient
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
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
              {filteredPatients.length > 0 && (
                <div className="glass-bg rounded-lg p-4 mb-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedPatientIds.size === filteredPatients.length && filteredPatients.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                    title="Select all patients"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedPatientIds.size > 0 
                      ? `${selectedPatientIds.size} selected` 
                      : 'Select all'}
                  </span>
                </div>
              )}
              {filteredPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-bg rounded-lg p-4 hover:shadow-md transition-all ${
                    selectedPatientIds.has(patient.id) ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <input
                      type="checkbox"
                      checked={selectedPatientIds.has(patient.id)}
                      onChange={() => handleSelectPatient(patient.id)}
                      className="w-4 h-4 cursor-pointer mt-1 sm:mt-0"
                    />
                    <div className="flex-1 w-full">
                      {/* Mobile Layout */}
                      <div className="block sm:hidden space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-foreground">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">{patient.age} years, {patient.gender}</p>
                          </div>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            patient.condition === 'Critical' ? 'bg-red-100 text-destructive' :
                            patient.condition === 'Stable' ? 'bg-green-100 text-primary' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {patient.condition}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="text-foreground">{patient.phone}</span>
                        </div>
                        {patient.bloodType && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Blood:</span>
                            <span className="text-foreground">{patient.bloodType}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Desktop Layout */}
                      <div className="hidden sm:grid sm:grid-cols-5 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Name</p>
                          <p className="text-sm text-foreground">{patient.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Age / Gender</p>
                          <p className="text-sm text-foreground">{patient.age} / {patient.gender}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Blood Type</p>
                          <p className="text-sm text-foreground">{patient.bloodType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm text-foreground">{patient.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Condition</p>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            patient.condition === 'Critical' ? 'bg-red-100 text-destructive' :
                            patient.condition === 'Stable' ? 'bg-green-100 text-primary' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {patient.condition}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(patient)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit className="size-4 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(patient.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="size-4 text-destructive sm:mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredPatients.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No patients found. Click "Add Patient" to create one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


