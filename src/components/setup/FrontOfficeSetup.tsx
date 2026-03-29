import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Trash2, Edit, Plus, Search, Users, MessageSquare, Building } from 'lucide-react';
import { visitorsApi, complaintsApi } from '../../utils/api';

interface VisitorPurpose {
  id: string;
  purpose: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface ComplaintType {
  id: string;
  complaintType: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface ComplaintSource {
  id: string;
  source: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export default function FrontOfficeSetup() {
  const [visitorPurposes, setVisitorPurposes] = useState<VisitorPurpose[]>([]);
  const [complaintTypes, setComplaintTypes] = useState<ComplaintType[]>([]);
  const [complaintSources, setComplaintSources] = useState<ComplaintSource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('purposes');

  const [isPurposeDialogOpen, setIsPurposeDialogOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false);

  const [editingPurpose, setEditingPurpose] = useState<VisitorPurpose | null>(null);
  const [editingType, setEditingType] = useState<ComplaintType | null>(null);
  const [editingSource, setEditingSource] = useState<ComplaintSource | null>(null);

  const [purposeForm, setPurposeForm] = useState({ purpose: '', description: '' });
  const [typeForm, setTypeForm] = useState({ complaintType: '', description: '' });
  const [sourceForm, setSourceForm] = useState({ source: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [purposesData, typesData] = await Promise.allSettled([
        visitorsApi.getAll(),
        complaintsApi.getAll(),
      ]);
      if (purposesData.status === 'fulfilled' && purposesData.value?.length) setVisitorPurposes(purposesData.value);
      else setVisitorPurposes([
        { id: '1', purpose: 'Patient Visit', description: 'Visiting patients', isActive: true, createdAt: new Date().toISOString() },
        { id: '2', purpose: 'Business Meeting', description: 'Official business meetings', isActive: true, createdAt: new Date().toISOString() },
        { id: '3', purpose: 'Medical Consultation', description: 'Consulting with doctors', isActive: true, createdAt: new Date().toISOString() },
      ]);
      setComplaintTypes([
        { id: '1', complaintType: 'Service Quality', description: 'Issues with service quality', isActive: true, createdAt: new Date().toISOString() },
        { id: '2', complaintType: 'Staff Behavior', description: 'Staff behavior related complaints', isActive: true, createdAt: new Date().toISOString() },
        { id: '3', complaintType: 'Facility Issues', description: 'Hospital facility related issues', isActive: true, createdAt: new Date().toISOString() },
      ]);
      setComplaintSources([
        { id: '1', source: 'Phone Call', description: 'Complaints received via phone', isActive: true, createdAt: new Date().toISOString() },
        { id: '2', source: 'Email', description: 'Complaints received via email', isActive: true, createdAt: new Date().toISOString() },
        { id: '3', source: 'In Person', description: 'Direct complaints at reception', isActive: true, createdAt: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handlePurposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purposeForm.purpose.trim()) return;

    const purposeData: VisitorPurpose = {
      id: editingPurpose?.id || Date.now().toString(),
      purpose: purposeForm.purpose.trim(),
      description: purposeForm.description.trim(),
      isActive: true,
      createdAt: editingPurpose?.createdAt || new Date().toISOString()
    };

    const newPurposes = editingPurpose
      ? visitorPurposes.map(p => p.id === editingPurpose.id ? purposeData : p)
      : [...visitorPurposes, purposeData];
    setVisitorPurposes(newPurposes);
    if (editingPurpose) { visitorsApi.update(editingPurpose.id, purposeData).catch(() => {}); }
    else { visitorsApi.create(purposeData).catch(() => {}); }
    resetPurposeForm();
    setIsPurposeDialogOpen(false);
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeForm.complaintType.trim()) return;

    const typeData: ComplaintType = {
      id: editingType?.id || Date.now().toString(),
      complaintType: typeForm.complaintType.trim(),
      description: typeForm.description.trim(),
      isActive: true,
      createdAt: editingType?.createdAt || new Date().toISOString()
    };

    const newTypes = editingType
      ? complaintTypes.map(t => t.id === editingType.id ? typeData : t)
      : [...complaintTypes, typeData];
    setComplaintTypes(newTypes);
    if (editingType) { complaintsApi.update(editingType.id, typeData).catch(() => {}); }
    else { complaintsApi.create(typeData).catch(() => {}); }
    resetTypeForm();
    setIsTypeDialogOpen(false);
  };

  const handleSourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceForm.source.trim()) return;

    const sourceData: ComplaintSource = {
      id: editingSource?.id || Date.now().toString(),
      source: sourceForm.source.trim(),
      description: sourceForm.description.trim(),
      isActive: true,
      createdAt: editingSource?.createdAt || new Date().toISOString()
    };

    const newSources = editingSource
      ? complaintSources.map(s => s.id === editingSource.id ? sourceData : s)
      : [...complaintSources, sourceData];
    setComplaintSources(newSources);
    resetSourceForm();
    setIsSourceDialogOpen(false);
  };

  const resetPurposeForm = () => {
    setPurposeForm({ purpose: '', description: '' });
    setEditingPurpose(null);
  };

  const resetTypeForm = () => {
    setTypeForm({ complaintType: '', description: '' });
    setEditingType(null);
  };

  const resetSourceForm = () => {
    setSourceForm({ source: '', description: '' });
    setEditingSource(null);
  };

  const filteredPurposes = visitorPurposes.filter(p =>
    p.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTypes = complaintTypes.filter(t =>
    t.complaintType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSources = complaintSources.filter(s =>
    s.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Front Office Setup</h2>
          <p className="text-gray-600">Manage visitor purposes, complaint types, and sources</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Visitor Purposes</p>
              <p className="text-2xl font-bold">{visitorPurposes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <MessageSquare className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Complaint Types</p>
              <p className="text-2xl font-bold">{complaintTypes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <Building className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Complaint Sources</p>
              <p className="text-2xl font-bold">{complaintSources.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purposes">Visitor Purposes</TabsTrigger>
          <TabsTrigger value="types">Complaint Types</TabsTrigger>
          <TabsTrigger value="sources">Complaint Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="purposes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Visitor Purposes ({filteredPurposes.length})</h3>
            <Dialog open={isPurposeDialogOpen} onOpenChange={setIsPurposeDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetPurposeForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Purpose
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPurpose ? 'Edit Purpose' : 'Add Visitor Purpose'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePurposeSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="purpose">Purpose *</Label>
                    <Input
                      id="purpose"
                      value={purposeForm.purpose}
                      onChange={(e) => setPurposeForm(prev => ({ ...prev, purpose: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="purposeDescription">Description</Label>
                    <Textarea
                      id="purposeDescription"
                      value={purposeForm.description}
                      onChange={(e) => setPurposeForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsPurposeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingPurpose ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredPurposes.map(purpose => (
              <Card key={purpose.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{purpose.purpose}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPurpose(purpose);
                          setPurposeForm({ purpose: purpose.purpose, description: purpose.description || '' });
                          setIsPurposeDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            visitorsApi.delete(purpose.id).catch(() => {});
                            setVisitorPurposes(prev => prev.filter(p => p.id !== purpose.id));
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                {purpose.description && (
                  <CardContent>
                    <p className="text-sm text-gray-600">{purpose.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Complaint Types ({filteredTypes.length})</h3>
            <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetTypeForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Complaint Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingType ? 'Edit Complaint Type' : 'Add Complaint Type'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTypeSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="complaintType">Complaint Type *</Label>
                    <Input
                      id="complaintType"
                      value={typeForm.complaintType}
                      onChange={(e) => setTypeForm(prev => ({ ...prev, complaintType: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="typeDescription">Description</Label>
                    <Textarea
                      id="typeDescription"
                      value={typeForm.description}
                      onChange={(e) => setTypeForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsTypeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingType ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredTypes.map(type => (
              <Card key={type.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{type.complaintType}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingType(type);
                          setTypeForm({ complaintType: type.complaintType, description: type.description || '' });
                          setIsTypeDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            complaintsApi.delete(type.id).catch(() => {});
                            setComplaintTypes(prev => prev.filter(t => t.id !== type.id));
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                {type.description && (
                  <CardContent>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Complaint Sources ({filteredSources.length})</h3>
            <Dialog open={isSourceDialogOpen} onOpenChange={setIsSourceDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetSourceForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSource ? 'Edit Source' : 'Add Complaint Source'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSourceSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="source">Source *</Label>
                    <Input
                      id="source"
                      value={sourceForm.source}
                      onChange={(e) => setSourceForm(prev => ({ ...prev, source: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sourceDescription">Description</Label>
                    <Textarea
                      id="sourceDescription"
                      value={sourceForm.description}
                      onChange={(e) => setSourceForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsSourceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSource ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredSources.map(source => (
              <Card key={source.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{source.source}</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSource(source);
                          setSourceForm({ source: source.source, description: source.description || '' });
                          setIsSourceDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            setComplaintSources(prev => prev.filter(s => s.id !== source.id));
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                {source.description && (
                  <CardContent>
                    <p className="text-sm text-gray-600">{source.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
