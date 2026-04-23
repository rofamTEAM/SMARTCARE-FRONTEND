'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightCircle,
  Bed,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Loader,
  Info,
} from 'lucide-react';
import { Button } from './ui/button';
import { appointmentsService } from '@/services/appointments.service';

interface PatientMovementPanelProps {
  appointmentId: string;
  patientName: string;
  currentStatus: string;
  onMovementComplete?: () => void;
}

export function PatientMovementPanel({
  appointmentId,
  patientName,
  currentStatus,
  onMovementComplete,
}: PatientMovementPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleMoveToOPD = async () => {
    setLoading(true);
    setError(null);
    setSelectedAction('opd');
    try {
      await appointmentsService.moveToOPD(appointmentId);
      setSuccess(`${patientName} has been moved to OPD successfully`);
      setTimeout(() => onMovementComplete?.(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move patient to OPD');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveToIPD = async () => {
    setLoading(true);
    setError(null);
    setSelectedAction('ipd');
    try {
      await appointmentsService.moveToIPD(appointmentId);
      setSuccess(`${patientName} has been moved to IPD successfully`);
      setTimeout(() => onMovementComplete?.(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move patient to IPD');
    } finally {
      setLoading(false);
    }
  };

  const movements = [
    {
      id: 'opd',
      title: 'Move to OPD',
      description: 'Outpatient Department',
      icon: Stethoscope,
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
      textColor: 'text-blue-700',
      action: handleMoveToOPD,
      disabled: currentStatus === 'OPD',
    },
    {
      id: 'ipd',
      title: 'Move to IPD',
      description: 'Inpatient Department',
      icon: Bed,
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
      textColor: 'text-purple-700',
      action: handleMoveToIPD,
      disabled: currentStatus === 'IPD',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 space-y-4"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Patient Movement</h3>
        <p className="text-sm text-gray-600">
          Move {patientName} between departments
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Success</p>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </motion.div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Current Status: {currentStatus}</p>
          <p className="mt-1">Select a department to move the patient</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {movements.map((movement) => {
          const Icon = movement.icon;
          const isSelected = selectedAction === movement.id;
          const isLoading = loading && isSelected;

          return (
            <motion.button
              key={movement.id}
              whileHover={!movement.disabled ? { scale: 1.02 } : {}}
              whileTap={!movement.disabled ? { scale: 0.98 } : {}}
              onClick={movement.action}
              disabled={movement.disabled || loading}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                movement.color
              } ${movement.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Icon size={24} className={movement.textColor} />
                  <div>
                    <h4 className={`font-semibold ${movement.textColor}`}>
                      {movement.title}
                    </h4>
                    <p className={`text-sm ${movement.textColor} opacity-75`}>
                      {movement.description}
                    </p>
                  </div>
                </div>
                {isLoading ? (
                  <Loader size={20} className={`${movement.textColor} animate-spin`} />
                ) : (
                  <ArrowRightCircle size={20} className={movement.textColor} />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="pt-4 border-t space-y-2">
        <h4 className="font-medium text-gray-900 text-sm">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleMoveToOPD}
            disabled={loading || currentStatus === 'OPD'}
          >
            {loading && selectedAction === 'opd' ? (
              <Loader size={14} className="animate-spin mr-1" />
            ) : null}
            OPD
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleMoveToIPD}
            disabled={loading || currentStatus === 'IPD'}
          >
            {loading && selectedAction === 'ipd' ? (
              <Loader size={14} className="animate-spin mr-1" />
            ) : null}
            IPD
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
