'use client';

import React, { useState, useEffect } from 'react';
import { patientFlowService, PatientFlow, PatientVitals } from '@/services/patientFlow.service';
import { patientsService } from '@/services/patients.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PatientCard {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  visitType: string;
  triageLevel: string;
  currentDept: string;
  status: string;
  checkInTime: string;
  nextStep: string;
}

export const PatientFlowManagement: React.FC = () => {
  const [patientFlow, setPatientFlow] = useState<PatientFlow | null>(null);
  const [patientCard, setPatientCard] = useState<PatientCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchPatientId, setSearchPatientId] = useState('');
  const [vitals, setVitals] = useState<PatientVitals>({});
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [transitionReason, setTransitionReason] = useState('');
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [showTransitionForm, setShowTransitionForm] = useState(false);

  const departments = [
    'Reception',
    'Billing & Insurance',
    'Nursing Station',
    'Doctor/Consultation',
    'Laboratory',
    'Radiology',
    'Pharmacy',
    'Discharge'
  ];

  const triageLevels = ['Emergency', 'Urgent', 'Routine'];
  const visitTypes = ['OPD', 'IPD', 'Emergency'];

  // Initialize patient flow on reception
  const handleInitializeFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const patientId = parseInt(searchPatientId);
      const patient = await patientsService.getById(searchPatientId);

      const flowData = {
        patientId,
        visitType: (document.getElementById('visitType') as HTMLSelectElement)?.value as any,
        triageLevel: (document.getElementById('triageLevel') as HTMLSelectElement)?.value as any,
        temperature: vitals.temperature,
        bloodPressure: vitals.bloodPressure,
        pulse: vitals.pulse,
        weight: vitals.weight,
        height: vitals.height
      };

      const flow = await patientFlowService.initializeFlow(flowData);
      setPatientFlow(flow);

      // Create patient card
      setPatientCard({
        id: flow.id.toString(),
        patientId: flow.patientId.toString(),
        name: patient.firstName + ' ' + patient.lastName,
        age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
        gender: patient.gender,
        visitType: flow.visitType,
        triageLevel: flow.triageLevel,
        currentDept: flow.currentDepartment,
        status: flow.currentStatus,
        checkInTime: new Date(flow.checkInTime).toLocaleTimeString(),
        nextStep: 'Awaiting Triage'
      });

      setSearchPatientId('');
      setVitals({});
    } catch (error) {
      console.error('Error initializing flow:', error);
      alert('Error initializing patient flow');
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient flow
  const handleFetchFlow = async () => {
    if (!searchPatientId) return;

    setLoading(true);
    try {
      const flow = await patientFlowService.getFlowByPatientId(parseInt(searchPatientId));
      setPatientFlow(flow);

      const patient = await patientsService.getById(searchPatientId);
      setPatientCard({
        id: flow.id.toString(),
        patientId: flow.patientId.toString(),
        name: patient.firstName + ' ' + patient.lastName,
        age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
        gender: patient.gender,
        visitType: flow.visitType,
        triageLevel: flow.triageLevel,
        currentDept: flow.currentDepartment,
        status: flow.currentStatus,
        checkInTime: new Date(flow.checkInTime).toLocaleTimeString(),
        nextStep: getNextStep(flow.currentDepartment)
      });
    } catch (error) {
      console.error('Error fetching flow:', error);
      alert('Patient flow not found');
    } finally {
      setLoading(false);
    }
  };

  // Get next step based on current department
  const getNextStep = (currentDept: string): string => {
    const flowMap: Record<string, string> = {
      'Reception': 'Billing & Insurance',
      'Billing & Insurance': 'Doctor/Consultation',
      'Doctor/Consultation': 'Laboratory',
      'Laboratory': 'Doctor/Consultation',
      'Radiology': 'Doctor/Consultation',
      'Pharmacy': 'Discharge',
      'Discharge': 'Completed'
    };
    return flowMap[currentDept] || 'Next Step';
  };

  // Record vitals
  const handleRecordVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientFlow) return;

    setLoading(true);
    try {
      await patientFlowService.recordVitals(patientFlow.id, vitals);
      alert('Vitals recorded successfully');
      setShowVitalsForm(false);
      setVitals({});
    } catch (error) {
      console.error('Error recording vitals:', error);
      alert('Error recording vitals');
    } finally {
      setLoading(false);
    }
  };

  // Transition patient
  const handleTransitionPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientFlow || !selectedDepartment) return;

    setLoading(true);
    try {
      await patientFlowService.transitionPatient(
        patientFlow.id,
        selectedDepartment,
        transitionReason
      );

      // Update patient flow
      const updatedFlow = await patientFlowService.getFlow(patientFlow.id);
      setPatientFlow(updatedFlow);

      if (patientCard) {
        setPatientCard({
          ...patientCard,
          currentDept: updatedFlow.currentDepartment,
          status: updatedFlow.currentStatus,
          nextStep: getNextStep(updatedFlow.currentDepartment)
        });
      }

      alert('Patient transitioned successfully');
      setShowTransitionForm(false);
      setSelectedDepartment('');
      setTransitionReason('');
    } catch (error) {
      console.error('Error transitioning patient:', error);
      alert('Error transitioning patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search and Initialize */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Search & Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Patient ID"
                value={searchPatientId}
                onChange={(e) => setSearchPatientId(e.target.value)}
              />
              <Button onClick={handleFetchFlow} disabled={loading}>
                Search
              </Button>
            </div>

            {!patientFlow && (
              <form onSubmit={handleInitializeFlow} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Visit Type</label>
                  <select
                    id="visitType"
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    {visitTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Triage Level</label>
                  <select
                    id="triageLevel"
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    {triageLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !searchPatientId}
                  className="w-full"
                >
                  Initialize Patient Flow
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Patient Card */}
        {patientCard && (
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-lg">Patient Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold">Patient ID:</span>
                  <p>{patientCard.patientId}</p>
                </div>
                <div>
                  <span className="font-semibold">Name:</span>
                  <p>{patientCard.name}</p>
                </div>
                <div>
                  <span className="font-semibold">Age/Gender:</span>
                  <p>{patientCard.age} / {patientCard.gender}</p>
                </div>
                <div>
                  <span className="font-semibold">Check-in:</span>
                  <p>{patientCard.checkInTime}</p>
                </div>
                <div>
                  <span className="font-semibold">Visit Type:</span>
                  <p>{patientCard.visitType}</p>
                </div>
                <div>
                  <span className="font-semibold">Triage:</span>
                  <p className={`font-bold ${
                    patientCard.triageLevel === 'Emergency' ? 'text-red-600' :
                    patientCard.triageLevel === 'Urgent' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {patientCard.triageLevel}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">Current Dept:</span>
                  <p>{patientCard.currentDept}</p>
                </div>
                <div>
                  <span className="font-semibold">Status:</span>
                  <p>{patientCard.status}</p>
                </div>
                <div>
                  <span className="font-semibold">Next Step:</span>
                  <p className="text-blue-600 font-semibold">{patientCard.nextStep}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      {patientFlow && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Record Vitals */}
          <Card>
            <CardHeader>
              <CardTitle>Record Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              {!showVitalsForm ? (
                <Button
                  onClick={() => setShowVitalsForm(true)}
                  className="w-full"
                >
                  Record Vitals
                </Button>
              ) : (
                <form onSubmit={handleRecordVitals} className="space-y-3">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Temperature (°C)"
                    value={vitals.temperature || ''}
                    onChange={(e) => setVitals({ ...vitals, temperature: parseFloat(e.target.value) })}
                  />
                  <Input
                    placeholder="Blood Pressure (e.g., 120/80)"
                    value={vitals.bloodPressure || ''}
                    onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Pulse (bpm)"
                    value={vitals.pulse || ''}
                    onChange={(e) => setVitals({ ...vitals, pulse: parseInt(e.target.value) })}
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Weight (kg)"
                    value={vitals.weight || ''}
                    onChange={(e) => setVitals({ ...vitals, weight: parseFloat(e.target.value) })}
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Height (cm)"
                    value={vitals.height || ''}
                    onChange={(e) => setVitals({ ...vitals, height: parseFloat(e.target.value) })}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="flex-1">
                      Save Vitals
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowVitalsForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Transition Patient */}
          <Card>
            <CardHeader>
              <CardTitle>Forward Patient</CardTitle>
            </CardHeader>
            <CardContent>
              {!showTransitionForm ? (
                <Button
                  onClick={() => setShowTransitionForm(true)}
                  className="w-full"
                >
                  Forward to Next Department
                </Button>
              ) : (
                <form onSubmit={handleTransitionPatient} className="space-y-3">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments
                      .filter((d) => d !== patientFlow.currentDepartment)
                      .map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                  </select>
                  <textarea
                    placeholder="Transition Reason/Notes"
                    value={transitionReason}
                    onChange={(e) => setTransitionReason(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="flex-1">
                      Forward Patient
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTransitionForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PatientFlowManagement;
