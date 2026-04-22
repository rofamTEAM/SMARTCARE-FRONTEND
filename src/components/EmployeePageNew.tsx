import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCog, Users, Briefcase, Award, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { staffApi } from '../utils/api';

interface EmployeePageNewProps {
  session: any;
}

interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  department?: string;
  salary?: number;
  hire_date?: string;
  status: 'active' | 'inactive';
}

export function EmployeePageNew({ session }: EmployeePageNewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const userRole = session?.role || 'user';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await staffApi.getAll();
      setEmployees(data);
    } catch (error) {
      // Silent fallback
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.position || !formData.email || !formData.phone || !formData.department) {
      toast.error('Please fill in all required fields: name, position, email, phone, department');
      return;
    }

    try {
      const newEmployee = await staffApi.create({
        name: formData.name,
        email: formData.email,
        contact_no: formData.phone, // Map phone to contact_no
        position: formData.position,
        designation: formData.position, // Map position to designation
        department: formData.department,
        salary: formData.salary,
        hire_date: formData.hire_date,
        status: formData.status || 'active'
      });
      
      setEmployees([...employees, newEmployee]);
      setShowForm(false);
      setFormData({});
      toast.success('Employee added successfully!');
    } catch (error: any) {
      console.error('Error adding employee:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add employee. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleUpdate = async () => {
    if (!selectedEmployee) return;

    try {
      const updatedEmployee = await staffApi.update(selectedEmployee.id, {
        name: formData.name,
        email: formData.email,
        contact_no: formData.phone, // Map phone to contact_no
        position: formData.position,
        designation: formData.position, // Map position to designation
        department: formData.department,
        salary: formData.salary,
        hire_date: formData.hire_date,
        status: formData.status
      });
      
      setEmployees(employees.map(e => e.id === selectedEmployee.id ? updatedEmployee : e));
      setShowForm(false);
      setFormData({});
      setSelectedEmployee(null);
      toast.success('Employee updated successfully!');
    } catch (error: any) {
      console.error('Error updating employee:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update employee. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      await staffApi.delete(id);
      setEmployees(employees.filter(employee => employee.id !== id));
      toast.success('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee. Please try again.');
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Employees', value: employees.length, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Active', value: employees.filter(e => e.status === 'active').length, icon: UserCog, color: 'bg-primary/10 text-primary' },
    { label: 'Departments', value: new Set(employees.map(e => e.department).filter(Boolean)).size, icon: Briefcase, color: 'bg-primary/10 text-primary' },
    { label: 'Positions', value: new Set(employees.map(e => e.position).filter(Boolean)).size, icon: Award, color: 'bg-primary/10 text-primary' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-gray-900 mb-2">Employee Management</h2>
          <p className="text-muted-foreground text-sm">Manage hospital staff and personnel</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setShowForm(true);
              setSelectedEmployee(null);
              setFormData({});
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="size-4 mr-2" />
            Add Employee
          </Button>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <Icon className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <h3 className="text-gray-900">{stat.value}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Staff Directory</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                type="search"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-card-foreground">
                    {employee.name?.charAt(0)?.toUpperCase() || 'E'}
                  </div>
                  <div>
                    <h4 className="text-gray-900">{employee.name}</h4>
                    <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      employee.status === 'active'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {employee.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setFormData(employee);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(employee.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-gray-900 mb-4">
              {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g., Doctor, Nurse"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Cardiology, ICU"
                />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={selectedEmployee ? handleUpdate : handleAdd}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {selectedEmployee ? 'Update' : 'Add'} Employee
                </Button>
                <Button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({});
                    setSelectedEmployee(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}



