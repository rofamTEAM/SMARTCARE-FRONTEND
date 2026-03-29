import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { staffApi } from '../utils/api';

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  workingHours?: number;
  notes?: string;
}

interface AttendanceManagementProps {
  session: any;
}

export function AttendanceManagement({ session }: AttendanceManagementProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({});

  useEffect(() => {
    fetchAttendance();
    fetchStaff();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const data = await staffApi.getAll(`date=${selectedDate}`);
      setAttendance(data.filter((r: any) => r.date === selectedDate));
    } catch (error) {
      setAttendance([]);
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await staffApi.getAll();
      setStaff(data || []);
    } catch (error) {
      setStaff([]);
    }
  };

  const markAttendance = async (staffId: string, status: AttendanceRecord['status']) => {
    try {
      const selectedStaff = staff.find(s => s.id === staffId);
      const existingRecord = attendance.find(a => a.staffId === staffId);
      
      if (existingRecord) {
        toast.error('Attendance already marked for this staff member today');
        return;
      }

      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        staffId,
        staffName: selectedStaff?.name || '',
        date: selectedDate,
        checkIn: new Date().toLocaleTimeString(),
        status,
        workingHours: status === 'Present' ? 8 : status === 'Half Day' ? 4 : 0
      };

      await staffApi.create({ ...newRecord, type: 'attendance' }).catch(() => {});
      setAttendance([...attendance, newRecord]);
      toast.success(`Attendance marked as ${status}`);
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  const checkOut = async (id: string) => {
    const record = attendance.find(r => r.id === id);
    if (!record) return;
    const checkOutTime = new Date().toLocaleTimeString();
    const updated = { ...record, checkOut: checkOutTime };
    await staffApi.update(id, { checkOut: checkOutTime, type: 'attendance' }).catch(() => {});
    setAttendance(attendance.map(r => r.id === id ? updated : r));
    toast.success('Check-out recorded successfully');
  };

  const filteredAttendance = attendance.filter(record =>
    record.staffName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const absentCount = staff.length - attendance.length;
  const lateCount = attendance.filter(a => a.status === 'Late').length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-primary">{presentCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold text-destructive">{absentCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Staff</p>
                  <p className="text-2xl font-bold text-primary">{staff.length}</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Staff Attendance</CardTitle>
              <div className="flex items-center space-x-4">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="size-4 mr-2" />
                      Mark Attendance
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mark Attendance</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {staff.filter(member => !attendance.find(a => a.staffId === member.id)).map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => markAttendance(member.id, 'Present')} className="bg-primary hover:bg-green-700">
                              Present
                            </Button>
                            <Button size="sm" onClick={() => markAttendance(member.id, 'Late')} className="bg-yellow-600 hover:bg-yellow-700">
                              Late
                            </Button>
                            <Button size="sm" onClick={() => markAttendance(member.id, 'Half Day')} className="bg-primary hover:bg-orange-700">
                              Half Day
                            </Button>
                            <Button size="sm" onClick={() => markAttendance(member.id, 'Absent')} className="bg-destructive hover:bg-red-700">
                              Absent
                            </Button>
                          </div>
                        </div>
                      ))}
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
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-2 text-left">Staff Name</th>
                    <th className="border border-border px-4 py-2 text-left">Check In</th>
                    <th className="border border-border px-4 py-2 text-left">Check Out</th>
                    <th className="border border-border px-4 py-2 text-left">Working Hours</th>
                    <th className="border border-border px-4 py-2 text-left">Status</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-2">{record.staffName}</td>
                      <td className="border border-border px-4 py-2">{record.checkIn}</td>
                      <td className="border border-border px-4 py-2">{record.checkOut || '-'}</td>
                      <td className="border border-border px-4 py-2">{record.workingHours || 0} hrs</td>
                      <td className="border border-border px-4 py-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          record.status === 'Present' ? 'bg-green-100 text-green-800' :
                          record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                          record.status === 'Half Day' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="border border-border px-4 py-2">
                        {!record.checkOut && record.status !== 'Absent' && (
                          <Button size="sm" onClick={() => checkOut(record.id)} className="bg-[#38bdf8] hover:bg-[#0ea5e9]">
                            Check Out
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAttendance.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found for {selectedDate}.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


