import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { appointmentsService, Appointment } from '../services/appointments.service';
import { toast } from 'sonner';
import { errorHandler } from '../utils/errorHandler';

export function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Partial<Appointment>>({});

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentsService.getAll();
      setAppointments(data || []);
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    if (!formData.patientId || !formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const newAppointment = await appointmentsService.create({
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason || '',
        notes: formData.notes,
      });
      setAppointments([...appointments, newAppointment]);
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Appointment scheduled successfully!');
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormData(appointment);
    setIsAddModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedAppointment) return;

    try {
      setLoading(true);
      const updated = await appointmentsService.update(selectedAppointment.id, {
        patientId: formData.patientId || selectedAppointment.patientId,
        doctorId: formData.doctorId || selectedAppointment.doctorId,
        appointmentDate: formData.appointmentDate || selectedAppointment.appointmentDate,
        appointmentTime: formData.appointmentTime || selectedAppointment.appointmentTime,
        reason: formData.reason || selectedAppointment.reason,
        notes: formData.notes,
      });
      setAppointments(appointments.map(a => a.id === selectedAppointment.id ? updated : a));
      setSelectedAppointment(null);
      setFormData({});
      setIsAddModalOpen(false);
      toast.success('Appointment updated successfully!');
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      setLoading(true);
      await appointmentsService.delete(id);
      setAppointments(appointments.filter(a => a.id !== id));
      toast.success('Appointment deleted successfully!');
    } catch (error) {
      const message = errorHandler.getUserFriendlyMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
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
              <CardTitle>Appointment Management</CardTitle>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => {
                      setSelectedAppointment(null);
                      setFormData({});
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-600"
                  >
                    <Plus className="size-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientId">Patient ID</Label>
                      <Input
                        id="patientId"
                        value={formData.patientId || ''}
                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                        placeholder="Enter patient ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctorId">Doctor ID</Label>
                      <Input
                        id="doctorId"
                        value={formData.doctorId || ''}
                        onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                        placeholder="Enter doctor ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointmentDate">Date</Label>
                      <Input
                        id="appointmentDate"
                        type="date"
                        value={formData.appointmentDate || ''}
                        onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointmentTime">Time</Label>
                      <Input
                        id="appointmentTime"
                        type="time"
                        value={formData.appointmentTime || ''}
                        onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="reason">Reason for Visit</Label>
                      <Input
                        id="reason"
                        value={formData.reason || ''}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Enter reason for appointment"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={selectedAppointment ? handleUpdate : handleAdd}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : selectedAppointment ? 'Update' : 'Schedule'} Appointment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  placeholder="Search appointments by patient, doctor, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 hover:shadow-md transition-all border border-purple-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl text-card-foreground">
                        <CalendarIcon className="size-6" />
                      </div>
                      <div className="grid grid-cols-5 gap-4 flex-1">
                        <div>
                          <p className="text-xs text-muted-foreground">Patient ID</p>
                          <p className="text-sm text-gray-900">{appointment.patientId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Doctor ID</p>
                          <p className="text-sm text-gray-900">{appointment.doctorId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Date & Time</p>
                          <p className="text-sm text-gray-900">{appointment.appointmentDate} {appointment.appointmentTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <span className={`inline-block px-2 py-1 rounded text-xs ${
                            appointment.status === 'scheduled' ? 'bg-blue-100 text-primary' :
                            appointment.status === 'completed' ? 'bg-green-100 text-primary' :
                            'bg-red-100 text-destructive'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Reason</p>
                          <p className="text-sm text-gray-900">{appointment.reason}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(appointment)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className="mt-3 ml-16">
                      <p className="text-xs text-muted-foreground">Notes:</p>
                      <p className="text-sm text-gray-900">{appointment.notes}</p>
                    </div>
                  )}
                </motion.div>
              ))}

              {filteredAppointments.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {loading ? 'Loading appointments...' : 'No appointments found'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}



