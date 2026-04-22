'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseWebSocketOptions {
  userId?: number;
  role?: string;
  doctorId?: number;
  onAppointmentUpdate?: (data: any) => void;
  onPatientCreated?: (data: any) => void;
  onPatientUpdated?: (data: any) => void;
  onPatientDeleted?: (data: any) => void;
  onUserCreated?: (data: any) => void;
  enabled?: boolean;
}

export const useWebSocket = ({
  userId,
  role,
  doctorId,
  onAppointmentUpdate,
  onPatientCreated,
  onPatientUpdated,
  onPatientDeleted,
  onUserCreated,
  enabled = true
}: UseWebSocketOptions) => {
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket | null>(null);
  const isConnectedRef = useRef(false);
  const wsRetryCountRef = useRef(0);
  const wsMaxRetriesRef = useRef(3);

  // Get API base URL - same logic as apiClient
  const getApiBaseUrl = useCallback(() => {
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    }
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = 8000;
    return `${protocol}//${host}:${port}/api/v1`;
  }, []);

  // Polling with retry logic using apiClient
  const pollForUpdates = useCallback(async () => {
    if (!enabled || !userId) return;

    try {
      const { apiClient } = await import('../services/apiClient');
      
      // Poll for appointments
      if (role === 'doctor' && doctorId) {
        try {
          const appointmentData = await apiClient.get(`/appointments?doctorId=${doctorId}`);
          onAppointmentUpdate?.(appointmentData);
        } catch (error) {
          console.warn('⚠️ Failed to fetch doctor appointments:', error);
        }
      } else if (role === 'receptionist' || role === 'admin') {
        try {
          const appointmentData = await apiClient.get('/appointments');
          onAppointmentUpdate?.(appointmentData);
        } catch (error) {
          console.warn('⚠️ Failed to fetch appointments:', error);
        }
      }

      // Poll for patients
      try {
        const patientData = await apiClient.get('/patients');
        onPatientUpdated?.(patientData);
      } catch (error) {
        console.warn('⚠️ Failed to fetch patients:', error);
      }

      // Poll for users (for user creation updates)
      try {
        const userData = await apiClient.get('/users');
        onUserCreated?.(userData);
      } catch (error) {
        console.warn('⚠️ Failed to fetch users:', error);
      }
    } catch (error) {
      console.error('❌ Polling error:', error instanceof Error ? error.message : error);
    }
  }, [enabled, userId, role, doctorId, getApiBaseUrl, onAppointmentUpdate, onPatientUpdated, onUserCreated]);

  // WebSocket connection with retry logic
  const connectWebSocket = useCallback(() => {
    if (!enabled || !userId) return;
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      const wsUrl = `${protocol}//${host}:8000`;
      
      console.log('🔌 Attempting WebSocket connection to:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        isConnectedRef.current = true;
        wsRetryCountRef.current = 0;
        
        // Send subscription message
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'subscribe',
            userId,
            role,
            doctorId
          }));
          console.log('📢 Subscription message sent');
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', data.type);
          
          if (data.type === 'appointment_update') {
            onAppointmentUpdate?.(data.payload);
          } else if (data.type === 'patient_created') {
            onPatientCreated?.(data.payload);
          } else if (data.type === 'patient_updated') {
            onPatientUpdated?.(data.payload);
          } else if (data.type === 'patient_deleted') {
            onPatientDeleted?.(data.payload);
          } else if (data.type === 'user_created') {
            onUserCreated?.(data.payload);
          }
        } catch (error) {
          console.error('❌ WebSocket message parse error:', error);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        isConnectedRef.current = false;
      };
      
      wsRef.current.onclose = () => {
        console.log('❌ WebSocket disconnected');
        isConnectedRef.current = false;
        wsRef.current = null;
        
        // Attempt to reconnect with exponential backoff
        if (wsRetryCountRef.current < wsMaxRetriesRef.current) {
          wsRetryCountRef.current++;
          const delay = Math.pow(2, wsRetryCountRef.current) * 1000;
          console.log(`🔄 Reconnecting WebSocket in ${delay}ms (attempt ${wsRetryCountRef.current}/${wsMaxRetriesRef.current})`);
          setTimeout(connectWebSocket, delay);
        } else {
          console.log('⚠️ WebSocket max retries reached, falling back to polling only');
        }
      };
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      isConnectedRef.current = false;
    }
  }, [enabled, userId, role, doctorId, onAppointmentUpdate, onPatientCreated, onPatientUpdated, onPatientDeleted, onUserCreated]);

  const connect = useCallback(() => {
    if (!enabled) return;
    
    console.log('🚀 Starting real-time updates (WebSocket + Polling)');
    
    // Try WebSocket first
    connectWebSocket();
    
    // Always start polling as fallback (every 5 seconds)
    console.log('📊 Starting polling fallback (every 5 seconds)');
    pollForUpdates(); // Initial poll
    pollingIntervalRef.current = setInterval(pollForUpdates, 5000);
  }, [enabled, connectWebSocket, pollForUpdates]);

  const disconnect = useCallback(() => {
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = undefined;
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    isConnectedRef.current = false;
    console.log('❌ Real-time updates stopped');
  }, []);

  const subscribeToAppointment = useCallback((appointmentId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe:appointment',
        appointmentId
      }));
      console.log('📢 Subscribed to appointment:', appointmentId);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    socket: wsRef.current,
    connect,
    disconnect,
    subscribeToAppointment,
    isConnected: isConnectedRef.current
  };
};
