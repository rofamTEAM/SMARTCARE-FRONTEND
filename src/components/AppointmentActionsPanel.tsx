'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { Button } from './ui/button';
import { appointmentsService } from '@/services/appointments.service';

interface AppointmentActionsPanelProps {
  appointmentId: string;
  status: string;
  onActionComplete?: () => void;
}

export function AppointmentActionsPanel({
  appointmentId,
  status,
  onActionComplete,
}: AppointmentActionsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await appointmentsService.approve(appointmentId);
      setSuccess('Appointment approved successfully');
      onActionComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      await appointmentsService.cancel(appointmentId);
      setSuccess('Appointment cancelled successfully');
      onActionComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToOPD = async () => {
    setLoading(true);
    setError(null);
    try {
      await appointmentsService.moveToOPD(appointmentId);
      setSuccess('Patient moved to OPD successfully');
      onActionComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move to OPD');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToIPD = async () => {
    setLoading(true);
    setError(null);
    try {
      await appointmentsService.moveToIPD(appointmentId);
      setSuccess('Patient moved to IPD successfully');
      onActionComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move to IPD');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-900">Appointment Actions</h3>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700"
        >
          <CheckCircle size={18} />
          <span className="text-sm">{success}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {status !== 'Approved' && (
          <Button
            onClick={handleApprove}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            Approve
          </Button>
        )}

        {status !== 'Cancelled' && (
          <Button
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : <XCircle size={18} />}
            Cancel
          </Button>
        )}

        <Button
          onClick={handleMoveToOPD}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          Move to OPD
        </Button>

        <Button
          onClick={handleMoveToIPD}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          Move to IPD
        </Button>
      </div>
    </motion.div>
  );
}
