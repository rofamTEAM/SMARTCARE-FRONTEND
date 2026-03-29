import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, LogOut, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { visitorsApi } from '../utils/api';


interface Visitor {
  id: string;
  visitorName: string;
  phone: string;
  patientName: string;
  purpose: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'Active' | 'Checked-Out';
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
      const data = await visitorsApi.getAll();
      setVisitors(data || []);
      onUpdate?.();
    } catch (error) {
      setVisitors([]);
    }
  };

  const filteredVisitors = visitors.filter(visitor =>
    visitor.visitorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.phone?.includes(searchTerm)
  );

  const handleAdd = async () => {
    if (!formData.visitorName || !formData.phone || !formData.patientName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newVisitor = await visitorsApi.create({
        visitorName: formData.visitorName,
        phone: formData.phone,
        patientName: formData.patientName,
        purpose: formData.purpose || '',
        status: 'Active',
        checkInTime: new Date().toISOString()
      });
      setVisitors([...visitors, newVisitor]);
      setFormData({});
      setIsAddModalOpen(false);
      onUpdate?.();
      toast.success('Visitor checked in successfully!');
    } catch (error) {
      console.error('Error adding visitor:', error);
      toast.error('Failed to check in visitor');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      const updated = await visitorsApi.update(id, {
        status: 'Checked-Out',
        checkOutTime: new Date().toISOString()
      });
      setVisitors(visitors.map(v => v.id === id ? updated : v));
      onUpdate?.();
      toast.success('Visitor checked out successfully!');
    } catch (error) {
      toast.error('Failed to check out visitor');
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
                <Label htmlFor="visitorName">Visitor Name</Label>
                <Input
                  id="visitorName"
                  value={formData.visitorName || ''}
                  onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
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
                <Label htmlFor="patientName">Patient to Visit</Label>
                <Input
                  id="patientName"
                  value={formData.patientName || ''}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="Patient name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Visit</Label>
                <Input
                  id="purpose"
                  value={formData.purpose || ''}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g., Family visit, Medical consultation"
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
            className={`rounded-lg p-4 hover:shadow-md transition-all ${
              visitor.status === 'Active' 
                ? 'bg-gradient-to-r from-gray-50 to-gray-100' 
                : 'bg-gradient-to-r from-gray-50 to-gray-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 grid grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Visitor</p>
                  <p className="text-sm text-gray-900">{visitor.visitorName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-gray-900">{visitor.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Visiting</p>
                  <p className="text-sm text-gray-900">{visitor.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-In Time</p>
                  <p className="text-sm text-gray-900 flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatTime(visitor.checkInTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    visitor.status === 'Active' 
                      ? 'bg-green-100 text-primary' 
                      : 'bg-muted text-foreground'
                  }`}>
                    {visitor.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {visitor.status === 'Active' && (
                  <Button
                    size="sm"
                    onClick={() => handleCheckOut(visitor.id)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <LogOut className="size-4 mr-1" />
                    Check-Out
                  </Button>
                )}
              </div>
            </div>
            {visitor.purpose && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Purpose:</p>
                <p className="text-sm text-gray-900">{visitor.purpose}</p>
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


