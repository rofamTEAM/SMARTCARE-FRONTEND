'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Settings, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { AppointmentActionsPanel } from './AppointmentActionsPanel';
import { AvailableSlotsSelector } from './AvailableSlotsSelector';
import { PatientMovementPanel } from './PatientMovementPanel';
import { appointmentsService } from '@/services/appointments.service';

interface Appointment {
  id: string;
  patientName: string;
  doctorId: string;
  appointmentStatus: string;
  date: string;
  doctor: string;
}

interface AppointmentManagementHubProps {
  appointmentId?: string;
  doctorId?: string;
  onRefresh?: () => void;
}

export function AppointmentManagementHub({
  appointmentId,
  doctorId,
  onRefresh,
}: AppointmentManagementHubProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'actions' | 'slots' | 'movement'>('actions');

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId]);

  const fetchAppointment = async () => {
    if (!appointmentId) return;
    setLoading(true);
    try {
      const data = await appointmentsService.getById(appointmentId);
      setAppointment(data as any);
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionComplete = () => {
    fetchAppointment();
    onRefresh?.();
  };

  const tabs = [
    {
      id: 'actions',
      label: 'Actions',
      icon: Settings,
      description: 'Approve, cancel, or manage appointment',
    },
    {
      id: 'slots',
      label: 'Available Slots',
      icon: Calendar,
      description: 'View and select available time slots',
    },
    {
      id: 'movement',
      label: 'Patient Movement',
      icon: Users,
      description: 'Move patient between departments',
    },
  ];

  if (loading && !appointment) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Appointment Management</h2>
        {appointment && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-blue-100 text-sm">Patient</p>
              <p className="font-semibold">{appointment.patientName}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Doctor</p>
              <p className="font-semibold">{appointment.doctor}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Status</p>
              <p className="font-semibold">{appointment.appointmentStatus}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Date</p>
              <p className="font-semibold">
                {new Date(appointment.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {activeTab === 'actions' && appointment && (
          <AppointmentActionsPanel
            appointmentId={appointment.id}
            status={appointment.appointmentStatus}
            onActionComplete={handleActionComplete}
          />
        )}

        {activeTab === 'slots' && (doctorId || appointment?.doctorId) && (
          <AvailableSlotsSelector
            doctorId={doctorId || appointment?.doctorId || ''}
            onSlotSelected={(slot) => {
              console.log('Selected slot:', slot);
            }}
          />
        )}

        {activeTab === 'movement' && appointment && (
          <PatientMovementPanel
            appointmentId={appointment.id}
            patientName={appointment.patientName}
            currentStatus={appointment.appointmentStatus}
            onMovementComplete={handleActionComplete}
          />
        )}
      </motion.div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleActionComplete}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh
        </Button>
      </div>
    </motion.div>
  );
}
