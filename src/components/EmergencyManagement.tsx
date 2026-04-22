import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, AlertTriangle, Clock, User, Phone, MapPin, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { opdApi } from '../utils/api';
import { VoiceAgent } from './VoiceAgent';

interface EmergencyCase {
  id: string;
  patient_name: string;
  age: number;
  gender: string;
  contact: string;
  emergency_contact: string;
  chief_complaint: string;
  triage_level: 'critical' | 'urgent' | 'less_urgent' | 'non_urgent';
  arrival_time: string;
  assigned_doctor?: string;
  status: 'waiting' | 'in_treatment' | 'discharged' | 'admitted';
  vital_signs?: {
    blood_pressure: string;
    heart_rate: number;
    temperature: number;
    oxygen_saturation: number;
  };
  notes: string;
}

interface EmergencyManagementProps {
  session: any;
}

export function EmergencyManagement({ session }: EmergencyManagementProps) {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTriage, setFilterTriage] = useState('all');
  const [showAddCase, setShowAddCase] = useState(false);
  const [selectedCase, setSelectedCase] = useState<EmergencyCase | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<EmergencyCase>>({});

  useEffect(() => {
    fetchEmergencyCases();
  }, []);

  const fetchEmergencyCases = async () => {
    try {
      // Fetch from OPD API which handles emergency cases
      const data = await opdApi.getAll();
      // Filter for emergency/critical cases
      const emergencyCases = (data || [])
        .filter((case_: any) => case_.status === 'emergency' || case_.triage_level === 'critical' || case_.triage_level === 'urgent')
        .map((case_: any) => ({
          id: case_.id?.toString() || Date.now().toString(),
          patient_name: case_.patient_name || case_.patientName || 'Unknown',
          age: case_.age || 0,
          gender: case_.gender || '',
          contact: case_.contact || case_.phone || '',
          emergency_contact: case_.emergency_contact || '',
          chief_complaint: case_.chief_complaint || case_.reason || '',
          triage_level: case_.triage_level || 'non_urgent',
          arrival_time: case_.arrival_time || case_.createdAt || new Date().toISOString(),
          assigned_doctor: case_.assigned_doctor || case_.doctorId || '',
          status: case_.status || 'waiting',
          vital_signs: case_.vital_signs,
          notes: case_.notes || ''
        }));
      setCases(emergencyCases);
    } catch (error) {
      console.error('Error fetching emergency cases:', error);
      toast.error('Failed to load emergency cases');
      setCases([]);
    }
  };

  const handleAddCase = async () => {
    if (!formData.patient_name || !formData.chief_complaint) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newCase: EmergencyCase = {
        id: Date.now().toString(),
        patient_name: formData.patient_name || '',
        age: formData.age || 0,
        gender: formData.gender || '',
        contact: formData.contact || '',
        emergency_contact: formData.emergency_contact || '',
        chief_complaint: formData.chief_complaint || '',
        triage_level: formData.triage_level || 'non_urgent',
        arrival_time: new Date().toISOString(),
        status: 'waiting',
        notes: formData.notes || ''
      };
      
      // Create as OPD case with emergency flag
      const createdCase = await opdApi.create({
        patientName: newCase.patient_name,
        age: newCase.age,
        gender: newCase.gender,
        phone: newCase.contact,
        reason: newCase.chief_complaint,
        notes: newCase.notes,
        status: 'emergency',
        triageLevel: newCase.triage_level
      });
      
      if (createdCase) {
        setCases([...cases, newCase]);
        setFormData({});
        setShowAddCase(false);
        toast.success('Emergency case added successfully!');
      }
    } catch (error) {
      console.error('Error adding emergency case:', error);
      toast.error('Failed to add emergency case');
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.chief_complaint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTriage = filterTriage === 'all' || case_.triage_level === filterTriage;
    
    return matchesSearch && matchesTriage;
  });

  const getTriageColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'less_urgent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'non_urgent': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-muted text-gray-800 border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'in_treatment': return 'bg-blue-100 text-blue-800';
      case 'discharged': return 'bg-green-100 text-green-800';
      case 'admitted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getWaitTime = (arrivalTime: string) => {
    const arrival = new Date(arrivalTime);
    const now = new Date();
    const diffMs = now.getTime() - arrival.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const EmergencyCard = ({ case_ }: { case_: EmergencyCase }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-lg border-2 p-4 hover:shadow-md transition-shadow ${
        case_.triage_level === 'critical' ? 'border-red-200' :
        case_.triage_level === 'urgent' ? 'border-orange-200' :
        case_.triage_level === 'less_urgent' ? 'border-yellow-200' : 'border-green-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            case_.triage_level === 'critical' ? 'bg-red-100' :
            case_.triage_level === 'urgent' ? 'bg-orange-100' :
            case_.triage_level === 'less_urgent' ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            <AlertTriangle className={`size-6 ${
              case_.triage_level === 'critical' ? 'text-destructive' :
              case_.triage_level === 'urgent' ? 'text-primary' :
              case_.triage_level === 'less_urgent' ? 'text-yellow-600' : 'text-primary'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{case_.patient_name}</h3>
            <p className="text-sm text-muted-foreground">{case_.age} years, {case_.gender}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Badge className={getTriageColor(case_.triage_level)}>
            {case_.triage_level.replace('_', ' ')}
          </Badge>
          <Badge className={getStatusColor(case_.status)}>
            {case_.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground mb-3">
        <div>
          <span className="font-medium">Chief Complaint:</span>
          <p className="text-gray-900">{case_.chief_complaint}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="size-4" />
            <span>Wait: {getWaitTime(case_.arrival_time)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="size-4" />
            <span>{case_.contact}</span>
          </div>
        </div>

        {case_.assigned_doctor && (
          <div className="flex items-center gap-1">
            <Stethoscope className="size-4" />
            <span>Dr: {case_.assigned_doctor}</span>
          </div>
        )}

        {case_.vital_signs && (
          <div className="grid grid-cols-2 gap-2 text-xs bg-muted/50 p-2 rounded">
            <div>BP: {case_.vital_signs.blood_pressure}</div>
            <div>HR: {case_.vital_signs.heart_rate}</div>
            <div>Temp: {case_.vital_signs.temperature}°F</div>
            <div>O2: {case_.vital_signs.oxygen_saturation}%</div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t">
        <Button variant="outline" size="sm" onClick={() => setSelectedCase(case_)}>
          View Details
        </Button>
        {case_.status === 'waiting' && (
          <Button size="sm">
            Assign Doctor
          </Button>
        )}
      </div>
    </motion.div>
  );

  const triageStats = {
    critical: cases.filter(c => c.triage_level === 'critical').length,
    urgent: cases.filter(c => c.triage_level === 'urgent').length,
    less_urgent: cases.filter(c => c.triage_level === 'less_urgent').length,
    non_urgent: cases.filter(c => c.triage_level === 'non_urgent').length,
    waiting: cases.filter(c => c.status === 'waiting').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Department</h1>
          <p className="text-muted-foreground">Manage emergency cases and triage</p>
        </div>
        <div className="flex items-center gap-2">
          <VoiceAgent department="emergency" userRole={session?.role || 'nurse'} />
          <Button onClick={() => setShowAddCase(true)}>
            <Plus className="size-4 mr-2" />
            New Emergency Case
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{triageStats.critical}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{triageStats.urgent}</div>
            <div className="text-sm text-muted-foreground">Urgent</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{triageStats.less_urgent}</div>
            <div className="text-sm text-muted-foreground">Less Urgent</div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{triageStats.non_urgent}</div>
            <div className="text-sm text-muted-foreground">Non Urgent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{triageStats.waiting}</div>
            <div className="text-sm text-muted-foreground">Waiting</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterTriage} onValueChange={setFilterTriage}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by triage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Triage Levels</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="less_urgent">Less Urgent</SelectItem>
            <SelectItem value="non_urgent">Non Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases
          .sort((a, b) => {
            const triageOrder = { critical: 0, urgent: 1, less_urgent: 2, non_urgent: 3 };
            return triageOrder[a.triage_level] - triageOrder[b.triage_level];
          })
          .map((case_) => (
            <EmergencyCard key={case_.id} case_={case_} />
          ))}
      </div>

      {/* Add Case Modal */}
      <Dialog open={showAddCase} onOpenChange={setShowAddCase}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Emergency Case</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAddCase(); }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient_name">Patient Name</Label>
                <Input 
                  id="patient_name" 
                  placeholder="Enter patient name" 
                  value={formData.patient_name || ''}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="Enter age" 
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="triage_level">Triage Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select triage level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="less_urgent">Less Urgent</SelectItem>
                    <SelectItem value="non_urgent">Non Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" placeholder="Enter contact number" />
              </div>
              <div>
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input id="emergency_contact" placeholder="Enter emergency contact" />
              </div>
            </div>
            <div>
              <Label htmlFor="chief_complaint">Chief Complaint</Label>
              <Textarea id="chief_complaint" placeholder="Describe the main complaint" />
            </div>
            <div>
              <Label htmlFor="notes">Initial Notes</Label>
              <Textarea id="notes" placeholder="Additional notes" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" onClick={handleAddCase} disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Case'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddCase(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Case Details Modal */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Emergency Case Details</DialogTitle>
          </DialogHeader>
          {selectedCase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient Name</Label>
                  <p className="font-medium">{selectedCase.patient_name}</p>
                </div>
                <div>
                  <Label>Age & Gender</Label>
                  <p className="font-medium">{selectedCase.age} years, {selectedCase.gender}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Triage Level</Label>
                  <Badge className={getTriageColor(selectedCase.triage_level)}>
                    {selectedCase.triage_level.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedCase.status)}>
                    {selectedCase.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Chief Complaint</Label>
                <p>{selectedCase.chief_complaint}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact</Label>
                  <p>{selectedCase.contact}</p>
                </div>
                <div>
                  <Label>Emergency Contact</Label>
                  <p>{selectedCase.emergency_contact}</p>
                </div>
              </div>
              {selectedCase.vital_signs && (
                <div>
                  <Label>Vital Signs</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-muted/50 rounded">
                    <div>Blood Pressure: {selectedCase.vital_signs.blood_pressure}</div>
                    <div>Heart Rate: {selectedCase.vital_signs.heart_rate} bpm</div>
                    <div>Temperature: {selectedCase.vital_signs.temperature}°F</div>
                    <div>Oxygen Saturation: {selectedCase.vital_signs.oxygen_saturation}%</div>
                  </div>
                </div>
              )}
              <div>
                <Label>Notes</Label>
                <p>{selectedCase.notes}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


