import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  User, 
  FileText, 
  Heart, 
  Baby, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { VoiceAgent } from './VoiceAgent';

interface GynecologyPatient {
  id: string;
  name: string;
  age: number;
  phone: string;
  lastVisit: string;
  condition: string;
  status: 'consultation' | 'examination' | 'treatment' | 'follow-up' | 'delivery';
  pregnancyWeek?: number;
  nextAppointment?: string;
}

interface GynecologyProps {
  session: any;
}

export function GynecologyDepartment({ session }: GynecologyProps) {
  const [patients, setPatients] = useState<GynecologyPatient[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 28,
      phone: '+1234567890',
      lastVisit: '2024-01-15',
      condition: 'Prenatal Care',
      status: 'consultation',
      pregnancyWeek: 24,
      nextAppointment: '2024-01-29'
    },
    {
      id: '2',
      name: 'Maria Garcia',
      age: 32,
      phone: '+1234567891',
      lastVisit: '2024-01-14',
      condition: 'Routine Checkup',
      status: 'examination',
      nextAppointment: '2024-02-14'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [newPatientOpen, setNewPatientOpen] = useState(false);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'examination': return 'bg-yellow-100 text-yellow-800';
      case 'treatment': return 'bg-green-100 text-green-800';
      case 'follow-up': return 'bg-purple-100 text-purple-800';
      case 'delivery': return 'bg-pink-100 text-pink-800';
      default: return 'bg-muted text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'consultation': return <User className="size-4" />;
      case 'examination': return <FileText className="size-4" />;
      case 'treatment': return <Heart className="size-4" />;
      case 'follow-up': return <Clock className="size-4" />;
      case 'delivery': return <Baby className="size-4" />;
      default: return <AlertCircle className="size-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gynecology Department</h1>
          <p className="text-muted-foreground">Comprehensive women's healthcare management</p>
        </div>
        <div className="flex items-center gap-2">
          <VoiceAgent department="gynecology" userRole={session?.role || 'doctor'} />
          <Dialog open={newPatientOpen} onOpenChange={setNewPatientOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="size-4" />
              New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Gynecology Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Patient Name</Label>
                <Input id="name" placeholder="Enter patient name" />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" placeholder="Enter age" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prenatal">Prenatal Care</SelectItem>
                    <SelectItem value="routine">Routine Checkup</SelectItem>
                    <SelectItem value="fertility">Fertility Consultation</SelectItem>
                    <SelectItem value="menopause">Menopause Management</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Add Patient</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="consultation">Consultation</SelectItem>
            <SelectItem value="examination">Examination</SelectItem>
            <SelectItem value="treatment">Treatment</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="patients" className="space-y-6">
        <TabsList>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                          <User className="size-6 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{patient.name}</h3>
                          <p className="text-muted-foreground">Age: {patient.age} • {patient.phone}</p>
                          <p className="text-sm text-muted-foreground">Last Visit: {patient.lastVisit}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(patient.status)}>
                          {getStatusIcon(patient.status)}
                          <span className="ml-1 capitalize">{patient.status}</span>
                        </Badge>
                        <p className="text-sm font-medium">{patient.condition}</p>
                        {patient.pregnancyWeek && (
                          <p className="text-sm text-pink-600">Week {patient.pregnancyWeek}</p>
                        )}
                        {patient.nextAppointment && (
                          <p className="text-sm text-muted-foreground">Next: {patient.nextAppointment}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-primary" />
                    <div>
                      <p className="font-medium">Sarah Johnson</p>
                      <p className="text-sm text-muted-foreground">Prenatal Checkup</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">10:00 AM</p>
                    <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Baby className="size-5 text-pink-600" />
                    <div>
                      <p className="font-medium">Expected Deliveries</p>
                      <p className="text-sm text-muted-foreground">This week: 3 patients</p>
                    </div>
                  </div>
                  <Button variant="outline">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Patients</span>
                    <span className="font-semibold">{patients.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prenatal Care</span>
                    <span className="font-semibold">
                      {patients.filter(p => p.condition === 'Prenatal Care').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Routine Checkups</span>
                    <span className="font-semibold">
                      {patients.filter(p => p.condition === 'Routine Checkup').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

