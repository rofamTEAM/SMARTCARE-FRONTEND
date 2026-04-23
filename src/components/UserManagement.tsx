import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, ShieldAlert, Edit, Trash2, UserPlus, Search, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { useWebSocket } from '../hooks/useWebSocket';

interface UserManagementProps {
  session: any;
}

export function UserManagement({ session }: UserManagementProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Helper function to normalize roles for comparison
  const normalizeRole = (role: string): string => {
    if (!role) return 'user';
    return role.toLowerCase().replace(/_/g, '_');
  };

  const userRole = session?.role || 'user';
  const normalizedRole = normalizeRole(userRole);
  const isAdmin = normalizedRole === 'admin';
  const isSuperAdmin = normalizedRole === 'super_admin';
  const hasUserManagementAccess = isAdmin || isSuperAdmin;
  const userId = session?.user?.id || session?.id || null;

  // Handle user creation updates from WebSocket/polling
  const handleUserCreated = (data: any) => {
    console.log('[USER MANAGEMENT] User created event received:', data);
    // Refresh users list when new user is created
    fetchUsers();
  };

  // Initialize WebSocket with user creation handler
  useWebSocket({
    userId,
    role: userRole,
    onUserCreated: handleUserCreated,
    enabled: hasUserManagementAccess // Only enable for admins and super admins
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { apiClient } = await import('../services/apiClient');
      const response = await apiClient.get<any>('/users');
      
      console.log('[FETCH USERS] Full response:', response);
      
      // apiClient automatically unwraps .data, so response is { users: [...] }
      let usersArray: any[] = [];
      
      if (Array.isArray(response)) {
        usersArray = response;
      } else if (response?.users && Array.isArray(response.users)) {
        usersArray = response.users;
      } else if (response?.data && Array.isArray(response.data)) {
        usersArray = response.data;
      }
      
      console.log('[FETCH USERS] Extracted users:', usersArray);
      console.log('[FETCH USERS] First user:', usersArray[0]);
      
      setUsers(Array.isArray(usersArray) ? usersArray : []);
    } catch (error: any) {
      console.error('[FETCH USERS] Error caught:', error);
      console.error('[FETCH USERS] Error type:', typeof error);
      console.error('[FETCH USERS] Error keys:', Object.keys(error || {}));
      
      // Extract error details safely
      const errorMessage = error?.message || (typeof error === 'string' ? error : 'Unknown error');
      const errorStatus = error?.status || (error?.response?.status) || 0;
      
      console.error('[FETCH USERS] Extracted message:', errorMessage);
      console.error('[FETCH USERS] Extracted status:', errorStatus);
      
      // Check if it's an authentication error
      if (errorStatus === 401) {
        console.error('[FETCH USERS] Authentication failed - user not logged in');
        toast.error('Please log in to view users');
      } else if (errorStatus === 403) {
        console.error('[FETCH USERS] Authorization failed - user does not have ADMIN or SUPER_ADMIN role');
        toast.error('You do not have permission to view users. Only ADMIN or SUPER_ADMIN can access this.');
      } else if (errorStatus === 0 || errorMessage.includes('Cannot connect')) {
        console.error('[FETCH USERS] Connection error');
        toast.error('Cannot connect to server. Please check if the backend is running.');
      } else {
        console.error('[FETCH USERS] Unexpected error:', errorMessage);
        toast.error(`Failed to fetch users: ${errorMessage}`);
      }
      
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const { apiClient } = await import('../services/apiClient');
      await apiClient.put('/rbac/role-permission', { 
        userId: selectedUser.id, 
        role: newRole 
      });

      await fetchUsers();
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
      toast.success('User role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleCreateUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      toast.error('Please fill all required fields (Name, Email, Password)');
      return;
    }

    if (newUserData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const { apiClient } = await import('../services/apiClient');
      
      const response = await apiClient.post('/users', {
        name: newUserData.name,
        email: newUserData.email,
        password: newUserData.password,
        roleEnum: newUserData.role?.toUpperCase() || 'USER',
      });

      // Close modal BEFORE fetching to avoid state conflicts
      setShowCreateModal(false);
      setNewUserData({ name: '', email: '', password: '', role: 'user' });
      
      // Refresh users list immediately
      await fetchUsers();
      
      toast.success(`User created successfully! Welcome ${newUserData.name}`);
    } catch (error: any) {
      console.error('[CREATE USER] Error:', error);
      toast.error(`Failed to create user: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { apiClient } = await import('../services/apiClient');
      await apiClient.delete(`/users/${userId}`);

      await fetchUsers();
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteAllUsers = async () => {
    if (!confirm('Are you absolutely sure you want to delete ALL users? This action cannot be undone!')) return;
    if (!confirm('This will delete all users except the current super admin. Continue?')) return;

    try {
      setLoading(true);
      const { apiClient } = await import('../services/apiClient');
      
      // Delete all users except current super admin
      const usersToDelete = users.filter(u => u.id !== userId);
      
      for (const user of usersToDelete) {
        try {
          await apiClient.delete(`/users/${user.id}`);
        } catch (error) {
          console.error(`Failed to delete user ${user.id}:`, error);
        }
      }

      await fetchUsers();
      toast.success('All users deleted successfully');
    } catch (error) {
      console.error('Error deleting all users:', error);
      toast.error('Failed to delete all users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleDeleteSelectedUsers = async () => {
    if (selectedUserIds.size === 0) {
      toast.error('Please select users to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedUserIds.size} selected user(s)?`)) return;

    try {
      setLoading(true);
      const { apiClient } = await import('../services/apiClient');
      
      for (const userId of selectedUserIds) {
        try {
          await apiClient.delete(`/users/${userId}`);
        } catch (error) {
          console.error(`Failed to delete user ${userId}:`, error);
        }
      }

      setSelectedUserIds(new Set());
      await fetchUsers();
      toast.success(`${selectedUserIds.size} user(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting selected users:', error);
      toast.error('Failed to delete selected users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getRoleIcon = (role: string) => {
    const normalized = normalizeRole(role);
    switch (normalized) {
      case 'super_admin':
        return <ShieldAlert className="size-5 text-destructive" />;
      case 'admin':
        return <Shield className="size-5 text-warning" />;
      default:
        return <Users className="size-5 text-primary" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const normalized = normalizeRole(role);
    switch (normalized) {
      case 'super_admin':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'admin':
        return 'bg-warning/10 text-warning border-warning/30';
      default:
        return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  const formatRoleDisplay = (role: string): string => {
    const normalized = normalizeRole(role);
    switch (normalized) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'doctor':
        return 'Doctor';
      case 'nurse':
        return 'Nurse';
      case 'pharmacist':
        return 'Pharmacist';
      case 'lab_technician':
        return 'Lab Technician';
      case 'receptionist':
        return 'Receptionist';
      default:
        return 'User';
    }
  };

  if (!hasUserManagementAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to access User Management.</p>
          <p className="text-sm text-muted-foreground mt-2">Only ADMIN and SUPER_ADMIN users can view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-gray-900">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Users className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <h3 className="text-gray-900">{users.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="bg-warning/10 p-3 rounded-xl">
                  <Shield className="size-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <h3 className="text-gray-900">
                    {users.filter((u) => normalizeRole(u.role) === 'admin').length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="bg-destructive/10 p-3 rounded-xl">
                  <ShieldAlert className="size-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Super Admins</p>
                  <h3 className="text-gray-900">
                    {users.filter((u) => normalizeRole(u.role) === 'super_admin').length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>All Users</CardTitle>
              <div className="flex items-center gap-2 text-xs text-primary">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Live
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isSuperAdmin && (
                <>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary hover:bg-primary/90"
                    size="sm"
                  >
                    <UserPlus className="size-4 mr-2" />
                    Create User
                  </Button>
                  {selectedUserIds.size > 0 && (
                    <Button
                      onClick={handleDeleteSelectedUsers}
                      className="bg-destructive hover:bg-destructive/90"
                      size="sm"
                    >
                      Delete Selected ({selectedUserIds.size})
                    </Button>
                  )}
                  {users.length > 1 && selectedUserIds.size === 0 && (
                    <Button
                      onClick={handleDeleteAllUsers}
                      className="bg-destructive hover:bg-destructive/90"
                      size="sm"
                    >
                      Delete All Users
                    </Button>
                  )}
                </>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  type="search"
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
          <div className="space-y-3">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors ${
                  selectedUserIds.has(user.id) ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {isSuperAdmin && user.id !== userId && (
                    <input
                      type="checkbox"
                      checked={selectedUserIds.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                  )}
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-card-foreground font-semibold">
                    {(user.name || user.email || 'U')?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-medium">{user.name || user.email || 'Unknown User'}</h4>
                    <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm border ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {formatRoleDisplay(user.role)}
                    </span>
                  </div>

                  {isSuperAdmin && user.id !== userId && !selectedUserIds.has(user.id) && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.role);
                          setShowRoleModal(true);
                        }}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
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

      {/* Role Update Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-gray-900 mb-4">Update User Role</h3>
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <Input value={selectedUser?.email} disabled />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                >
                  <option value="user">User</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="lab_technician">Lab Technician</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateRole} className="flex-1 bg-primary hover:bg-primary/90">
                  Update Role
                </Button>
                <Button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                    setNewRole('');
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-gray-900 mb-4">Create New User</h3>
            <div className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <Label>Password * (min 6 characters)</Label>
                <Input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Enter password"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card"
                >
                  <option value="user">User</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="lab_technician">Lab Technician</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateUser} 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!newUserData.name || !newUserData.email || !newUserData.password || newUserData.password.length < 6}
                >
                  Create User
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUserData({ name: '', email: '', password: '', role: 'user' });
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


