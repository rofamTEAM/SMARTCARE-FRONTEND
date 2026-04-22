'use client';

import React, { useState } from 'react';
import { patientFlowService, PatientFlow, DischargeSummary } from '@/services/patientFlow.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const DischargeManagement: React.FC = () => {
  const [patientFlow, setPatientFlow] = useState<PatientFlow | null>(null);
  const [dischargeSummary, setDischargeSummary] = useState<DischargeSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchPatientId, setSearchPatientId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    finalDiagnosis: '',
    treatmentProvided: '',
    medications: '',
    followUpInstructions: '',
    warningSignsEducation: '',
    nextAppointmentDate: '',
    nextAppointmentDept: '',
    billStatus: 'Settled',
    outstandingBalance: ''
  });

  // Fetch patient flow
  const handleFetchPatient = async () => {
    if (!searchPatientId) return;

    setLoading(true);
    try {
      const flow = await patientFlowService.getFlowByPatientId(parseInt(searchPatientId));
      setPatientFlow(flow);

      // Try to fetch existing discharge summary
      try {
        const summary = await patientFlowService.getDischargeSummary(flow.id);
        setDischargeSummary(summary);
      } catch {
        // No discharge summary yet
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      alert('Patient not found');
    } finally {
      setLoading(false);
    }
  };

  // Create discharge summary
  const handleCreateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientFlow) return;

    setLoading(true);
    try {
      const summary = await patientFlowService.createDischargeSummary(
        patientFlow.id,
        formData
      );

      setDischargeSummary(summary);
      setShowForm(false);
      alert('Patient discharged successfully');
    } catch (error) {
      console.error('Error creating discharge summary:', error);
      alert('Error creating discharge summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Search Patient */}
      <Card>
        <CardHeader>
          <CardTitle>Find Patient for Discharge</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Enter Patient ID"
            value={searchPatientId}
            onChange={(e) => setSearchPatientId(e.target.value)}
          />
          <Button onClick={handleFetchPatient} disabled={loading}>
            Search
          </Button>
        </CardContent>
      </Card>

      {patientFlow && (
        <div className="space-y-4">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold">Patient ID:</span>
                <p>{patientFlow.patientId}</p>
              </div>
              <div>
                <span className="font-semibold">Visit Type:</span>
                <p>{patientFlow.visitType}</p>
              </div>
              <div>
                <span className="font-semibold">Check-in:</span>
                <p>{new Date(patientFlow.checkInTime).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-semibold">Status:</span>
                <p className={patientFlow.discharged ? 'text-green-600 font-bold' : 'text-blue-600'}>
                  {patientFlow.discharged ? 'Discharged' : 'Active'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Discharge Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Discharge Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="billing" defaultChecked />
                  <label htmlFor="billing">Billing clearance verified</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="medications" defaultChecked />
                  <label htmlFor="medications">Medications dispensed</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="reports" defaultChecked />
                  <label htmlFor="reports">Lab/Imaging reports provided</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="instructions" defaultChecked />
                  <label htmlFor="instructions">Follow-up instructions given</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="warnings" defaultChecked />
                  <label htmlFor="warnings">Warning signs explained</label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discharge Summary */}
          {!dischargeSummary ? (
            <Card>
              <CardHeader>
                <CardTitle>Create Discharge Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {!showForm ? (
                  <Button onClick={() => setShowForm(true)} className="w-full">
                    Create Discharge Summary
                  </Button>
                ) : (
                  <form onSubmit={handleCreateSummary} className="space-y-3">
                    <textarea
                      placeholder="Final Diagnosis"
                      value={formData.finalDiagnosis}
                      onChange={(e) => setFormData({ ...formData, finalDiagnosis: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                      rows={2}
                      required
                    />
                    <textarea
                      placeholder="Treatment Provided"
                      value={formData.treatmentProvided}
                      onChange={(e) => setFormData({ ...formData, treatmentProvided: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                      rows={2}
                      required
                    />
                    <textarea
                      placeholder="Medications (list all prescribed medicines)"
                      value={formData.medications}
                      onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                      rows={2}
                      required
                    />
                    <textarea
                      placeholder="Follow-up Instructions"
                      value={formData.followUpInstructions}
                      onChange={(e) => setFormData({ ...formData, followUpInstructions: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                      rows={2}
                      required
                    />
                    <textarea
                      placeholder="Warning Signs Education"
                      value={formData.warningSignsEducation}
                      onChange={(e) => setFormData({ ...formData, warningSignsEducation: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                      rows={2}
                    />
                    <Input
                      type="datetime-local"
                      placeholder="Next Appointment Date"
                      value={formData.nextAppointmentDate}
                      onChange={(e) => setFormData({ ...formData, nextAppointmentDate: e.target.value })}
                    />
                    <Input
                      placeholder="Next Appointment Department"
                      value={formData.nextAppointmentDept}
                      onChange={(e) => setFormData({ ...formData, nextAppointmentDept: e.target.value })}
                    />
                    <select
                      value={formData.billStatus}
                      onChange={(e) => setFormData({ ...formData, billStatus: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="Settled">Bill Settled</option>
                      <option value="Pending">Bill Pending</option>
                      <option value="Conditional">Conditional Discharge</option>
                    </select>
                    {formData.billStatus !== 'Settled' && (
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Outstanding Balance"
                        value={formData.outstandingBalance}
                        onChange={(e) => setFormData({ ...formData, outstandingBalance: e.target.value })}
                      />
                    )}
                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading} className="flex-1">
                        Discharge Patient
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-green-500">
              <CardHeader>
                <CardTitle className="text-green-600">Discharge Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold">Final Diagnosis:</span>
                  <p>{dischargeSummary.finalDiagnosis}</p>
                </div>
                <div>
                  <span className="font-semibold">Treatment Provided:</span>
                  <p>{dischargeSummary.treatmentProvided}</p>
                </div>
                <div>
                  <span className="font-semibold">Medications:</span>
                  <p>{dischargeSummary.medications}</p>
                </div>
                <div>
                  <span className="font-semibold">Follow-up Instructions:</span>
                  <p>{dischargeSummary.followUpInstructions}</p>
                </div>
                {dischargeSummary.nextAppointmentDate && (
                  <div>
                    <span className="font-semibold">Next Appointment:</span>
                    <p>
                      {new Date(dischargeSummary.nextAppointmentDate).toLocaleDateString()}
                      {dischargeSummary.nextAppointmentDept && ` - ${dischargeSummary.nextAppointmentDept}`}
                    </p>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Bill Status:</span>
                  <p className={`font-bold ${
                    dischargeSummary.billStatus === 'Settled' ? 'text-green-600' :
                    dischargeSummary.billStatus === 'Pending' ? 'text-yellow-600' :
                    'text-orange-600'
                  }`}>
                    {dischargeSummary.billStatus}
                  </p>
                </div>
                {dischargeSummary.outstandingBalance && (
                  <div>
                    <span className="font-semibold">Outstanding Balance:</span>
                    <p className="text-red-600 font-bold">${dischargeSummary.outstandingBalance}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DischargeManagement;
