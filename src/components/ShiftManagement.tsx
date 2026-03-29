import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Clock, Users, Calendar, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { staffApi } from '../utils/api';
import { staffApi } from '../utils/api';
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  department: string;
  maxStaff: number;
  assignedStaff: string[];
}

interface ShiftAssignment {
  id: string;
  staffId: string;
  staffName: string;
  shiftId: string;
  shiftName: string;
  date: string;
  status: 'Scheduled' | 'Completed' | 'Absent' | 'Swap Requested';
}

export function ShiftManagement({ session }: { session: any }) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [shiftFormData, setShiftFormData] = useState<Partial<Shift>>({});
  const [assignFormData, setAssignFormData] = useState<Partial<ShiftAssignment>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shiftsData, assignmentsData, staffData] = await Promise.allSettled([
        staffApi.getAll('type=shifts'),
        staffApi.getAll('type=shift_assignments'),
        staffApi.getAll(),
      ]);
      const defaultShifts: Shift[] = [
        { id: '1', name: 'Morning Shift', startTime: '06:00', endTime: '14:00', department: 'General', maxStaff: 10, assignedStaff: [] },
        { id: '2', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', department: 'General', maxStaff: 8, assignedStaff: [] },
        { id: '3', name: 'Night Shift', startTime: '22:00', endTime: '06:00', department: 'General', maxStaff: 6, assignedStaff: [] }
      ];
      setShifts(shiftsData.status === 'fulfilled' && shiftsData.value?.length ? shiftsData.value : defaultShifts);
      if (assignmentsData.status === 'fulfilled') setAssignments(assignmentsData.value || []);
      if (staffData.status === 'fulfilled') setStaff(staffData.value || []);
    } catch (error) {
      setShifts([]); setAssignments([]); setStaff([]);
    }
  };

  const handleAddShift = () => {
    if (!shiftFormData.name || !shiftFormData.startTime || !shiftFormData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newShift: Shift = {
      id: Date.now().toString(),
      name: shiftFormData.name!,
      startTime: shiftFormData.startTime!,
      endTime: shiftFormData.endTime!,
      department: shiftFormData.department || 'General',
      maxStaff: shiftFormData.maxStaff || 5,
      assignedStaff: []
    };

    const updatedShifts = [...shifts, newShift];
    setShifts(updatedShifts);
    await staffApi.create({ ...newShift, type: 'shift' }).catch(() => {});
    
    setShiftFormData({});
    setIsAddShiftOpen(false);
    toast.success('Shift created successfully!');
  };

  const handleAssignStaff = () => {
    if (!assignFormData.staffId || !assignFormData.shiftId) {
      toast.error('Please select staff and shift');
      return;
    }

    const selectedStaff = staff.find(s => s.id === assignFormData.staffId);
    const selectedShift = shifts.find(s => s.id === assignFormData.shiftId);

    const newAssignment: ShiftAssignment = {
      id: Date.now().toString(),
      staffId: assignFormData.staffId!,
      staffName: selectedStaff?.name || '',
      shiftId: assignFormData.shiftId!,
      shiftName: selectedShift?.name || '',
      date: selectedDate,
      status: 'Scheduled'
    };

    const updatedAssignments = [...assignments, newAssignment];
    setAssignments(updatedAssignments);
    await staffApi.create({ ...newAssignment, type: 'shift_assignment' }).catch(() => {});
    
    setAssignFormData({});
    setIsAssignOpen(false);
    toast.success('Staff assigned to shift successfully!');
  };

  const handleSwapRequest = (assignmentId: string) => {
    const updatedAssignments = assignments.map(a =>
      a.id === assignmentId ? { ...a, status: 'Swap Requested' as const } : a
    );
    setAssignments(updatedAssignments);
    await staffApi.update(assignmentId, { status: 'Swap Requested', type: 'shift_assignment' }).catch(() => {});
    toast.success('Swap request submitted!');
  };

  const todayAssignments = assignments.filter(assignment => assignment.date === selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-primary';
      case 'Absent': return 'bg-red-100 text-destructive';
      case 'Swap Requested': return 'bg-orange-100 text-primary';
      default: return 'bg-blue-100 text-primary';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 mb-2">Shift Management</h2>
            <p className="text-muted-foreground text-sm">Manage staff shifts and scheduling</p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="size-4 mr-2" />
                  Add Shift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Shift</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Shift Name *</Label>
                    <Input
                      value={shiftFormData.name || ''}
                      onChange={(e) => setShiftFormData({ ...shiftFormData, name: e.target.value })}
                      placeholder="e.g., Morning Shift"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time *</Label>
                      <Input
                        type="time"
                        value={shiftFormData.startTime || ''}
                        onChange={(e) => setShiftFormData({ ...shiftFormData, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time *</Label>
                      <Input
                        type="time"
                        value={shiftFormData.endTime || ''}
                        onChange={(e) => setShiftFormData({ ...shiftFormData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <select
                      value={shiftFormData.department || ''}
                      onChange={(e) => setShiftFormData({ ...shiftFormData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md"
                    >
                      <option value="General">General</option>
                      <option value="Emergency">Emergency</option>
                      <option value="ICU">ICU</option>
                      <option value="Surgery">Surgery</option>
                      <option value="Pediatrics">Pediatrics</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Staff</Label>
                    <Input
                      type="number"
                      value={shiftFormData.maxStaff || ''}
                      onChange={(e) => setShiftFormData({ ...shiftFormData, maxStaff: parseInt(e.target.value) })}
                      placeholder="Maximum staff for this shift"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddShiftOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddShift}>Create Shift</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Users className="size-4 mr-2" />
                  Assign Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Staff to Shift</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Staff Member *</Label>
                    <select
                      value={assignFormData.staffId || ''}
                      onChange={(e) => setAssignFormData({ ...assignFormData, staffId: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md"
                    >
                      <option value="">Select staff member</option>
                      {staff.map(member => (
                        <option key={member.id} value={member.id}>{member.name} - {member.role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Shift *</Label>
                    <select
                      value={assignFormData.shiftId || ''}
                      onChange={(e) => setAssignFormData({ ...assignFormData, shiftId: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md"
                    >
                      <option value="">Select shift</option>
                      {shifts.map(shift => (
                        <option key={shift.id} value={shift.id}>
                          {shift.name} ({shift.startTime} - {shift.endTime})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAssignOpen(false)}>Cancel</Button>
                  <Button onClick={handleAssignStaff}>Assign Staff</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                Available Shifts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shifts.map((shift) => (
                  <div key={shift.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{shift.name}</h3>
                      <span className="text-sm text-muted-foreground">{shift.department}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Time: {shift.startTime} - {shift.endTime}</p>
                      <p>Capacity: {shift.assignedStaff.length}/{shift.maxStaff} staff</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5" />
                Today's Assignments ({selectedDate})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayAssignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{assignment.staffName}</h3>
                        <p className="text-sm text-muted-foreground">{assignment.shiftName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                        {assignment.status === 'Scheduled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSwapRequest(assignment.id)}
                          >
                            <RotateCcw className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {todayAssignments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No shift assignments for {selectedDate}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

