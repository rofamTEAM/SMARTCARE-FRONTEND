import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { errorHandler } from '../utils/errorHandler';
import { PatientRegistration as PatientRegistrationType } from '@/types/patient';
import { patientsService } from '@/services/patients.service';

interface PatientRegistrationProps {
  session: any;
  onUpdate?: () => void;
}

export function PatientRegistration({ session, onUpdate }: PatientRegistrationProps) {
  const [registrations, setRegistrations] = useState<PatientRegistrationType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientRegistrationType>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      // Fetch from patients service or create a registrations endpoint
      // For now, we'll use an empty array as placeholder
      setRegistrations([]);
      onUpdate?.();
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.mobileno?.includes(searchTerm)
  );

  const handleAdd = async () => {
    if (!formData.patient_name || !formData.mobileno || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const patientData = {
        patientName: formData.patient_name,
        age: formData.age,
        gender: formData.gender || 'Other',
        mobileno: formData.mobileno,
        email: formData.email || '',
        address: '', // Required by backend
        bloodGroup: 'Unknown',
      };

      const newPatient = await patientsService.create(patientData);
      
      const newRegistration: PatientRegistrationType = {
        id: Date.now().toString(),
        patientId: newPatient.id || Date.now(),
        patient_name: newPatient.patient_name,
        age: newPatient.age,
        gender: newPatient.gender || '',
        mobileno: newPatient.mobileno,
        email: newPatient.email || '',
        emergency_contact: formData.emergency_contact || '',
        visit_type: formData.visit_type || 'OPD',
        registration_date: new Date().toISOString(),
        status: 'pending',
      };
      
      setRegistrations([...registrations, newRegistration]);
      setFormData({});
      setIsAddModalOpen(false);
      onUpdate?.();
      toast.success('Patient registered successfully!');
    } catch (error) {
      console.error('Error registering patient:', error);
      toast.error('Failed to register patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      setLoading(true);
      setRegistrations(registrations.map(r => 
        r.id === id ? { ...r, status: 'checked-in' as const } : r
      ));
      onUpdate?.();
      toast.success('Patient checked in successfully!');
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;
    
    try {
      setLoading(true);
      setRegistrations(registrations.filter(r => r.id !== id));
      onUpdate?.();
      toast.success('Registration deleted successfully!');
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({})} className="bg-primary hover:bg-primary/90">
              <Plus className="size-4 mr-2" />
              New Registration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Patient Registration</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient_name">Patient Name</Label>
                <Input
                  id="patient_name"
                  value={formData.patient_name || ''}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileno">Phone</Label>
                <Input
                  id="mobileno"
                  value={formData.mobileno || ''}
                  onChange={(e) => setFormData({ ...formData, mobileno: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact || ''}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="visit_type">Visit Type</Label>
                <select
                  id="visit_type"
                  value={formData.visit_type || ''}
                  onChange={(e) => setFormData({ ...formData, visit_type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select</option>
                  <option value="OPD">OPD</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {filteredRegistrations.map((reg, index) => (
          <motion.div
            key={reg.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 grid grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="text-sm text-gray-900">{reg.patient_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Age / Gender</p>
                  <p className="text-sm text-gray-900">{reg.age} / {reg.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-gray-900">{reg.mobileno}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Visit Type</p>
                  <p className="text-sm text-gray-900">{reg.visit_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    reg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    reg.status === 'checked-in' ? 'bg-green-100 text-primary' :
                    'bg-muted text-foreground'
                  }`}>
                    {reg.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {reg.status === 'Pending' && (
                  <Button
                    size="sm"
                    onClick={() => handleCheckIn(reg.id)}
                    className="bg-primary hover:bg-green-700"
                  >
                    <UserCheck className="size-4 mr-1" />
                    Check-In
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(reg.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No registrations found. Click "New Registration" to add one.
          </div>
        )}
      </div>
    </div>
  );
}


