import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { appointmentsService } from '../services/appointments.service';
import { errorHandler } from '../utils/errorHandler';


interface QueueItem {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  department?: string;
  priority?: 'Normal' | 'Urgent' | 'Emergency';
  tokenNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface QueueManagementProps {
  session: any;
  onUpdate?: () => void;
}

export function QueueManagement({ session, onUpdate }: QueueManagementProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<QueueItem>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const data = await appointmentsService.getAll({ 
        status: 'scheduled' 
      });
      setQueue(data || []);
      onUpdate?.();
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
      setQueue([]);
    }
  };

  const filteredQueue = queue.filter(item =>
    item.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.doctorId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newItem = await appointmentsService.create({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason || 'General Consultation',
        notes: formData.notes
      });
      
      // Add display fields for UI
      const itemWithDisplay: QueueItem = {
        ...newItem,
        patientName: formData.patientName,
        doctorName: formData.doctorName,
        department: formData.department,
        priority: formData.priority,
        tokenNumber: formData.tokenNumber
      };
      
      setQueue([...queue, itemWithDisplay]);
      setFormData({});
      setIsAddModalOpen(false);
      onUpdate?.();
      toast.success('Appointment added to queue successfully!');
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: QueueItem['status']) => {
    try {
      const item = queue.find(q => q.id === id);
      if (!item) return;
      
      const updated = await appointmentsService.update(id, { status });
      
      // Preserve display fields
      const updatedWithDisplay: QueueItem = {
        ...updated,
        patientName: item.patientName,
        doctorName: item.doctorName,
        department: item.department,
        priority: item.priority,
        tokenNumber: item.tokenNumber
      };
      
      setQueue(queue.map(q => q.id === id ? updatedWithDisplay : q));
      onUpdate?.();
      toast.success(`Appointment status updated to ${status}`);
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search by patient, token, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({})} className="bg-primary hover:bg-primary/90">
              <Plus className="size-4 mr-2" />
              Add to Queue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Patient to Queue</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={formData.patientId || ''}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  placeholder="Patient ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={formData.patientName || ''}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorId">Doctor ID</Label>
                <Input
                  id="doctorId"
                  value={formData.doctorId || ''}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  placeholder="Doctor ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorName">Doctor Name</Label>
                <Input
                  id="doctorName"
                  value={formData.doctorName || ''}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  placeholder="Doctor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Date</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={formData.appointmentDate || ''}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentTime">Time</Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  value={formData.appointmentTime || ''}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select Department</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority || 'Normal'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as QueueItem['priority'] })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Input
                  id="reason"
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Reason for appointment"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? 'Adding...' : 'Add to Queue'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {filteredQueue.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-lg p-4 hover:shadow-md transition-all ${
              item.priority === 'Emergency' ? 'bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-destructive' :
              item.priority === 'Urgent' ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500' :
              'bg-gradient-to-r from-gray-50 to-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 grid grid-cols-6 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Token</p>
                  <p className="text-lg text-gray-900">{item.tokenNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="text-sm text-gray-900">{item.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm text-gray-900">{item.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Doctor</p>
                  <p className="text-sm text-gray-900">{item.doctorName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    item.priority === 'Emergency' ? 'bg-red-100 text-destructive' :
                    item.priority === 'Urgent' ? 'bg-amber-100 text-amber-700' :
                    'bg-muted text-foreground'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    item.status === 'Waiting' ? 'bg-amber-100 text-amber-700' :
                    item.status === 'In-Progress' ? 'bg-primary/10 text-primary' :
                    item.status === 'Completed' ? 'bg-green-100 text-primary' :
                    'bg-muted text-foreground'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {item.status === 'Waiting' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(item.id, 'In-Progress')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <ArrowRight className="size-4 mr-1" />
                    Start
                  </Button>
                )}
                {item.status === 'In-Progress' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(item.id, 'Completed')}
                    className="bg-primary hover:bg-green-700"
                  >
                    <CheckCircle className="size-4 mr-1" />
                    Complete
                  </Button>
                )}
                {(item.status === 'Waiting' || item.status === 'In-Progress') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(item.id, 'Cancelled')}
                  >
                    <XCircle className="size-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {filteredQueue.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No patients in queue. Click "Add to Queue" to add one.
          </div>
        )}
      </div>
    </div>
  );
}


