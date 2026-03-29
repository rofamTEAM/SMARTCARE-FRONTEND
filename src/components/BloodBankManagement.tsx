import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, FileText, Droplets, User, Calendar, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

import { bloodBankApi } from '../utils/api';

interface BloodDonor {
  id: string;
  donor_name: string;
  age: number;
  blood_group: string;
  gender: string;
  father_name: string;
  address: string;
  contact_no: string;
  last_donation?: string;
  total_donations: number;
}

interface BloodIssue {
  id: string;
  bill_no: string;
  date_of_issue: string;
  patient_name: string;
  blood_group: string;
  doctor: string;
  amount: number;
  status: 'issued' | 'pending';
}

interface BloodBankManagementProps {
  session: any;
}

export function BloodBankManagement({ session }: BloodBankManagementProps) {
  const [activeTab, setActiveTab] = useState<'donors' | 'issues' | 'inventory'>('donors');
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [issues, setIssues] = useState<BloodIssue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDonor, setShowAddDonor] = useState(false);
  const [showIssueBlood, setShowIssueBlood] = useState(false);

  useEffect(() => {
    bloodBankApi.getDonors().then(setDonors).catch(() => {});
    bloodBankApi.getAll().then(setIssues).catch(() => {});
  }, []);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-200 text-red-900',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-200 text-blue-900',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-200 text-purple-900',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-200 text-green-900'
    };
    return colors[bloodGroup as keyof typeof colors] || 'bg-muted text-gray-800';
  };

  const filteredDonors = donors.filter(donor =>
    donor.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.blood_group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const DonorCard = ({ donor }: { donor: BloodDonor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-lg p-4 hover:shadow-lg smooth-transition glow-hover"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="size-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{donor.donor_name}</h3>
            <p className="text-sm text-muted-foreground">{donor.age} years, {donor.gender}</p>
          </div>
        </div>
        <Badge className={getBloodGroupColor(donor.blood_group)}>
          {donor.blood_group}
        </Badge>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <User className="size-4" />
          <span>Father: {donor.father_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="size-4" />
          <span>{donor.contact_no}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4" />
          <span>{donor.address}</span>
        </div>
        {donor.last_donation && (
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            <span>Last donation: {new Date(donor.last_donation).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <span className="text-sm font-medium text-primary">
          {donor.total_donations} donations
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="size-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="size-4" />
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const BloodInventory = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {bloodGroups.map((group) => {
        const available = Math.floor(Math.random() * 20) + 5; // Mock data
        return (
          <Card key={group} className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Droplets className="size-8 text-destructive" />
              </div>
              <Badge className={`${getBloodGroupColor(group)} mb-2`}>
                {group}
              </Badge>
              <p className="text-2xl font-bold text-gray-900">{available}</p>
              <p className="text-sm text-muted-foreground">Units Available</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Bank Management</h1>
          <p className="text-muted-foreground">Manage blood donors, inventory, and blood issues</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDonor(true)} className="glass-button smooth-transition glow-hover">
            <Plus className="size-4 mr-2" />
            Add Donor
          </Button>
          <Button variant="outline" onClick={() => setShowIssueBlood(true)} className="glass-button smooth-transition glow-hover">
            <Droplets className="size-4 mr-2" />
            Issue Blood
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 glass p-1 rounded-lg w-fit smooth-transition">
        {[
          { id: 'donors', label: 'Blood Donors', icon: User },
          { id: 'issues', label: 'Blood Issues', icon: FileText },
          { id: 'inventory', label: 'Inventory', icon: Droplets }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium smooth-transition ${
                activeTab === tab.id
                  ? 'glass-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-gray-900 hover:glass'
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      {activeTab !== 'inventory' && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'donors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map((donor) => (
              <DonorCard key={donor.id} donor={donor} />
            ))}
          </div>
        )}

        {activeTab === 'issues' && (
          <Card className="glass-card smooth-transition">
            <CardHeader>
              <CardTitle>Blood Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Bill No</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Patient</th>
                      <th className="text-left p-2">Blood Group</th>
                      <th className="text-left p-2">Doctor</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr key={issue.id} className="border-b">
                        <td className="p-2 font-medium">{issue.bill_no}</td>
                        <td className="p-2">{new Date(issue.date_of_issue).toLocaleDateString()}</td>
                        <td className="p-2">{issue.patient_name}</td>
                        <td className="p-2">
                          <Badge className={getBloodGroupColor(issue.blood_group)}>
                            {issue.blood_group}
                          </Badge>
                        </td>
                        <td className="p-2">{issue.doctor}</td>
                        <td className="p-2">${issue.amount}</td>
                        <td className="p-2">
                          <Badge variant={issue.status === 'issued' ? 'default' : 'secondary'}>
                            {issue.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="size-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'inventory' && <BloodInventory />}
      </div>

      {/* Add Donor Modal */}
      <Dialog open={showAddDonor} onOpenChange={setShowAddDonor}>
        <DialogContent className="max-w-md glass-modal">
          <DialogHeader>
            <DialogTitle>Add New Donor</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="donor_name">Donor Name</Label>
                <Input id="donor_name" placeholder="Enter name" />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" placeholder="Age" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="father_name">Father's Name</Label>
              <Input id="father_name" placeholder="Enter father's name" />
            </div>
            <div>
              <Label htmlFor="contact_no">Contact Number</Label>
              <Input id="contact_no" placeholder="Enter contact number" />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter address" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Add Donor</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddDonor(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Issue Blood Modal */}
      <Dialog open={showIssueBlood} onOpenChange={setShowIssueBlood}>
        <DialogContent className="max-w-md glass-modal">
          <DialogHeader>
            <DialogTitle>Issue Blood</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div>
              <Label htmlFor="bill_no">Bill Number</Label>
              <Input id="bill_no" placeholder="Enter bill number" />
            </div>
            <div>
              <Label htmlFor="patient_name">Patient Name</Label>
              <Input id="patient_name" placeholder="Enter patient name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blood_group_issue">Blood Group</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="units">Units</Label>
                <Input id="units" type="number" placeholder="Number of units" />
              </div>
            </div>
            <div>
              <Label htmlFor="doctor">Doctor</Label>
              <Input id="doctor" placeholder="Enter doctor name" />
            </div>
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input id="amount" type="number" placeholder="Enter amount" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Issue Blood</Button>
              <Button type="button" variant="outline" onClick={() => setShowIssueBlood(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


