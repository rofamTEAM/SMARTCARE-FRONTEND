import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, User, Mail, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { staffApi } from '../utils/api';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  salary: number;
  joinDate: string;
  status: 'Active' | 'Inactive';
}

interface StaffManagementProps {
  session: any;
}

export function StaffManagement({ session }: StaffManagementProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Staff>>({});

  useEffect(() => {
    staffApi.getAll().then(setStaff).catch(() => setStaff([]));
  }, []);

  const filteredStaff = staff.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      const newStaff = await staffApi.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        salary: formData.salary,
        joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
        status: 'Active'
      });
      setStaff([...staff, newStaff]);
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Staff member added successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add staff member. Please try again.');
    }
  };

  const toggleStatus = async (id: string) => {
    const member = staff.find(m => m.id === id);
    if (!member) return;
    try {
      const updated = await staffApi.update(id, { status: member.status === 'Active' ? 'Inactive' : 'Active' });
      setStaff(staff.map(m => m.id === id ? updated : m));
      toast.success('Status updated successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await staffApi.delete(id);
      setStaff(staff.filter(m => m.id !== id));
      toast.success('Staff member deleted successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete staff member.');
    }
  };

  const roles = ['Doctor', 'Nurse', 'Pharmacist', 'Lab Technician', 'Receptionist', 'Admin', 'Accountant'];
  const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Emergency', 'Pharmacy', 'Laboratory'];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Staff Management</CardTitle>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData({})}>
                    <Plus className="size-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Staff Member</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter email"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter phone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role *</Label>
                        <select
                          id="role"
                          value={formData.role || ''}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-md"
                        >
                          <option value="">Select role</option>
                          {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <select
                          id="department"
                          value={formData.department || ''}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-md"
                        >
                          <option value="">Select department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary">Salary ($)</Label>
                        <Input
                          id="salary"
                          type="number"
                          value={formData.salary || ''}
                          onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                          placeholder="Enter salary"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joinDate">Join Date</Label>
                      <Input
                        id="joinDate"
                        type="date"
                        value={formData.joinDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd}>Add Staff</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-2 text-left">Name</th>
                    <th className="border border-border px-4 py-2 text-left">Contact</th>
                    <th className="border border-border px-4 py-2 text-left">Role</th>
                    <th className="border border-border px-4 py-2 text-left">Department</th>
                    <th className="border border-border px-4 py-2 text-left">Salary</th>
                    <th className="border border-border px-4 py-2 text-left">Status</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {member.name}
                        </div>
                      </td>
                      <td className="border border-border px-4 py-2">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.email}
                          </div>
                          {member.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="border border-border px-4 py-2">{member.role}</td>
                      <td className="border border-border px-4 py-2">{member.department}</td>
                      <td className="border border-border px-4 py-2">${member.salary}</td>
                      <td className="border border-border px-4 py-2">
                        <button
                          onClick={() => toggleStatus(member.id)}
                          className={`px-2 py-1 rounded text-sm ${
                            member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {member.status}
                        </button>
                      </td>
                      <td className="border border-border px-4 py-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStaff.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No staff members found.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

