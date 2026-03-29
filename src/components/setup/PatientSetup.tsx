import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Download, Upload, Eye, EyeOff, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { patientsApi } from '../../utils/api';
import { patientsApi } from '../../utils/api';
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  emergencyContact: string;
  guardianName: string;
  maritalStatus: string;
  occupation: string;
  nationality: string;
  idNumber: string;
  isActive: boolean;
  createdAt: string;
}

interface PatientSetupProps {
  session: any;
}

export function PatientSetup({ session }: PatientSetupProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [loading, setLoading] = useState(false);
  const [showDisabled, setShowDisabled] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientsApi.getAll();
      setPatients(data || []);
    } catch (error) {
      setPatients([]);
    }
  };

  const savePatients = (updatedPatients: Patient[]) => { setPatients(updatedPatients); };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone?.includes(searchTerm) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showDisabled ? !patient.isActive : patient.isActive;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in all required fields (Name and Phone)');
      return;
    }

    setLoading(true);
    try {
      const newPatient: Patient = {
        id: Date.now().toString(),
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        dateOfBirth: formData.dateOfBirth || '',
        gender: formData.gender || '',
        bloodGroup: formData.bloodGroup || '',
        emergencyContact: formData.emergencyContact || '',
        guardianName: formData.guardianName || '',
        maritalStatus: formData.maritalStatus || '',
        occupation: formData.occupation || '',
        nationality: formData.nationality || '',
        idNumber: formData.idNumber || '',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      const updatedPatients = [...patients, newPatient];
      savePatients(updatedPatients);
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

  const handleUpdate = () => {
    if (!selectedPatient || !formData.name || !formData.phone) {
      toast.error('Please fill in all required fields (Name and Phone)');
      return;
    }

    setLoading(true);
    try {
      const updatedPatients = patients.map(p => 
        p.id === selectedPatient.id ? { ...p, ...formData } : p
      );
      savePatients(updatedPatients);
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

  const handleToggleStatus = (id: string) => {
    const updatedPatients = patients.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    savePatients(updatedPatients);
    toast.success('Patient status updated successfully!');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) return;
    
    const updatedPatients = patients.filter(p => p.id !== id);
    savePatients(updatedPatients);
    toast.success('Patient deleted successfully!');
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
              <CardTitle className="flex items-center gap-2">
                <Users className="size-6" />
                Patient Management Setup
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDisabled(!showDisabled)}
                  className="flex items-center gap-2"
                >
                  {showDisabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  {showDisabled ? 'Show Active' : 'Show Disabled'}
                </Button>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setSelectedPatient(null);
                        setFormData({});
                      }}
                    >
                      <Plus className="size-4 mr-2" />
                      Add Patient
                    </Button>
                  </DialogTrigger>
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
              {filteredPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-bg rounded-lg p-4 hover:shadow-md transition-all ${
                    !patient.isActive ? 'opacity-60 bg-red-50' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Name</p>
                          <p className="text-sm font-medium text-foreground">{patient.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm text-foreground">{patient.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm text-foreground">{patient.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            patient.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {patient.isActive ? 'Active' : 'Disabled'}
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
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(patient.id)}
                        className="flex-1 sm:flex-none"
                      >
                        {patient.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                      {!patient.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(patient.id)}
                          className="flex-1 sm:flex-none text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredPatients.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No patients found. {showDisabled ? 'No disabled patients.' : 'Click "Add Patient" to create one.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Patient Modal */}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            onClick={selectedPatient ? handleUpdate : handleAdd}
            disabled={loading || !formData.name || !formData.phone}
            className="w-full sm:w-auto"
          >
            {loading ? 'Saving...' : selectedPatient ? 'Update' : 'Add'} Patient
          </Button>
        </div>
      </DialogContent>
    </div>
  );
}

