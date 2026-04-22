'use client';

import React, { useState, useEffect } from 'react';
import { patientFlowService, PatientFlow, PatientOrder } from '@/services/patientFlow.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const DoctorPatientManagement: React.FC = () => {
  const [patientFlow, setPatientFlow] = useState<PatientFlow | null>(null);
  const [orders, setOrders] = useState<PatientOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPatientId, setSearchPatientId] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({
    orderType: 'Lab',
    orderDescription: '',
    expectedResultDate: ''
  });

  const orderTypes = ['Lab', 'Imaging', 'Medication', 'Procedure'];

  // Fetch patient flow
  const handleFetchPatient = async () => {
    if (!searchPatientId) return;

    setLoading(true);
    try {
      const flow = await patientFlowService.getFlowByPatientId(parseInt(searchPatientId));
      setPatientFlow(flow);

      const patientOrders = await patientFlowService.getOrders(flow.id);
      setOrders(patientOrders);
    } catch (error) {
      console.error('Error fetching patient:', error);
      alert('Patient not found');
    } finally {
      setLoading(false);
    }
  };

  // Issue order
  const handleIssueOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientFlow) return;

    setLoading(true);
    try {
      const newOrder = await patientFlowService.issueOrder(
        patientFlow.id,
        orderData.orderType,
        orderData.orderDescription,
        orderData.expectedResultDate
      );

      setOrders([...orders, newOrder]);
      setOrderData({ orderType: 'Lab', orderDescription: '', expectedResultDate: '' });
      setShowOrderForm(false);
      alert('Order issued successfully');
    } catch (error) {
      console.error('Error issuing order:', error);
      alert('Error issuing order');
    } finally {
      setLoading(false);
    }
  };

  // Update order result
  const handleUpdateResult = async (orderId: number, resultStatus: string) => {
    setLoading(true);
    try {
      const resultNotes = prompt('Enter result notes:');
      if (resultNotes === null) return;

      await patientFlowService.updateOrderResult(orderId, resultStatus, resultNotes);

      // Refresh orders
      if (patientFlow) {
        const updatedOrders = await patientFlowService.getOrders(patientFlow.id);
        setOrders(updatedOrders);
      }

      alert('Order result updated');
    } catch (error) {
      console.error('Error updating result:', error);
      alert('Error updating result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Search Patient */}
      <Card>
        <CardHeader>
          <CardTitle>Find Patient</CardTitle>
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
                <span className="font-semibold">Current Status:</span>
                <p>{patientFlow.currentStatus}</p>
              </div>
              <div>
                <span className="font-semibold">Triage Level:</span>
                <p className={`font-bold ${
                  patientFlow.triageLevel === 'Emergency' ? 'text-red-600' :
                  patientFlow.triageLevel === 'Urgent' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {patientFlow.triageLevel}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Issue Order */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Order</CardTitle>
            </CardHeader>
            <CardContent>
              {!showOrderForm ? (
                <Button onClick={() => setShowOrderForm(true)} className="w-full">
                  Issue New Order
                </Button>
              ) : (
                <form onSubmit={handleIssueOrder} className="space-y-3">
                  <select
                    value={orderData.orderType}
                    onChange={(e) => setOrderData({ ...orderData, orderType: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    {orderTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Order Description"
                    value={orderData.orderDescription}
                    onChange={(e) => setOrderData({ ...orderData, orderDescription: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={3}
                    required
                  />
                  <Input
                    type="datetime-local"
                    value={orderData.expectedResultDate}
                    onChange={(e) => setOrderData({ ...orderData, expectedResultDate: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="flex-1">
                      Issue Order
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowOrderForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders issued yet</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{order.orderType}</p>
                          <p className="text-sm text-gray-600">{order.orderDescription}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.resultStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          order.resultStatus === 'critical' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.resultStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Issued: {new Date(order.issuedAt).toLocaleString()}
                      </p>
                      {order.resultNotes && (
                        <p className="text-sm bg-blue-50 p-2 rounded">{order.resultNotes}</p>
                      )}
                      {order.resultStatus === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateResult(order.id, 'completed')}
                            disabled={loading}
                          >
                            Mark Completed
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateResult(order.id, 'critical')}
                            disabled={loading}
                          >
                            Mark Critical
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DoctorPatientManagement;
