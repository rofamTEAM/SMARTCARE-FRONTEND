'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface VoiceAgentProps {
  department?: string;
  userRole?: string;
  onTranscript?: (text: string, speaker: 'user' | 'agent') => void;
  onToolCall?: (toolName: string, args: Record<string, unknown>) => Promise<unknown>;
}

export function VoiceAgent({
  department = 'front-office',
  userRole = 'user',
  onTranscript,
  onToolCall,
}: VoiceAgentProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Deepgram connection
  const initializeDeepgram = async () => {
    try {
      const { apiClient } = await import('../services/apiClient');
      // Get temporary token from backend - backend will use httpOnly cookie for auth
      const data = await apiClient.get<any>('/voice-agent/token');
      return (data as any)?.data?.token || (data as any)?.token;
    } catch (error) {
      console.error('Failed to initialize Deepgram:', error);
      toast.error('Could not reach Deepgram — check server config');
      return null;
    }
  };

  // Start listening
  const startListening = async () => {
    try {
      setIsProcessing(true);

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        await processAudio();
      };

      mediaRecorder.start();
      setIsListening(true);
      setIsProcessing(false);
    } catch (error) {
      console.error('Microphone access denied:', error);
      toast.error('Microphone access denied');
      setIsProcessing(false);
    }
  };

  // Stop listening
  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Process audio
  const processAudio = async () => {
    try {
      setIsProcessing(true);

      if (audioChunksRef.current.length === 0) {
        toast.error('No audio recorded');
        setIsProcessing(false);
        return;
      }

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

      // Get Deepgram token
      const token = await initializeDeepgram();
      if (!token) {
        setIsProcessing(false);
        return;
      }

      // Send to Deepgram for transcription
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const deepgramResponse = await fetch(
        'https://api.deepgram.com/v1/listen?model=nova-2&language=en',
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
          },
          body: audioBlob,
        }
      );

      if (!deepgramResponse.ok) {
        throw new Error('Deepgram transcription failed');
      }

      const result = await deepgramResponse.json();
      const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript;

      if (transcript) {
        onTranscript?.(transcript, 'user');
        toast.success(`Transcribed: ${transcript}`);
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      toast.error('Failed to process audio');
    } finally {
      setIsProcessing(false);
      audioChunksRef.current = [];
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={isListening ? 'destructive' : 'outline'}
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className="gap-2"
      >
        {isListening ? (
          <>
            <MicOff className="size-4" />
            Stop
          </>
        ) : (
          <>
            <Mic className="size-4" />
            Voice
          </>
        )}
      </Button>
      {isProcessing && (
        <Volume2 className="size-4 animate-pulse text-primary" />
      )}
    </div>
  );
}
