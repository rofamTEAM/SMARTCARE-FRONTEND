import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trash2, Edit, Plus } from 'lucide-react';
import { settingsApi } from '../../utils/api';

interface PrintTemplate {
  id: string;
  type: 'opd_prescription' | 'ipd_bill' | 'pharmacy_bill' | 'payslip' | 'pathology' | 'radiology';
  headerImage?: string;
  footerText: string;
  isActive: boolean;
  createdAt: string;
}

const TEMPLATE_TYPES = [
  { value: 'opd_prescription', label: 'OPD Prescription' },
  { value: 'ipd_bill', label: 'IPD Bill' },
  { value: 'pharmacy_bill', label: 'Pharmacy Bill' },
  { value: 'payslip', label: 'Payroll Slip' },
  { value: 'pathology', label: 'Pathology Report' },
  { value: 'radiology', label: 'Radiology Report' }
];

export default function PrintHeaderFooterSetup() {
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PrintTemplate | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    headerImage: '',
    footerText: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await settingsApi.get();
      if (data?.printTemplates?.length) setTemplates(data.printTemplates);
    } catch {}
  };

  const saveTemplates = async (newTemplates: PrintTemplate[]) => {
    setTemplates(newTemplates);
    await settingsApi.update({ printTemplates: newTemplates }).catch(() => {});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.footerText.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const templateData: PrintTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      type: formData.type as PrintTemplate['type'],
      headerImage: formData.headerImage,
      footerText: formData.footerText,
      isActive: true,
      createdAt: editingTemplate?.createdAt || new Date().toISOString()
    };

    let newTemplates;
    if (editingTemplate) {
      newTemplates = templates.map(t => t.id === editingTemplate.id ? templateData : t);
    } else {
      const existingIndex = templates.findIndex(t => t.type === templateData.type);
      if (existingIndex >= 0) {
        newTemplates = templates.map((t, i) => i === existingIndex ? templateData : t);
      } else {
        newTemplates = [...templates, templateData];
      }
    }

    saveTemplates(newTemplates);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (template: PrintTemplate) => {
    setEditingTemplate(template);
    setFormData({
      type: template.type,
      headerImage: template.headerImage || '',
      footerText: template.footerText
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      const newTemplates = templates.filter(t => t.id !== id);
      saveTemplates(newTemplates);
    }
  };

  const resetForm = () => {
    setFormData({ type: '', headerImage: '', footerText: '' });
    setEditingTemplate(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, headerImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Print Header Footer Setup</h2>
          <p className="text-gray-600">Configure print templates for different modules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Add New Template'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Template Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="headerImage">Header Image</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  {formData.headerImage && (
                    <div className="border rounded p-2">
                      <img 
                        src={formData.headerImage} 
                        alt="Header preview" 
                        className="max-h-32 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="footerText">Footer Text *</Label>
                <Textarea
                  id="footerText"
                  value={formData.footerText}
                  onChange={(e) => setFormData(prev => ({ ...prev, footerText: e.target.value }))}
                  placeholder="Enter footer text for print template"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTemplate ? 'Update' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {TEMPLATE_TYPES.map(templateType => {
          const template = templates.find(t => t.type === templateType.value);
          
          return (
            <Card key={templateType.value}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{templateType.label}</span>
                  <div className="flex space-x-2">
                    {template ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, type: templateType.value }));
                          setIsDialogOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {template ? (
                  <div className="space-y-4">
                    {template.headerImage && (
                      <div>
                        <h4 className="font-medium mb-2">Header Image:</h4>
                        <img 
                          src={template.headerImage} 
                          alt="Header" 
                          className="max-h-24 object-contain border rounded"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium mb-2">Footer Text:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {template.footerText}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No template configured</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
