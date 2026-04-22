import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, LogOut, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { frontofficeService } from '../services/frontoffice.service';
import { errorHandler } from '../utils/errorHandler';


interface Visitor {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  purposeId: string;
  patientId: string;
  visitDate: string;
  visitTime: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface VisitorManagementProps {
  session: any;
  onUpdate?: () => void;
}

export function VisitorManagement({ session, onUpdate }: VisitorManagementProps) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Visitor>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const data = await frontofficeService.getVisitors();
      setVisitors(data || []);
      onUpdate?.();
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
      setVisitors([]);
    }
  };

  const filteredVisitors = visitors.filter(visitor =>
    visitor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.phone?.includes(searchTerm)
  );

  const handleAdd = async () => {
    if (!formData.name || !formData.phone || !formData.patientId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toTimeString().split(' ')[0];
      
      const newVisitor = await frontofficeService.createVisitor({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        purposeId: formData.purposeId || 'general-visit',
        patientId: formData.patientId,
        visitDate: today,
        visitTime: now,
        notes: formData.notes
      });
      setVisitors([...visitors, newVisitor]);
      setFormData({});
      setIsAddModalOpen(false);
      onUpdate?.();
      toast.success('Visitor checked in successfully!');
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      const visitor = visitors.find(v => v.id === id);
      if (!visitor) return;
      
      const updated = await frontofficeService.updateVisitor(id, {
        ...visitor,
        notes: `${visitor.notes || ''} [Checked out]`
      });
      setVisitors(visitors.map(v => v.id === id ? updated : v));
      onUpdate?.();
      toast.success('Visitor checked out successfully!');
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
            placeholder="Search visitors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({})} className="bg-primary hover:bg-primary/90">
              <Plus className="size-4 mr-2" />
              Check-In Visitor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Visitor Check-In</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Visitor Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contact number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
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
                <Label htmlFor="purposeId">Purpose of Visit</Label>
                <select
                  id="purposeId"
                  value={formData.purposeId || 'general-visit'}
                  onChange={(e) => setFormData({ ...formData, purposeId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="general-visit">General Visit</option>
                  <option value="family-visit">Family Visit</option>
                  <option value="medical-consultation">Medical Consultation</option>
                  <option value="support">Support</option>
                </select>
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
                {loading ? 'Checking In...' : 'Check-In'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {filteredVisitors.map((visitor, index) => (
          <motion.div
            key={visitor.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-lg p-4 hover:shadow-md transition-all bg-gradient-to-r from-gray-50 to-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 grid grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Visitor</p>
                  <p className="text-sm text-gray-900">{visitor.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-gray-900">{visitor.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Patient ID</p>
                  <p className="text-sm text-gray-900">{visitor.patientId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-In Time</p>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatTime(visitor.visitTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Purpose</p>
                  <span className="inline-block px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                    {visitor.purposeId}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleCheckOut(visitor.id)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <LogOut className="size-4 mr-1" />
                  Check-Out
                </Button>
              </div>
            </div>
            {visitor.notes && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Notes:</p>
                <p className="text-sm text-gray-900">{visitor.notes}</p>
              </div>
            )}
          </motion.div>
        ))}

        {filteredVisitors.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No visitors found. Click "Check-In Visitor" to add one.
          </div>
        )}
      </div>
    </div>
  );
}


