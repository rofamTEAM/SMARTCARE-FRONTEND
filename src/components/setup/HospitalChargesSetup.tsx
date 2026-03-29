import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { chargesApi } from '../../utils/api';
import { chargesApi } from '../../utils/api';
  id: string;
  name: string;
  description: string;
  chargeType: 'Procedures' | 'Investigations' | 'Supplier' | 'Operation Theatre' | 'Other';
  createdAt: string;
}

interface Charge {
  id: string;
  chargeType: string;
  chargeCategoryId: string;
  chargeCode: string;
  standardCharge: number;
  description: string;
  tpaCharge?: number;
  createdAt: string;
}

interface HospitalChargesSetupProps {
  session: any;
}

export function HospitalChargesSetup({ session }: HospitalChargesSetupProps) {
  const [chargeCategories, setChargeCategories] = useState<ChargeCategory[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'charges'>('categories');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChargeCategory | null>(null);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Partial<ChargeCategory>>({});
  const [chargeFormData, setChargeFormData] = useState<Partial<Charge>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cats, chgs] = await Promise.allSettled([
        chargesApi.getCategories(),
        chargesApi.getAll(),
      ]);
      if (cats.status === 'fulfilled') setChargeCategories(cats.value || []);
      if (chgs.status === 'fulfilled') setCharges(chgs.value || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveCategories = (updatedCategories: ChargeCategory[]) => { setChargeCategories(updatedCategories); };
  const saveCharges = (updatedCharges: Charge[]) => { setCharges(updatedCharges); };

  const filteredCategories = chargeCategories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.chargeType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCharges = charges.filter(charge => {
    const category = chargeCategories.find(c => c.id === charge.chargeCategoryId);
    return charge.chargeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           charge.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleAddCategory = () => {
    if (!categoryFormData.name || !categoryFormData.chargeType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newCategory: ChargeCategory = {
        id: Date.now().toString(),
        name: categoryFormData.name || '',
        description: categoryFormData.description || '',
        chargeType: categoryFormData.chargeType || 'Other',
        createdAt: new Date().toISOString()
      };

      const updatedCategories = [...chargeCategories, newCategory];
      saveCategories(updatedCategories);
      setCategoryFormData({});
      setIsCategoryModalOpen(false);
      toast.success('Charge category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCharge = () => {
    if (!chargeFormData.chargeCategoryId || !chargeFormData.chargeCode || !chargeFormData.standardCharge) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const category = chargeCategories.find(c => c.id === chargeFormData.chargeCategoryId);
      const newCharge: Charge = {
        id: Date.now().toString(),
        chargeType: category?.chargeType || 'Other',
        chargeCategoryId: chargeFormData.chargeCategoryId || '',
        chargeCode: chargeFormData.chargeCode || '',
        standardCharge: chargeFormData.standardCharge || 0,
        description: chargeFormData.description || '',
        tpaCharge: chargeFormData.tpaCharge,
        createdAt: new Date().toISOString()
      };

      const updatedCharges = [...charges, newCharge];
      saveCharges(updatedCharges);
      setChargeFormData({});
      setIsChargeModalOpen(false);
      toast.success('Charge added successfully!');
    } catch (error) {
      console.error('Error adding charge:', error);
      toast.error('Failed to add charge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: ChargeCategory) => {
    setSelectedCategory(category);
    setCategoryFormData(category);
    setIsCategoryModalOpen(true);
  };

  const handleEditCharge = (charge: Charge) => {
    setSelectedCharge(charge);
    setChargeFormData(charge);
    setIsChargeModalOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!selectedCategory || !categoryFormData.name || !categoryFormData.chargeType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const updatedCategories = chargeCategories.map(c => 
        c.id === selectedCategory.id ? { ...c, ...categoryFormData } : c
      );
      saveCategories(updatedCategories);
      setSelectedCategory(null);
      setCategoryFormData({});
      setIsCategoryModalOpen(false);
      toast.success('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCharge = () => {
    if (!selectedCharge || !chargeFormData.chargeCategoryId || !chargeFormData.chargeCode || !chargeFormData.standardCharge) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const category = chargeCategories.find(c => c.id === chargeFormData.chargeCategoryId);
      const updatedCharges = charges.map(c => 
        c.id === selectedCharge.id ? { 
          ...c, 
          ...chargeFormData,
          chargeType: category?.chargeType || 'Other'
        } : c
      );
      saveCharges(updatedCharges);
      setSelectedCharge(null);
      setChargeFormData({});
      setIsChargeModalOpen(false);
      toast.success('Charge updated successfully!');
    } catch (error) {
      console.error('Error updating charge:', error);
      toast.error('Failed to update charge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all associated charges.')) return;
    
    const updatedCategories = chargeCategories.filter(c => c.id !== id);
    const updatedCharges = charges.filter(c => c.chargeCategoryId !== id);
    saveCategories(updatedCategories);
    saveCharges(updatedCharges);
    toast.success('Category deleted successfully!');
  };

  const handleDeleteCharge = (id: string) => {
    if (!confirm('Are you sure you want to delete this charge?')) return;
    
    const updatedCharges = charges.filter(c => c.id !== id);
    saveCharges(updatedCharges);
    toast.success('Charge deleted successfully!');
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
                <DollarSign className="size-6" />
                Hospital Charges Setup
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'categories' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('categories')}
                >
                  Categories
                </Button>
                <Button
                  variant={activeTab === 'charges' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('charges')}
                >
                  Charges
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
              {activeTab === 'categories' ? (
                <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setSelectedCategory(null);
                        setCategoryFormData({});
                      }}
                    >
                      <Plus className="size-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                </Dialog>
              ) : (
                <Dialog open={isChargeModalOpen} onOpenChange={setIsChargeModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setSelectedCharge(null);
                        setChargeFormData({});
                      }}
                    >
                      <Plus className="size-4 mr-2" />
                      Add Charge
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </div>

            {activeTab === 'categories' ? (
              <div className="space-y-3">
                {filteredCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-bg rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Category Name</p>
                            <p className="text-sm font-medium text-foreground">{category.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Charge Type</p>
                            <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                              {category.chargeType}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Description</p>
                            <p className="text-sm text-foreground">{category.description || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredCategories.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No charge categories found. Click "Add Category" to create one.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCharges.map((charge, index) => {
                  const category = chargeCategories.find(c => c.id === charge.chargeCategoryId);
                  return (
                    <motion.div
                      key={charge.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-bg rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Charge Code</p>
                              <p className="text-sm font-medium text-foreground">{charge.chargeCode}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Category</p>
                              <p className="text-sm text-foreground">{category?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Standard Charge</p>
                              <p className="text-sm font-medium text-foreground">${charge.standardCharge}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">TPA Charge</p>
                              <p className="text-sm text-foreground">{charge.tpaCharge ? `$${charge.tpaCharge}` : 'N/A'}</p>
                            </div>
                          </div>
                          {charge.description && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Description</p>
                              <p className="text-sm text-foreground">{charge.description}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCharge(charge)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCharge(charge.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredCharges.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No charges found. Click "Add Charge" to create one.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add Charge Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={categoryFormData.name || ''}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chargeType">Charge Type *</Label>
              <select
                id="chargeType"
                value={categoryFormData.chargeType || ''}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, chargeType: e.target.value as any })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              >
                <option value="">Select Charge Type</option>
                <option value="Procedures">Procedures</option>
                <option value="Investigations">Investigations</option>
                <option value="Supplier">Supplier</option>
                <option value="Operation Theatre">Operation Theatre</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryDescription">Description</Label>
              <textarea
                id="categoryDescription"
                value={categoryFormData.description || ''}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                placeholder="Enter description"
                className="w-full px-3 py-2 border border-input rounded-md"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={selectedCategory ? handleUpdateCategory : handleAddCategory}
              disabled={loading || !categoryFormData.name || !categoryFormData.chargeType}
            >
              {loading ? 'Saving...' : selectedCategory ? 'Update' : 'Add'} Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Charge Modal */}
      <Dialog open={isChargeModalOpen} onOpenChange={setIsChargeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCharge ? 'Edit Charge' : 'Add Charge'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chargeCategoryId">Charge Category *</Label>
              <select
                id="chargeCategoryId"
                value={chargeFormData.chargeCategoryId || ''}
                onChange={(e) => setChargeFormData({ ...chargeFormData, chargeCategoryId: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md"
                required
              >
                <option value="">Select Category</option>
                {chargeCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.chargeType})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chargeCode">Charge Code *</Label>
              <Input
                id="chargeCode"
                value={chargeFormData.chargeCode || ''}
                onChange={(e) => setChargeFormData({ ...chargeFormData, chargeCode: e.target.value })}
                placeholder="Enter charge code"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="standardCharge">Standard Charge ($) *</Label>
                <Input
                  id="standardCharge"
                  type="number"
                  value={chargeFormData.standardCharge || ''}
                  onChange={(e) => setChargeFormData({ ...chargeFormData, standardCharge: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpaCharge">TPA Charge ($)</Label>
                <Input
                  id="tpaCharge"
                  type="number"
                  value={chargeFormData.tpaCharge || ''}
                  onChange={(e) => setChargeFormData({ ...chargeFormData, tpaCharge: parseFloat(e.target.value) || undefined })}
                  placeholder="Enter TPA amount"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chargeDescription">Description</Label>
              <textarea
                id="chargeDescription"
                value={chargeFormData.description || ''}
                onChange={(e) => setChargeFormData({ ...chargeFormData, description: e.target.value })}
                placeholder="Enter description"
                className="w-full px-3 py-2 border border-input rounded-md"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsChargeModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={selectedCharge ? handleUpdateCharge : handleAddCharge}
              disabled={loading || !chargeFormData.chargeCategoryId || !chargeFormData.chargeCode || !chargeFormData.standardCharge}
            >
              {loading ? 'Saving...' : selectedCharge ? 'Update' : 'Add'} Charge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

