import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Eye, MessageSquare, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { complaintsApi } from '../utils/api';
  id: string;
  complaintBy: string;
  complaintType: string;
  source: 'Patient' | 'Staff' | 'Visitor' | 'Other';
  phone?: string;
  email?: string;
  date: string;
  description: string;
  actionTaken?: string;
  assignedTo?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  attachments?: string[];
  createdAt: string;
}

interface ComplaintManagementProps {
  session: any;
}

export function ComplaintManagement({ session }: ComplaintManagementProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [formData, setFormData] = useState<Partial<Complaint>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await complaintsApi.getAll();
      setComplaints(data || []);
    } catch (error) {
      setComplaints([]);
    }
  };

  const filteredComplaints = complaints.filter(complaint =>
    complaint.complaintBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.complaintType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.complaintBy || !formData.complaintType || !formData.description || !formData.source) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newComplaint = await complaintsApi.create({
        complaintBy: formData.complaintBy,
        complaintType: formData.complaintType,
        source: formData.source || 'Patient',
        phone: formData.phone || '',
        email: formData.email || '',
        date: formData.date || new Date().toISOString().split('T')[0],
        description: formData.description,
        priority: formData.priority || 'Medium',
        status: 'Open',
      });
      setComplaints([...complaints, newComplaint]);
      
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Complaint registered successfully!');
    } catch (error) {
      console.error('Error adding complaint:', error);
      toast.error('Failed to register complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Complaint['status']) => {
    const updated = await complaintsApi.update(id, { status });
    setComplaints(complaints.map(c => c.id === id ? updated : c));
    toast.success('Complaint status updated successfully!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this complaint?')) return;
    await complaintsApi.delete(id);
    setComplaints(complaints.filter(c => c.id !== id));
    toast.success('Complaint deleted successfully!');
  };

  const complaintTypes = [
    'Service Quality',
    'Staff Behavior',
    'Billing Issues',
    'Facility Problems',
    'Medical Care',
    'Appointment Issues',
    'Cleanliness',
    'Equipment Problems',
    'Food Quality',
    'Other'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-destructive';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700';
      case 'Resolved': return 'bg-green-100 text-primary';
      case 'Closed': return 'bg-muted text-foreground';
      default: return 'bg-muted text-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-destructive';
      case 'High': return 'bg-orange-100 text-primary';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-primary';
      default: return 'bg-muted text-foreground';
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
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="size-5" />
                Complaint Management
              </CardTitle>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData({})}>
                    <Plus className="size-4 mr-2" />
                    Register Complaint
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Register New Complaint</DialogTitle>
                    <DialogDescription>
                      Enter the complaint details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="complaintBy">Complaint By *</Label>
                      <Input
                        id="complaintBy"
                        value={formData.complaintBy || ''}
                        onChange={(e) => setFormData({ ...formData, complaintBy: e.target.value })}
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source">Source *</Label>
                      <select
                        id="source"
                        value={formData.source || 'Patient'}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value as Complaint['source'] })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="Patient">Patient</option>
                        <option value="Staff">Staff</option>
                        <option value="Visitor">Visitor</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    <div className="space-y-2">
                      <Label htmlFor="complaintType">Complaint Type *</Label>
                      <select
                        id="complaintType"
                        value={formData.complaintType || ''}
                        onChange={(e) => setFormData({ ...formData, complaintType: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="">Select Type</option>
                        {complaintTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        value={formData.priority || 'Medium'}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as Complaint['priority'] })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the complaint in detail"
                        className="w-full px-3 py-2 border border-border rounded-md"
                        rows={4}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdd} disabled={loading}>
                      {loading ? 'Registering...' : 'Register Complaint'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-2 text-left">Complaint By</th>
                    <th className="border border-border px-4 py-2 text-left">Type</th>
                    <th className="border border-border px-4 py-2 text-left">Source</th>
                    <th className="border border-border px-4 py-2 text-left">Priority</th>
                    <th className="border border-border px-4 py-2 text-left">Status</th>
                    <th className="border border-border px-4 py-2 text-left">Date</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-2">{complaint.complaintBy}</td>
                      <td className="border border-border px-4 py-2">{complaint.complaintType}</td>
                      <td className="border border-border px-4 py-2">{complaint.source}</td>
                      <td className="border border-border px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td className="border border-border px-4 py-2">
                        <select
                          value={complaint.status}
                          onChange={(e) => handleStatusUpdate(complaint.id, e.target.value as Complaint['status'])}
                          className={`px-2 py-1 rounded text-xs border-0 ${getStatusColor(complaint.status)}`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="border border-border px-4 py-2">{complaint.date}</td>
                      <td className="border border-border px-4 py-2">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setIsViewModalOpen(true);
                            }}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(complaint.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredComplaints.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No complaints found.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* View Complaint Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Complaint By</Label>
                  <p className="font-medium">{selectedComplaint.complaintBy}</p>
                </div>
                <div>
                  <Label>Source</Label>
                  <p className="font-medium">{selectedComplaint.source}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="font-medium">{selectedComplaint.complaintType}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority}
                  </span>
                </div>
                <div>
                  <Label>Status</Label>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="font-medium">{selectedComplaint.date}</p>
                </div>
                {selectedComplaint.phone && (
                  <div>
                    <Label>Phone</Label>
                    <p className="font-medium">{selectedComplaint.phone}</p>
                  </div>
                )}
                {selectedComplaint.email && (
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedComplaint.email}</p>
                  </div>
                )}
              </div>
              <div>
                <Label>Description</Label>
                <p className="mt-1 p-3 bg-muted/50 rounded-md">{selectedComplaint.description}</p>
              </div>
              {selectedComplaint.actionTaken && (
                <div>
                  <Label>Action Taken</Label>
                  <p className="mt-1 p-3 bg-green-50 rounded-md">{selectedComplaint.actionTaken}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


