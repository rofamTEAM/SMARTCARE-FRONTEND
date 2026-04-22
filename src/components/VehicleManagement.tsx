import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Edit, Car, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { vehiclesApi } from '../utils/api';
import { VoiceAgent } from './VoiceAgent';

interface Vehicle {
  id: string;
  vehicleNo: string;
  vehicleModel: string;
  yearMade: string;
  driverName: string;
  driverLicense: string;
  driverContact: string;
  vehicleType: 'Ambulance' | 'Staff Transport' | 'Delivery' | 'Other';
  status: 'Available' | 'In Use' | 'Maintenance' | 'Out of Service';
  fuelType: string;
  capacity: number;
  insuranceExpiry: string;
  lastService: string;
  nextService: string;
  notes?: string;
  createdAt: string;
}

interface VehicleManagementProps {
  session: any;
}

export function VehicleManagement({ session }: VehicleManagementProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Vehicle>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const data = await vehiclesApi.getAll();
      setVehicles(data || []);
    } catch (error) {
      setVehicles([]);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicleNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vehicleModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.driverName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.vehicleNo || !formData.vehicleModel || !formData.driverName || !formData.vehicleType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newVehicle = await vehiclesApi.create({
        vehicleNo: formData.vehicleNo,
        vehicleModel: formData.vehicleModel,
        yearMade: formData.yearMade || '',
        driverName: formData.driverName,
        driverLicense: formData.driverLicense || '',
        driverContact: formData.driverContact || '',
        vehicleType: formData.vehicleType || 'Ambulance',
        status: 'Available',
        fuelType: formData.fuelType || 'Petrol',
        capacity: formData.capacity || 4,
        insuranceExpiry: formData.insuranceExpiry || '',
        lastService: formData.lastService || '',
        nextService: formData.nextService || '',
        notes: formData.notes || '',
      });
      setVehicles([...vehicles, newVehicle]);
      
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Vehicle added successfully!');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Vehicle['status']) => {
    const updated = await vehiclesApi.update(id, { status });
    setVehicles(vehicles.map(v => v.id === id ? updated : v));
    toast.success('Vehicle status updated successfully!');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    await vehiclesApi.delete(id);
    setVehicles(vehicles.filter(v => v.id !== id));
    toast.success('Vehicle deleted successfully!');
  };

  const vehicleTypes = ['Ambulance', 'Staff Transport', 'Delivery', 'Other'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

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
                <Car className="size-5" />
                Vehicle Management
              </CardTitle>
              <div className="flex items-center gap-2">
                <VoiceAgent department="ambulance" userRole={session?.role || 'admin'} />
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData({})}>
                    <Plus className="size-4 mr-2" />
                    Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                    <DialogDescription>
                      Enter the vehicle details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleNo">Vehicle Number *</Label>
                      <Input
                        id="vehicleNo"
                        value={formData.vehicleNo || ''}
                        onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                        placeholder="Enter vehicle number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleModel">Vehicle Model *</Label>
                      <Input
                        id="vehicleModel"
                        value={formData.vehicleModel || ''}
                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                        placeholder="Enter vehicle model"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearMade">Year Made</Label>
                      <Input
                        id="yearMade"
                        value={formData.yearMade || ''}
                        onChange={(e) => setFormData({ ...formData, yearMade: e.target.value })}
                        placeholder="Enter year made"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType">Vehicle Type *</Label>
                      <select
                        id="vehicleType"
                        value={formData.vehicleType || 'Ambulance'}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as Vehicle['vehicleType'] })}
                        className="w-full px-3 py-2 border rounded-md bg-input-background text-foreground border-input"
                      >
                        {vehicleTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driverName">Driver Name *</Label>
                      <Input
                        id="driverName"
                        value={formData.driverName || ''}
                        onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                        placeholder="Enter driver name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driverLicense">Driver License</Label>
                      <Input
                        id="driverLicense"
                        value={formData.driverLicense || ''}
                        onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                        placeholder="Enter license number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driverContact">Driver Contact</Label>
                      <Input
                        id="driverContact"
                        value={formData.driverContact || ''}
                        onChange={(e) => setFormData({ ...formData, driverContact: e.target.value })}
                        placeholder="Enter contact number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fuelType">Fuel Type</Label>
                      <select
                        id="fuelType"
                        value={formData.fuelType || 'Petrol'}
                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md bg-input-background text-foreground border-input"
                      >
                        {fuelTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={formData.capacity || ''}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                        placeholder="Enter capacity"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
                      <Input
                        id="insuranceExpiry"
                        type="date"
                        value={formData.insuranceExpiry || ''}
                        onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastService">Last Service</Label>
                      <Input
                        id="lastService"
                        type="date"
                        value={formData.lastService || ''}
                        onChange={(e) => setFormData({ ...formData, lastService: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextService">Next Service</Label>
                      <Input
                        id="nextService"
                        type="date"
                        value={formData.nextService || ''}
                        onChange={(e) => setFormData({ ...formData, nextService: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <textarea
                        id="notes"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Enter any additional notes"
                        className="w-full px-3 py-2 border rounded-md bg-input-background text-foreground border-input"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdd} disabled={loading}>
                      {loading ? 'Adding...' : 'Add Vehicle'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="size-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVehicles.map((vehicle) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card text-card-foreground border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Car className="size-5 text-primary" />
                      <h3 className="font-semibold">{vehicle.vehicleNo}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      vehicle.status === 'Available' ? 'bg-green-100 text-primary' :
                      vehicle.status === 'In Use' ? 'bg-blue-100 text-primary' :
                      vehicle.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-destructive'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Model:</span> {vehicle.vehicleModel}</p>
                    <p><span className="font-medium">Type:</span> {vehicle.vehicleType}</p>
                    <p><span className="font-medium">Driver:</span> {vehicle.driverName}</p>
                    <p><span className="font-medium">Contact:</span> {vehicle.driverContact}</p>
                    <p><span className="font-medium">Fuel:</span> {vehicle.fuelType}</p>
                    <p><span className="font-medium">Capacity:</span> {vehicle.capacity} persons</p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <select
                      value={vehicle.status}
                      onChange={(e) => handleStatusUpdate(vehicle.id, e.target.value as Vehicle['status'])}
                      className="w-full px-2 py-1 border rounded text-sm bg-input-background text-foreground border-input"
                    >
                      <option value="Available">Available</option>
                      <option value="In Use">In Use</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Out of Service">Out of Service</option>
                    </select>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MapPin className="size-4 mr-1" />
                        Track
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(vehicle.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredVehicles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No vehicles found.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

