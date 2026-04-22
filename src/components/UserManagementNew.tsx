import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Shield, User, Mail, Phone, Eye, EyeOff, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { authApi } from '../utils/api';

interface SystemUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'lab_tech' | 'pharmacist' | 'accountant';
  department?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdDate: string;
  permissions: string[];
  profileImage?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserManagementProps {
  session: any;
}

export function UserManagement({ session }: UserManagementProps) {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [selectedRoleData, setSelectedRoleData] = useState<Role | null>(null);
  const [userForm, setUserForm] = useState<Partial<SystemUser>>({});
  const [roleForm, setRoleForm] = useState<Partial<Role>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const availablePermissions: Permission[] = [
    { id: 'patients_read', name: 'View Patients', description: 'View patient information', category: 'Patients' },
    { id: 'patients_write', name: 'Manage Patients', description: 'Create and edit patient records', category: 'Patients' },
    { id: 'appointments_read', name: 'View Appointments', description: 'View appointment schedules', category: 'Appointments' },
    { id: 'appointments_write', name: 'Manage Appointments', description: 'Create and modify appointments', category: 'Appointments' },
    { id: 'medical_records_read', name: 'View Medical Records', description: 'Access patient medical history', category: 'Medical' },
    { id: 'medical_records_write', name: 'Edit Medical Records', description: 'Update medical records', category: 'Medical' },
    { id: 'pharmacy_read', name: 'View Pharmacy', description: 'View medication inventory', category: 'Pharmacy' },
    { id: 'pharmacy_write', name: 'Manage Pharmacy', description: 'Manage medications and prescriptions', category: 'Pharmacy' },
    { id: 'billing_read', name: 'View Billing', description: 'View billing information', category: 'Financial' },
    { id: 'billing_write', name: 'Manage Billing', description: 'Create and modify bills', category: 'Financial' },
    { id: 'reports_read', name: 'View Reports', description: 'Access system reports', category: 'Reports' },
    { id: 'reports_write', name: 'Generate Reports', description: 'Create custom reports', category: 'Reports' },
    { id: 'users_read', name: 'View Users', description: 'View user accounts', category: 'Administration' },
    { id: 'users_write', name: 'Manage Users', description: 'Create and manage user accounts', category: 'Administration' },
    { id: 'system_settings', name: 'System Settings', description: 'Access system configuration', category: 'Administration' }
  ];

  const defaultRoles: Role[] = [
    {
      id: 'super_admin',
      name: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: availablePermissions.map(p => p.id),
      userCount: 0
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Administrative access with most permissions',
      permissions: availablePermissions.filter(p => p.category !== 'Administration' || p.id === 'users_read').map(p => p.id),
      userCount: 0
    },
    {
      id: 'doctor',
      name: 'Doctor',
      description: 'Medical staff with patient care permissions',
      permissions: ['patients_read', 'patients_write', 'appointments_read', 'appointments_write', 'medical_records_read', 'medical_records_write', 'pharmacy_read', 'reports_read'],
      userCount: 0
    },
    {
      id: 'nurse',
      name: 'Nurse',
      description: 'Nursing staff with patient care permissions',
      permissions: ['patients_read', 'patients_write', 'appointments_read', 'medical_records_read', 'medical_records_write', 'pharmacy_read'],
      userCount: 0
    },
    {
      id: 'receptionist',
      name: 'Receptionist',
      description: 'Front desk staff with appointment and patient management',
      permissions: ['patients_read', 'patients_write', 'appointments_read', 'appointments_write', 'billing_read'],
      userCount: 0
    },
    {
      id: 'lab_tech',
      name: 'Lab Technician',
      description: 'Laboratory staff with test management permissions',
      permissions: ['patients_read', 'medical_records_read', 'medical_records_write', 'reports_read'],
      userCount: 0
    },
    {
      id: 'pharmacist',
      name: 'Pharmacist',
      description: 'Pharmacy staff with medication management',
      permissions: ['patients_read', 'pharmacy_read', 'pharmacy_write', 'medical_records_read'],
      userCount: 0
    },
    {
      id: 'accountant',
      name: 'Accountant',
      description: 'Financial staff with billing and reporting access',
      permissions: ['billing_read', 'billing_write', 'reports_read', 'reports_write'],
      userCount: 0
    }
  ];

  useEffect(() => {
    fetchUsers();
    setRoles(defaultRoles);
    setPermissions(availablePermissions);
  }, []);

  const fetchUsers = async () => {
    try {
      // Mock data for now - would use DatabaseService in production
      const mockUsers: SystemUser[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@hospital.com',
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+1234567890',
          role: 'super_admin',
          department: 'Administration',
          status: 'active',
          lastLogin: '2024-12-08T09:00:00',
          createdDate: '2024-01-01',
          permissions: availablePermissions.map(p => p.id)
        },
        {
          id: '2',
          username: 'dr.smith',
          email: 'dr.smith@hospital.com',
          firstName: 'John',
          lastName: 'Smith',
          phone: '+1234567891',
          role: 'doctor',
          department: 'Cardiology',
          status: 'active',
          lastLogin: '2024-12-08T08:30:00',
          createdDate: '2024-02-15',
          permissions: ['patients_read', 'patients_write', 'appointments_read', 'appointments_write', 'medical_records_read', 'medical_records_write', 'pharmacy_read', 'reports_read']
        },
        {
          id: '3',
          username: 'nurse.jane',
          email: 'jane.doe@hospital.com',
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '+1234567892',
          role: 'nurse',
          department: 'Emergency',
          status: 'active',
          lastLogin: '2024-12-08T07:45:00',
          createdDate: '2024-03-10',
          permissions: ['patients_read', 'patients_write', 'appointments_read', 'medical_records_read', 'medical_records_write', 'pharmacy_read']
        },
        {
          id: '4',
          username: 'reception',
          email: 'reception@hospital.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          phone: '+1234567893',
          role: 'receptionist',
          department: 'Front Desk',
          status: 'active',
          lastLogin: '2024-12-08T08:00:00',
          createdDate: '2024-04-20',
          permissions: ['patients_read', 'patients_write', 'appointments_read', 'appointments_write', 'billing_read']
        }
      ];
      setUsers(mockUsers);
      
      // Update role user counts
      const updatedRoles = defaultRoles.map(role => ({
        ...role,
        userCount: mockUsers.filter(user => user.role === role.id).length
      }));
      setRoles(updatedRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.username || !userForm.email || !userForm.firstName || !userForm.lastName || !userForm.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const selectedRoleData = roles.find(r => r.id === userForm.role);
      const newUser: SystemUser = {
        id: Date.now().toString(),
        username: userForm.username || '',
        email: userForm.email || '',
        firstName: userForm.firstName || '',
        lastName: userForm.lastName || '',
        phone: userForm.phone,
        role: userForm.role as SystemUser['role'],
        department: userForm.department,
        status: 'active',
        createdDate: new Date().toISOString().split('T')[0],
        permissions: selectedRoleData?.permissions || []
      };

      setUsers([...users, newUser]);
      setUserForm({});
      setIsUserModalOpen(false);
      toast.success('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (selectedUser) {
      setLoading(true);
      try {
        const updatedUser = { ...selectedUser, ...userForm };
        setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
        setSelectedUser(null);
        setUserForm({});
        setIsUserModalOpen(false);
        toast.success('User updated successfully!');
      } catch (error) {
        console.error('Error updating user:', error);
        toast.error('Failed to update user');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
          : u
      ));
      toast.success('User status updated');
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      // In a real implementation, this would send a password reset email
      toast.success('Password reset email sent to user');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-primary',
      'inactive': 'bg-muted text-foreground',
      'suspended': 'bg-red-100 text-destructive'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-foreground';
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'super_admin': 'bg-purple-100 text-primary',
      'admin': 'bg-blue-100 text-primary',
      'doctor': 'bg-green-100 text-primary',
      'nurse': 'bg-teal-100 text-primary',
      'receptionist': 'bg-orange-100 text-primary',
      'lab_tech': 'bg-yellow-100 text-yellow-700',
      'pharmacist': 'bg-pink-100 text-pink-700',
      'accountant': 'bg-indigo-100 text-primary'
    };
    return colors[role as keyof typeof colors] || 'bg-muted text-foreground';
  };

  const formatRoleName = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-muted-foreground">Manage system users, roles, and permissions</p>
        </div>
        <Button onClick={() => setIsUserModalOpen(true)} className="bg-[#38bdf8] hover:bg-[#0ea5e9]">
          <Plus className="size-4 mr-2" />
          Add User
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Users</CardTitle>
                <div className="flex gap-2">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#38bdf8] rounded-full flex items-center justify-center text-card-foreground font-semibold">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {user.firstName} {user.lastName}
                            </h3>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                            <Badge className={getRoleColor(user.role)}>
                              {formatRoleName(user.role)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="size-4" />
                              {user.username}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="size-4" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="size-4" />
                                {user.phone}
                              </span>
                            )}
                            {user.department && (
                              <span>{user.department}</span>
                            )}
                          </div>
                          {user.lastLogin && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last login: {new Date(user.lastLogin).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserForm(user);
                            setIsUserModalOpen(true);
                          }}
                        >
                          <Edit className="size-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleUserStatus(user.id)}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          <Key className="size-4 mr-1" />
                          Reset Password
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <Badge variant="outline">{role.userCount} users</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Permissions:</h4>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 5).map(permissionId => {
                        const permission = availablePermissions.find(p => p.id === permissionId);
                        return permission ? (
                          <Badge key={permissionId} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ) : null;
                      })}
                      {role.permissions.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="size-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="size-4 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <p className="text-sm font-medium">User login: dr.smith</p>
                    <p className="text-xs text-muted-foreground">2024-12-08 08:30:00</p>
                  </div>
                  <Badge className="bg-green-100 text-primary">Login</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <p className="text-sm font-medium">Password reset: nurse.jane</p>
                    <p className="text-xs text-muted-foreground">2024-12-08 07:45:00</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">Password Reset</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div>
                    <p className="text-sm font-medium">User created: reception</p>
                    <p className="text-xs text-muted-foreground">2024-12-07 16:20:00</p>
                  </div>
                  <Badge className="bg-blue-100 text-primary">User Created</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Create New User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={userForm.firstName || ''}
                  onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={userForm.lastName || ''}
                  onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={userForm.username || ''}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userForm.email || ''}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone (Optional)</Label>
                <Input
                  value={userForm.phone || ''}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select
                  value={userForm.role || ''}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as SystemUser['role'] })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Department (Optional)</Label>
                <Input
                  value={userForm.department || ''}
                  onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  placeholder="Enter department"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={userForm.status || 'active'}
                  onChange={(e) => setUserForm({ ...userForm, status: e.target.value as SystemUser['status'] })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            {!selectedUser && (
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter temporary password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={selectedUser ? handleUpdateUser : handleCreateUser} 
              disabled={loading} 
              className="bg-[#38bdf8] hover:bg-[#0ea5e9]"
            >
              {loading ? 'Saving...' : selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

