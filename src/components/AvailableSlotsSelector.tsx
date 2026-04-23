'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { appointmentsService } from '@/services/appointments.service';

interface AvailableSlot {
  time: string;
  available: boolean;
}

interface AvailableSlotsSelectorProps {
  doctorId: string;
  onSlotSelected?: (slot: string) => void;
}

export function AvailableSlotsSelector({
  doctorId,
  onSlotSelected,
}: AvailableSlotsSelectorProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
  }, [date, doctorId]);

  const fetchSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentsService.getAvailableSlots(doctorId, date);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        setSlots(response);
      } else if (response?.slots && Array.isArray(response.slots)) {
        setSlots(response.slots);
      } else if (response?.data && Array.isArray(response.data)) {
        setSlots(response.data);
      } else {
        setSlots([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available slots');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    onSlotSelected?.(slot);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const availableSlots = slots.filter(s => s.available);
  const bookedSlots = slots.filter(s => !s.available);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-900">Select Appointment Slot</h3>

      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-gray-600" />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="flex-1"
        />
      </div>

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

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader size={24} className="animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Available Slots</h4>
              <span className="text-sm text-gray-600">{availableSlots.length} available</span>
            </div>

            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availableSlots.map((slot, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSlotSelect(slot.time)}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      selectedSlot === slot.time
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <Clock size={16} />
                    <span className="text-sm font-medium">{formatTime(slot.time)}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
                No available slots for this date
              </div>
            )}
          </div>

          {bookedSlots.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Booked Slots</h4>
                <span className="text-sm text-gray-600">{bookedSlots.length} booked</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {bookedSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center gap-2 opacity-50"
                  >
                    <Clock size={16} />
                    <span className="text-sm font-medium">{formatTime(slot.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSlot && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700"
            >
              <CheckCircle size={18} />
              <span className="text-sm">
                Selected: {formatTime(selectedSlot)}
              </span>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
