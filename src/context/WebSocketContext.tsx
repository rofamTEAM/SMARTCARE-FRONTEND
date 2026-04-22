'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface WebSocketContextType {
  isConnected: boolean;
  subscribeToAppointment: (appointmentId: number) => void;
  onAppointmentUpdate: (callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
  userId?: number;
  role?: string;
  doctorId?: number;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  userId,
  role,
  doctorId
}) => {
  const [appointmentUpdateCallbacks, setAppointmentUpdateCallbacks] = useState<
    Array<(data: any) => void>
  >([]);

  const handleAppointmentUpdate = useCallback((data: any) => {
    appointmentUpdateCallbacks.forEach(callback => callback(data));
  }, [appointmentUpdateCallbacks]);

  const { subscribeToAppointment, isConnected } = useWebSocket({
    userId,
    role,
    doctorId,
    onAppointmentUpdate: handleAppointmentUpdate,
    enabled: !!userId && !!role
  });

  const registerAppointmentUpdateCallback = useCallback((callback: (data: any) => void) => {
    setAppointmentUpdateCallbacks(prev => [...prev, callback]);
    return () => {
      setAppointmentUpdateCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    subscribeToAppointment,
    onAppointmentUpdate: registerAppointmentUpdateCallback
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};
