import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Bed as BedIcon, Building, Users, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { bedsApi } from '../../utils/api';

interface Floor {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface BedGroup {
  id: string;
  name: string;
  floorId: string;
  description: string;
  createdAt: string;
}

interface BedType {
  id: string;
  name: string;
  createdAt: string;
}

interface BedItem {
  id: string;
  name: string;
  bedTypeId: string;
  bedGroupId: string;
  status: 'Available' | 'Occupied' | 'Maintenance';
  createdAt: string;
}

interface BedSetupProps {
  session: any;
}

export function BedSetup({ session }: BedSetupProps) {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [bedGroups, setBedGroups] = useState<BedGroup[]>([]);
  const [bedTypes, setBedTypes] = useState<BedType[]>([]);
  const [beds, setBeds] = useState<BedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'floors' | 'bedGroups' | 'bedTypes' | 'beds' | 'status'>('floors');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [floorsData, groupsData, typesData, bedsData] = await Promise.allSettled([
        bedsApi.getBeds().then(() => bedsApi.getBeds()),
        bedsApi.getBedGroups(),
        bedsApi.getBedTypes(),
        bedsApi.getBeds(),
      ]);
      if (floorsData.status === 'fulfilled') setFloors(floorsData.value || []);
      if (groupsData.status === 'fulfilled') setBedGroups(groupsData.value || []);
      if (typesData.status === 'fulfilled') setBedTypes(typesData.value || []);
      if (bedsData.status === 'fulfilled') setBeds(bedsData.value || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveFloors = async (updatedFloors: Floor[]) => { setFloors(updatedFloors); };
  const saveBedGroups = async (updatedBedGroups: BedGroup[]) => { setBedGroups(updatedBedGroups); };
  const saveBedTypes = async (updatedBedTypes: BedType[]) => { setBedTypes(updatedBedTypes); };
  const saveBeds = async (updatedBeds: BedItem[]) => { setBeds(updatedBeds); };

  const handleAdd = () => {
    if (!formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newItem = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };

      switch (activeTab) {
        case 'floors':
          saveFloors([...floors, newItem]);
          break;
        case 'bedGroups':
          saveBedGroups([...bedGroups, newItem]);
          break;
        case 'bedTypes':
          saveBedTypes([...bedTypes, newItem]);
          break;
        case 'beds':
          saveBeds([...beds, { ...newItem, status: 'Available' }]);
          break;
      }

      setFormData({});
      setIsModalOpen(false);
      toast.success(`${activeTab.slice(0, -1)} added successfully!`);
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedItem || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      switch (activeTab) {
        case 'floors':
          const updatedFloors = floors.map(f => f.id === selectedItem.id ? { ...f, ...formData } : f);
          saveFloors(updatedFloors);
          break;
        case 'bedGroups':
          const updatedBedGroups = bedGroups.map(bg => bg.id === selectedItem.id ? { ...bg, ...formData } : bg);
          saveBedGroups(updatedBedGroups);
          break;
        case 'bedTypes':
          const updatedBedTypes = bedTypes.map(bt => bt.id === selectedItem.id ? { ...bt, ...formData } : bt);
          saveBedTypes(updatedBedTypes);
          break;
        case 'beds':
          const updatedBeds = beds.map(b => b.id === selectedItem.id ? { ...b, ...formData } : b);
          saveBeds(updatedBeds);
          break;
      }

      setSelectedItem(null);
      setFormData({});
      setIsModalOpen(false);
      toast.success(`${activeTab.slice(0, -1)} updated successfully!`);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      switch (activeTab) {
        case 'floors':
          saveFloors(floors.filter(f => f.id !== id));
          break;
        case 'bedGroups':
          saveBedGroups(bedGroups.filter(bg => bg.id !== id));
          break;
        case 'bedTypes':
          saveBedTypes(bedTypes.filter(bt => bt.id !== id));
          break;
        case 'beds':
          saveBeds(beds.filter(b => b.id !== id));
          break;
      }
      toast.success('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item. Please try again.');
    }
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 'floors':
        return floors.filter(f => f.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      case 'bedGroups':
        return bedGroups.filter(bg => bg.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      case 'bedTypes':
        return bedTypes.filter(bt => bt.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      case 'beds':
        return beds.filter(b => b.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      default:
        return [];
    }
  };

  const renderTabContent = () => {
    const data = getFilteredData();

    if (activeTab === 'status') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{beds.filter(b => b.status === 'Available').length}</div>
                  <div className="text-sm text-muted-foreground">Available Beds</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{beds.filter(b => b.status === 'Occupied').length}</div>
                  <div className="text-sm text-muted-foreground">Occupied Beds</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{beds.filter(b => b.status === 'Maintenance').length}</div>
                  <div className="text-sm text-muted-foreground">Under Maintenance</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-3">
            {beds.map((bed, index) => {
              const bedType = bedTypes.find(bt => bt.id === bed.bedTypeId);
              const bedGroup = bedGroups.find(bg => bg.id === bed.bedGroupId);
              const floor = floors.find(f => f.id === bedGroup?.floorId);
              
              return (
                <motion.div
                  key={bed.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-bg rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Bed Name</p>
                      <p className="text-sm font-medium">{bed.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm">{bedType?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Group</p>
                      <p className="text-sm">{bedGroup?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Floor</p>
                      <p className="text-sm">{floor?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        bed.status === 'Available' ? 'bg-green-100 text-green-700' :
                        bed.status === 'Occupied' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {bed.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((item: any, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-bg rounded-lg p-4 hover:shadow-md transition-all"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1">
                {activeTab === 'floors' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Floor Name</p>
                      <p className="text-sm font-medium">{item.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm">{item.description || 'N/A'}</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'bedGroups' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Group Name</p>
                      <p className="text-sm font-medium">{item.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Floor</p>
                      <p className="text-sm">{floors.find(f => f.id === item.floorId)?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm">{item.description || 'N/A'}</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'bedTypes' && (
                  <div>
                    <p className="text-xs text-muted-foreground">Bed Type Name</p>
                    <p className="text-sm font-medium">{item.name}</p>
                  </div>
                )}
                
                {activeTab === 'beds' && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Bed Name</p>
                      <p className="text-sm font-medium">{item.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm">{bedTypes.find(bt => bt.id === item.bedTypeId)?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Group</p>
                      <p className="text-sm">{bedGroups.find(bg => bg.id === item.bedGroupId)?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        item.status === 'Available' ? 'bg-green-100 text-green-700' :
                        item.status === 'Occupied' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(item.id)}
                  className="text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {data.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No {activeTab} found. Click "Add {activeTab.slice(0, -1)}" to create one.
          </div>
        )}
      </div>
    );
  };

  const renderModal = () => {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`Enter ${activeTab.slice(0, -1)} name`}
                required
              />
            </div>
            
            {activeTab === 'bedGroups' && (
              <div className="space-y-2">
                <Label htmlFor="floorId">Floor *</Label>
                <select
                  id="floorId"
                  value={formData.floorId || ''}
                  onChange={(e) => setFormData({ ...formData, floorId: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md"
                  required
                >
                  <option value="">Select Floor</option>
                  {floors.map(floor => (
                    <option key={floor.id} value={floor.id}>{floor.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            {activeTab === 'beds' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bedTypeId">Bed Type *</Label>
                  <select
                    id="bedTypeId"
                    value={formData.bedTypeId || ''}
                    onChange={(e) => setFormData({ ...formData, bedTypeId: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md"
                    required
                  >
                    <option value="">Select Bed Type</option>
                    {bedTypes.map(bedType => (
                      <option key={bedType.id} value={bedType.id}>{bedType.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedGroupId">Bed Group *</Label>
                  <select
                    id="bedGroupId"
                    value={formData.bedGroupId || ''}
                    onChange={(e) => setFormData({ ...formData, bedGroupId: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md"
                    required
                  >
                    <option value="">Select Bed Group</option>
                    {bedGroups.map(bedGroup => (
                      <option key={bedGroup.id} value={bedGroup.id}>{bedGroup.name}</option>
                    ))}
                  </select>
                </div>
                {selectedItem && (
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status || 'Available'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                )}
              </>
            )}
            
            {(activeTab === 'floors' || activeTab === 'bedGroups') && (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-input rounded-md"
                  rows={3}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={selectedItem ? handleUpdate : handleAdd}
              disabled={loading || !formData.name}
            >
              {loading ? 'Saving...' : selectedItem ? 'Update' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <BedIcon className="size-6" />
                Bed Management Setup
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTab === 'floors' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('floors')}
                  size="sm"
                >
                  <Building className="size-4 mr-1" />
                  Floors
                </Button>
                <Button
                  variant={activeTab === 'bedGroups' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('bedGroups')}
                  size="sm"
                >
                  <Users className="size-4 mr-1" />
                  Groups
                </Button>
                <Button
                  variant={activeTab === 'bedTypes' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('bedTypes')}
                  size="sm"
                >
                  <Tag className="size-4 mr-1" />
                  Types
                </Button>
                <Button
                  variant={activeTab === 'beds' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('beds')}
                  size="sm"
                >
                  <BedIcon className="size-4 mr-1" />
                  Beds
                </Button>
                <Button
                  variant={activeTab === 'status' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('status')}
                  size="sm"
                >
                  Status
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab !== 'status' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setSelectedItem(null);
                        setFormData({});
                      }}
                    >
                      <Plus className="size-4 mr-2" />
                      Add {activeTab.slice(0, -1)}
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            )}

            {renderTabContent()}
          </CardContent>
        </Card>
      </motion.div>

      {renderModal()}
    </div>
  );
}

