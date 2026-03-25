'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Stethoscope,
  CheckCircle,
  ChevronRight,
  Phone,
  MapPin,
  Star,
  Plus,
  X,
  AlertCircle,
  User,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GlassCard } from './ui/glass-card';

interface UserDashboardProps {
  session: any;
}

const DEPARTMENTS = [
  'General Medicine', 'Cardiology', 'Dermatology', 'Orthopedics',
  'Pediatrics', 'Gynecology', 'Neurology', 'Ophthalmology', 'ENT', 'Dentistry',
];

const DOCTORS: Record<string, { name: string; rating: number; experience: string }[]> = {
  'General Medicine': [
    { name: 'Dr. James Mwangi', rating: 4.9, experience: '12 yrs' },
    { name: 'Dr. Amina Hassan', rating: 4.7, experience: '8 yrs' },
  ],
  Cardiology: [
    { name: 'Dr. Peter Ochieng', rating: 4.8, experience: '15 yrs' },
    { name: 'Dr. Grace Wanjiku', rating: 4.6, experience: '10 yrs' },
  ],
  Dermatology: [{ name: 'Dr. Sarah Kamau', rating: 4.9, experience: '9 yrs' }],
  Orthopedics: [{ name: 'Dr. David Njoroge', rating: 4.7, experience: '14 yrs' }],
  Pediatrics: [
    { name: 'Dr. Lucy Achieng', rating: 4.9, experience: '11 yrs' },
    { name: 'Dr. Mark Otieno', rating: 4.8, experience: '7 yrs' },
  ],
  Gynecology: [{ name: 'Dr. Faith Mutua', rating: 4.9, experience: '13 yrs' }],
  Neurology: [{ name: 'Dr. Brian Kipchoge', rating: 4.8, experience: '16 yrs' }],
  Ophthalmology: [{ name: "Dr. Rose Ndung'u", rating: 4.7, experience: '10 yrs' }],
  ENT: [{ name: 'Dr. Samuel Karanja', rating: 4.6, experience: '8 yrs' }],
  Dentistry: [{ name: 'Dr. Cynthia Waweru', rating: 4.8, experience: '9 yrs' }],
};

const TIME_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM',
];

type Step = 'department' | 'doctor' | 'datetime' | 'confirm' | 'success';

interface Booking {
  dept: string;
  doctor: string;
  date: string;
  time: string;
  reason: string;
}

export function UserDashboard({ session }: UserDashboardProps) {
  const userName = session?.user?.user_metadata?.name || session?.user?.email?.split('@')[0] || 'there';

  const [step, setStep] = useState<Step>('department');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleBook = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setBookings((prev) => [...prev, { dept: selectedDept, doctor: selectedDoctor, date: selectedDate, time: selectedTime, reason }]);
    setStep('success');
    setSubmitting(false);
  };

  const resetBooking = () => {
    setStep('department');
    setSelectedDept('');
    setSelectedDoctor('');
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
  };

  const stepLabels = ['Department', 'Doctor', 'Date & Time', 'Confirm'];
  const stepIndex: Record<Step, number> = { department: 0, doctor: 1, datetime: 2, confirm: 3, success: 4 };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hello, {userName} 👋</h1>
              <p className="text-sm text-muted-foreground mt-1">Book an appointment with our specialists</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Phone className="size-4 text-primary" />
                <span>Emergency: 0800-CARE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4 text-primary" />
                <span>Main Campus</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Stethoscope, label: 'Specialists', value: '50+', color: 'text-primary' },
          { icon: Clock, label: 'Avg Wait', value: '15 min', color: 'text-primary' },
          { icon: Calendar, label: 'My Bookings', value: String(bookings.length), color: 'text-primary' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard className="p-4 text-center hover:bg-card/75 transition-all">
              <item.icon className={`size-6 mx-auto mb-2 ${item.color}`} />
              <p className="text-xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Booking wizard */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <GlassCard className="overflow-hidden">
          {/* Progress bar */}
          {step !== 'success' && (
            <div className="px-6 pt-6 pb-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                {stepLabels.map((label, i) => (
                  <div key={label} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all flex-shrink-0 ${
                      i < stepIndex[step]
                        ? 'bg-primary text-primary-foreground'
                        : i === stepIndex[step]
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {i < stepIndex[step] ? <CheckCircle className="size-4" /> : i + 1}
                    </div>
                    <span className={`text-xs hidden sm:block ${i === stepIndex[step] ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                    {i < stepLabels.length - 1 && (
                      <div className={`flex-1 h-0.5 rounded ${i < stepIndex[step] ? 'bg-primary' : 'bg-border'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-6">
            {/* Step 1 — Department */}
            {step === 'department' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-semibold text-foreground mb-4">Select Department</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => { setSelectedDept(dept); setStep('doctor'); }}
                      className="p-3 rounded-xl border border-border bg-card/40 backdrop-blur-sm text-sm text-left text-foreground hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2 — Doctor */}
            {step === 'doctor' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setStep('department')} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="size-4" />
                  </button>
                  <h2 className="text-lg font-semibold text-foreground">{selectedDept} — Choose Doctor</h2>
                </div>
                <div className="space-y-3">
                  {(DOCTORS[selectedDept] || []).map((doc) => (
                    <button
                      key={doc.name}
                      onClick={() => { setSelectedDoctor(doc.name); setStep('datetime'); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card/40 backdrop-blur-sm hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                        {doc.name.split(' ')[1]?.[0] ?? 'D'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedDept} · {doc.experience}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="size-4 fill-amber-400" />
                        <span className="text-sm font-medium">{doc.rating}</span>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3 — Date & Time */}
            {step === 'datetime' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setStep('doctor')} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="size-4" />
                  </button>
                  <h2 className="text-lg font-semibold text-foreground">Pick Date & Time</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Date</Label>
                    <Input
                      type="date"
                      min={minDate}
                      max={maxDate}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-card/40 backdrop-blur-sm"
                    />
                  </div>
                  {selectedDate && (
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">Available Slots</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                              selectedTime === slot
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card/40 backdrop-blur-sm border-border text-foreground hover:border-primary'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">Reason for visit (optional)</Label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Briefly describe your symptoms or reason..."
                      rows={3}
                      className="w-full rounded-xl border border-border bg-card/40 backdrop-blur-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <Button
                    onClick={() => setStep('confirm')}
                    disabled={!selectedDate || !selectedTime}
                    className="w-full"
                  >
                    Continue <ChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4 — Confirm */}
            {step === 'confirm' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-semibold text-foreground mb-4">Confirm Appointment</h2>
                <GlassCard className="p-5 space-y-3 mb-6">
                  {[
                    { icon: Stethoscope, label: 'Department', value: selectedDept },
                    { icon: User, label: 'Doctor', value: selectedDoctor },
                    { icon: Calendar, label: 'Date', value: new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                    { icon: Clock, label: 'Time', value: selectedTime },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <row.icon className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{row.label}</p>
                        <p className="text-sm font-medium text-foreground">{row.value}</p>
                      </div>
                    </div>
                  ))}
                  {reason && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertCircle className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reason</p>
                        <p className="text-sm text-foreground">{reason}</p>
                      </div>
                    </div>
                  )}
                </GlassCard>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('datetime')} className="flex-1">Back</Button>
                  <Button onClick={handleBook} disabled={submitting} className="flex-1">
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 5 — Success */}
            {step === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="size-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Appointment Booked!</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Your appointment with <span className="font-medium text-foreground">{selectedDoctor}</span> on{' '}
                  <span className="font-medium text-foreground">
                    {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>{' '}
                  at <span className="font-medium text-foreground">{selectedTime}</span> is confirmed.
                </p>
                <Button onClick={resetBooking}>
                  <Plus className="size-4 mr-2" /> Book Another
                </Button>
              </motion.div>
            )}
          </div>
        </GlassCard>
      </motion.div>

      {/* My Appointments */}
      {bookings.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">My Appointments</h3>
            <div className="space-y-3">
              {bookings.map((b, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-card/40 backdrop-blur-sm rounded-xl border border-border">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                    {b.doctor.split(' ')[1]?.[0] ?? 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{b.doctor}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.dept} · {new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {b.time}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full flex-shrink-0">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
