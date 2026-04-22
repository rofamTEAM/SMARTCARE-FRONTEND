import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Stethoscope, Calendar, Users, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { staffApi } from '../utils/api';

interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  department?: string;
  status: 'active' | 'inactive';
}

interface Doctor extends Employee {
  specialization?: string;
  experience?: number;
  availability?: string;
  license_number?: string;
  consultation_fee?: number;
}

export function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<Partial<Doctor>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const data = await staffApi.getDoctors();
      setDoctors(data || []);
    } catch (error) {
      setDoctors([]);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.specialization) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Prepare data with snake_case field names for backend
      const staffData = {
        name: formData.name,
        email: formData.email,
        contact_no: formData.phone,
        department: formData.department || '',
        designation: 'Doctor',
        date_of_joining: new Date().toISOString().split('T')[0],
        employee_id: `EMP-${Date.now()}`,
        specialization: formData.specialization,
        experience: formData.experience || 0,
        availability: formData.availability || 'Available',
        license_number: formData.license_number,
        consultation_fee: formData.consultation_fee || 0,
        salary: formData.salary || 0,
        is_active: 1
      };

      // Save to backend
      const newDoctor = await staffApi.create(staffData);
      
      // Add to local state with the returned data
      const doctorWithDetails = {
        id: newDoctor.id || Date.now().toString(),
        name: newDoctor.name,
        email: newDoctor.email,
        phone: newDoctor.contact_no,
        position: 'Doctor',
        department: newDoctor.department,
        salary: newDoctor.salary,
        status: 'active' as const,
        specialization: newDoctor.specialization,
        experience: newDoctor.experience,
        availability: newDoctor.availability || 'Available',
        license_number: newDoctor.license_number,
        consultation_fee: newDoctor.consultation_fee
      };
      
      setDoctors([...doctors, doctorWithDetails]);
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Doctor added successfully!');
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error('Failed to add doctor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDoctor) return;
    if (!formData.name || !formData.phone || !formData.email || !formData.specialization) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Prepare data with snake_case field names for backend
      const staffData = {
        name: formData.name,
        email: formData.email,
        contact_no: formData.phone,
        department: formData.department,
        designation: 'Doctor',
        specialization: formData.specialization,
        experience: formData.experience || 0,
        availability: formData.availability,
        license_number: formData.license_number,
        consultation_fee: formData.consultation_fee || 0,
        salary: formData.salary || 0
      };

      // Update in backend
      await staffApi.update(selectedDoctor.id, staffData);
      
      // Update local state
      const doctorWithDetails = {
        ...selectedDoctor,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        salary: formData.salary,
        specialization: formData.specialization,
        experience: formData.experience,
        availability: formData.availability,
        license_number: formData.license_number,
        consultation_fee: formData.consultation_fee
      };
      
      setDoctors(doctors.map(d => d.id === selectedDoctor.id ? doctorWithDetails : d));
      setSelectedDoctor(null);
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Doctor updated successfully!');
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast.error('Failed to update doctor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      await staffApi.delete(id);
    } catch (dbError) {
      console.error('Error deleting doctor:', dbError);
    }
    setDoctors(doctors.filter(d => d.id !== id));
    toast.success('Doctor deleted successfully!');
  };

  const stats = [
    { label: 'Total Doctors', value: doctors.length, icon: Stethoscope, color: 'bg-primary' },
    { label: 'Available', value: doctors.filter(d => d.availability === 'Available').length, icon: Users, color: 'bg-primary' },
    { label: 'Specializations', value: new Set(doctors.map(d => d.specialization).filter(Boolean)).size, icon: Award, color: 'bg-primary' },
    { label: 'On Duty', value: doctors.filter(d => d.status === 'active').length, icon: Calendar, color: 'bg-primary' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-gray-900 mb-2">Doctor Management</h2>
          <p className="text-muted-foreground text-sm">Manage hospital doctors and medical staff</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="size-6 text-card-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Doctors Directory</CardTitle>
            <div className="flex items-center gap-4">
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setSelectedDoctor(null);
                      setFormData({});
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="size-4 mr-2" />
                    Add Doctor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{selectedDoctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dr. John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization *</Label>
                      <select
                        id="specialization"
                        value={formData.specialization || ''}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                        required
                      >
                        <option value="">Select Specialization</option>
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Neurologist">Neurologist</option>
                        <option value="Pediatrician">Pediatrician</option>
                        <option value="Orthopedic">Orthopedic</option>
                        <option value="Gynecologist">Gynecologist</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="General Physician">General Physician</option>
                        <option value="Surgeon">Surgeon</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <select
                        id="department"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Gynecology">Gynecology</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Surgery">Surgery</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience (years)</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={formData.experience || ''}
                        onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1234567890"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="doctor@hospital.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license_number">License Number</Label>
                      <Input
                        id="license_number"
                        value={formData.license_number || ''}
                        onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                        placeholder="MD123456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
                      <Input
                        id="consultation_fee"
                        type="number"
                        value={formData.consultation_fee || ''}
                        onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || 0 })}
                        placeholder="100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary ($)</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={formData.salary || ''}
                        onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                        placeholder="80000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <select
                        id="availability"
                        value={formData.availability || 'Available'}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="Available">Available</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Busy">Busy</option>
                        <option value="Emergency Only">Emergency Only</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={selectedDoctor ? handleUpdate : handleAdd}
                      disabled={loading || !formData.name || !formData.phone || !formData.email || !formData.specialization}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {loading ? 'Saving...' : selectedDoctor ? 'Update' : 'Add'} Doctor
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-card-foreground">
                      <Stethoscope className="size-6" />
                    </div>
                    <div>
                      <h4 className="text-gray-900">{doctor.name}</h4>
                      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="text-gray-900">{doctor.department}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Experience:</span>
                    <span className="text-gray-900">{doctor.experience || 0} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      doctor.availability === 'Available' 
                        ? 'bg-green-100 text-primary' 
                        : doctor.availability === 'Busy'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-destructive'
                    }`}>
                      {doctor.availability || 'Available'}
                    </span>
                  </div>
                  {doctor.consultation_fee && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Consultation:</span>
                      <span className="text-gray-900">${doctor.consultation_fee}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setFormData(doctor);
                      setIsAddModalOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Edit className="size-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(doctor.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}

            {filteredDoctors.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No doctors found. Click "Add Doctor" to add one.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


