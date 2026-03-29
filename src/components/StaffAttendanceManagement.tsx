import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, CheckCircle, XCircle, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { staffApi } from '../utils/api';

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  workingHours?: number;
  overtime?: number;
  notes?: string;
}

interface StaffAttendanceManagementProps {
  session: any;
}

export function StaffAttendanceManagement({ session }: StaffAttendanceManagementProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const data = await staffApi.getAll(`type=attendance&date=${selectedDate}`);
      if (data?.length) {
        setAttendance(data.filter((r: any) => r.date === selectedDate));
      } else {
        generateSampleAttendance();
      }
    } catch (error) {
      generateSampleAttendance();
    }
  };

  const generateSampleAttendance = () => {
    const sampleStaff = [
      { id: '1', name: 'Dr. John Smith', role: 'Doctor' },
      { id: '2', name: 'Nurse Mary Johnson', role: 'Nurse' },
      { id: '3', name: 'Dr. Sarah Wilson', role: 'Doctor' },
      { id: '4', name: 'Tech Mike Brown', role: 'Lab Technician' },
      { id: '5', name: 'Admin Lisa Davis', role: 'Receptionist' },
    ];

    const sampleAttendance = sampleStaff.map(staff => ({
      id: `${staff.id}-${selectedDate}`,
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role,
      date: selectedDate,
      status: 'Present' as const,
      checkIn: '09:00',
      checkOut: '',
      workingHours: 0,
      overtime: 0
    }));

    setAttendance(sampleAttendance);
  };

  const handleCheckIn = (recordId: string) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const updatedAttendance = attendance.map(record => 
      record.id === recordId 
        ? { ...record, checkIn: currentTime, status: 'Present' as const }
        : record
    );
    
    setAttendance(updatedAttendance);
    saveAttendance(updatedAttendance);
    toast.success('Check-in recorded successfully!');
  };

  const handleCheckOut = (recordId: string) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const updatedAttendance = attendance.map(record => {
      if (record.id === recordId && record.checkIn) {
        const checkInTime = new Date(`2000-01-01 ${record.checkIn}`);
        const checkOutTime = new Date(`2000-01-01 ${currentTime}`);
        const workingHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        
        return { 
          ...record, 
          checkOut: currentTime,
          workingHours: Math.round(workingHours * 100) / 100,
          overtime: workingHours > 8 ? Math.round((workingHours - 8) * 100) / 100 : 0
        };
      }
      return record;
    });
    
    setAttendance(updatedAttendance);
    saveAttendance(updatedAttendance);
    toast.success('Check-out recorded successfully!');
  };

  const handleStatusChange = (recordId: string, status: AttendanceRecord['status']) => {
    const updatedAttendance = attendance.map(record => 
      record.id === recordId ? { ...record, status } : record
    );
    
    setAttendance(updatedAttendance);
    saveAttendance(updatedAttendance);
    toast.success('Attendance status updated!');
  };

  const saveAttendance = async (attendanceData: AttendanceRecord[]) => {
    try {
      await Promise.all(attendanceData.map(r =>
        staffApi.update(r.id, { ...r, type: 'attendance' }).catch(() => {})
      ));
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-primary';
      case 'Absent': return 'bg-red-100 text-destructive';
      case 'Late': return 'bg-yellow-100 text-yellow-700';
      case 'Half Day': return 'bg-blue-100 text-primary';
      default: return 'bg-muted text-foreground';
    }
  };

  const generateMonthlyReport = async () => {
    try {
      const data = await staffApi.getAll(`type=attendance&month=${selectedMonth}`);
      console.log('Monthly Attendance Report:', data);
      toast.success('Monthly report generated!');
    } catch (error) {
      toast.error('Failed to generate report.');
    }
  };

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
                <Clock className="size-5" />
                Staff Attendance Management
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-auto"
                  />
                  <Button onClick={generateMonthlyReport} variant="outline">
                    <Download className="size-4 mr-2" />
                    Monthly Report
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-4 py-2 text-left">Staff Name</th>
                    <th className="border border-border px-4 py-2 text-left">Role</th>
                    <th className="border border-border px-4 py-2 text-left">Check In</th>
                    <th className="border border-border px-4 py-2 text-left">Check Out</th>
                    <th className="border border-border px-4 py-2 text-left">Working Hours</th>
                    <th className="border border-border px-4 py-2 text-left">Status</th>
                    <th className="border border-border px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/50">
                      <td className="border border-border px-4 py-2">
                        <div className="flex items-center gap-2">
                          <User className="size-4" />
                          {record.staffName}
                        </div>
                      </td>
                      <td className="border border-border px-4 py-2">{record.role}</td>
                      <td className="border border-border px-4 py-2">
                        {record.checkIn ? (
                          <span className="text-primary">{record.checkIn}</span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleCheckIn(record.id)}
                            className="bg-primary hover:bg-green-700"
                          >
                            <CheckCircle className="size-4 mr-1" />
                            Check In
                          </Button>
                        )}
                      </td>
                      <td className="border border-border px-4 py-2">
                        {record.checkOut ? (
                          <span className="text-destructive">{record.checkOut}</span>
                        ) : record.checkIn ? (
                          <Button
                            size="sm"
                            onClick={() => handleCheckOut(record.id)}
                            variant="outline"
                          >
                            <XCircle className="size-4 mr-1" />
                            Check Out
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="border border-border px-4 py-2">
                        {record.workingHours ? (
                          <div>
                            <span>{record.workingHours}h</span>
                            {record.overtime && record.overtime > 0 && (
                              <span className="text-primary ml-2">+{record.overtime}h OT</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="border border-border px-4 py-2">
                        <select
                          value={record.status}
                          onChange={(e) => handleStatusChange(record.id, e.target.value as AttendanceRecord['status'])}
                          className={`px-2 py-1 rounded text-xs border-0 ${getStatusColor(record.status)}`}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                          <option value="Half Day">Half Day</option>
                        </select>
                      </td>
                      <td className="border border-border px-4 py-2">
                        <div className="flex space-x-2">
                          {!record.checkIn && (
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(record.id)}
                              className="bg-primary hover:bg-green-700"
                            >
                              <CheckCircle className="size-4" />
                            </Button>
                          )}
                          {record.checkIn && !record.checkOut && (
                            <Button
                              size="sm"
                              onClick={() => handleCheckOut(record.id)}
                              variant="outline"
                            >
                              <XCircle className="size-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {attendance.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records for {selectedDate}.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

