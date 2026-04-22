import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Bed as BedIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { bedsApi } from '../utils/api';

interface Bed {
  id: string;
  bedNumber: string;
  department: string;
  ward: string;
  patientName: string;
  status: 'Occupied' | 'Available' | 'Maintenance';
  admissionDate?: string;
}

export function BedManagement() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [formData, setFormData] = useState<Partial<Bed>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      const { data } = await DatabaseService.getBeds();
      setBeds(data);
    } catch (error) {
      console.error('Error fetching beds:', error);
      toast.error('Failed to load beds');
    }
  };

  const filteredBeds = beds.filter(bed =>
    bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bed.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bed.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.bedNumber || !formData.department || !formData.ward) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newBed: Bed = {
        id: Date.now().toString(),
        bedNumber: formData.bedNumber || '',
        department: formData.department || '',
        ward: formData.ward || '',
        patientName: formData.patientName || '',
        status: (formData.status as Bed['status']) || 'Available',
        admissionDate: formData.admissionDate
      };
      
      const { data } = await DatabaseService.createBed(newBed);
      if (data) {
        setBeds([...beds, data]);
        setFormData({});
        setIsAddModalOpen(false);
        toast.success('Bed added successfully!');
      }
    } catch (error) {
      console.error('Error adding bed:', error);
      toast.error('Failed to add bed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bed: Bed) => {
    setSelectedBed(bed);
    setFormData(bed);
    setIsAddModalOpen(true);
  };

  const handleUpdate = async () => {
    if (selectedBed) {
      setLoading(true);
      try {
        const updatedBed = { ...selectedBed, ...formData };
        setBeds(beds.map(b => 
          b.id === selectedBed.id ? updatedBed : b
        ));
        setSelectedBed(null);
        setFormData({});
        setIsAddModalOpen(false);
        toast.success('Bed updated successfully!');
      } catch (error) {
        console.error('Error updating bed:', error);
        toast.error('Failed to update bed');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setBeds(beds.filter(b => b.id !== id));
      toast.success('Bed deleted successfully!');
    } catch (error) {
      console.error('Error deleting bed:', error);
      toast.error('Failed to delete bed');
    }
  };

  const stats = {
    total: beds.length,
    occupied: beds.filter(b => b.status === 'Occupied').length,
    available: beds.filter(b => b.status === 'Available').length,
    maintenance: beds.filter(b => b.status === 'Maintenance').length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <p className="text-sm text-primary">Total Beds</p>
              <h3 className="text-blue-900">{stats.total}</h3>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <p className="text-sm text-destructive">Occupied</p>
              <h3 className="text-red-900">{stats.occupied}</h3>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <p className="text-sm text-primary">Available</p>
              <h3 className="text-green-900">{stats.available}</h3>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <p className="text-sm text-primary">Maintenance</p>
              <h3 className="text-orange-900">{stats.maintenance}</h3>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bed Management</CardTitle>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setSelectedBed(null);
                      setFormData({});
                    }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    <Plus className="size-4 mr-2" />
                    Add Bed
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedBed ? 'Edit Bed' : 'Add New Bed'}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedNumber">Bed Number</Label>
                      <Input
                        id="bedNumber"
                        value={formData.bedNumber || ''}
                        onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                        placeholder="e.g., A-101"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="e.g., Cardiology"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ward">Ward</Label>
                      <Input
                        id="ward"
                        value={formData.ward || ''}
                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                        placeholder="e.g., Ward A"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        value={formData.status || 'Available'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Bed['status'] })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Patient Name (if occupied)</Label>
                      <Input
                        id="patientName"
                        value={formData.patientName || ''}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        placeholder="Enter patient name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admissionDate">Admission Date</Label>
                      <Input
                        id="admissionDate"
                        type="date"
                        value={formData.admissionDate || ''}
                        onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={selectedBed ? handleUpdate : handleAdd} disabled={loading}>
                      {loading ? 'Saving...' : selectedBed ? 'Update' : 'Add'} Bed
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Search by bed number, department, or patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBeds.map((bed, index) => (
                <motion.div
                  key={bed.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className={`rounded-lg p-4 shadow-md hover:shadow-lg transition-all border ${
                    bed.status === 'Occupied' ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' :
                    bed.status === 'Available' ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' :
                    'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        bed.status === 'Occupied' ? 'bg-red-200' :
                        bed.status === 'Available' ? 'bg-green-200' :
                        'bg-orange-200'
                      }`}>
                        <BedIcon className="size-6 text-foreground" />
                      </div>
                      <div>
                        <h4 className="text-gray-900">Bed {bed.bedNumber}</h4>
                        <p className="text-sm text-muted-foreground">{bed.ward}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Department:</span>
                      <span className="text-gray-900">{bed.department}</span>
                    </div>
                    {bed.patientName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Patient:</span>
                        <span className="text-gray-900">{bed.patientName}</span>
                      </div>
                    )}
                    {bed.admissionDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Admitted:</span>
                        <span className="text-gray-900">{bed.admissionDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        bed.status === 'Occupied' ? 'bg-red-100 text-destructive' :
                        bed.status === 'Available' ? 'bg-green-100 text-primary' :
                        'bg-orange-100 text-primary'
                      }`}>
                        {bed.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(bed)}
                      className="flex-1"
                    >
                      <Edit className="size-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(bed.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {filteredBeds.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No beds found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}



