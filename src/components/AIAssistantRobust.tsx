import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Mic, X, Minimize2, Maximize2, Sparkles, Brain, Stethoscope } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

interface AIAssistantProps {
  currentPage?: string;
  userRole?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function AIAssistant({ currentPage = 'dashboard', userRole = 'admin', isOpen, onToggle }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const medicalKnowledge = {
    symptoms: {
      'chest pain': 'Consider cardiac evaluation, ECG, troponin levels, emergency assessment',
      'shortness of breath': 'Check oxygen saturation, chest X-ray, pulmonary function',
      'fever': 'Order blood culture, CBC, vital signs monitoring',
      'headache': 'Neurological exam, blood pressure check, CT scan if severe',
      'abdominal pain': 'Physical exam, ultrasound, blood work, urinalysis'
    },
    procedures: {
      'ECG': 'Electrocardiogram for heart rhythm assessment',
      'CBC': 'Complete blood count for infection/anemia screening',
      'CT scan': 'Detailed imaging for internal structures',
      'ultrasound': 'Non-invasive imaging using sound waves'
    }
  };

  const contextualHelp = {
    dashboard: 'I can help with hospital overview, patient census, alerts, and quick actions.',
    patients: 'I can assist with patient registration, medical history, and record management.',
    emergency: 'I provide emergency protocols, triage guidelines, and critical care support.',
    pharmacy: 'I help with medication management, drug interactions, and prescription verification.',
    appointments: 'I can help schedule, reschedule, and manage patient appointments.',
    billing: 'I assist with invoice generation, payment processing, and insurance verification.'
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: AIMessage = {
        id: '1',
        role: 'assistant',
        content: `Hello! I'm your AI medical assistant. ${contextualHelp[currentPage as keyof typeof contextualHelp] || 'I\'m here to help with hospital operations.'} How can I assist you today?`,
        timestamp: new Date().toISOString(),
        suggestions: getQuickActions()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, currentPage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getQuickActions = () => {
    const actions = {
      dashboard: ['View patient census', 'Check bed availability', 'Review alerts'],
      patients: ['Add new patient', 'Search records', 'Update medical history'],
      emergency: ['Triage protocols', 'Emergency procedures', 'Contact specialists'],
      pharmacy: ['Check drug interactions', 'Verify prescriptions', 'Monitor inventory'],
      appointments: ['Schedule appointment', 'View today\'s schedule', 'Send reminders'],
      billing: ['Generate invoice', 'Process payment', 'Check insurance']
    };
    return actions[currentPage as keyof typeof actions] || actions.dashboard;
  };

  const generateResponse = async (userMessage: string): Promise<AIMessage> => {
    const roleRestrictions: Record<string, { allowed: string[]; blocked: string[]; description: string }> = {
      user: {
        allowed: ['appointment booking', 'general health questions', 'hospital location', 'visiting hours', 'how to book', 'departments available'],
        blocked: ['patient records', 'other patients', 'medical diagnoses', 'prescriptions', 'lab results', 'staff information', 'financial data', 'system settings'],
        description: 'You are assisting a regular patient/user. You can ONLY help with: booking appointments, general health information, hospital services, visiting hours, and directions. You MUST REFUSE any questions about other patients, medical records, diagnoses, prescriptions, lab results, staff details, billing details of others, or any internal hospital data. If asked about restricted topics, say: "I\'m sorry, I can\'t help with that. As a patient, I can only assist you with booking appointments and general hospital information."'
      },
      receptionist: {
        allowed: ['appointments', 'patient registration', 'front office', 'queue management', 'visitor management', 'billing basics'],
        blocked: ['medical diagnoses', 'prescriptions', 'lab results', 'clinical decisions', 'staff payroll', 'system settings'],
        description: 'You are assisting a receptionist. You can help with: appointment scheduling, patient registration, front office operations, queue management, visitor management, and basic billing. You MUST REFUSE clinical questions (diagnoses, prescriptions, lab results) and internal admin settings.'
      },
      nurse: {
        allowed: ['patient care', 'vitals', 'medication administration', 'nursing procedures', 'ward management', 'patient records for assigned patients'],
        blocked: ['financial data', 'system settings', 'user management', 'payroll', 'unassigned patient records'],
        description: 'You are assisting a nurse. You can help with: patient care, vital signs, medication administration, nursing procedures, and ward management. You MUST REFUSE questions about financial data, system administration, payroll, or patients not under nursing care.'
      },
      doctor: {
        allowed: ['medical diagnoses', 'patient care', 'treatment plans', 'prescriptions', 'medical records', 'clinical decisions', 'lab results', 'procedures'],
        blocked: ['financial management', 'system settings', 'user management', 'payroll', 'other doctors\' private notes'],
        description: 'You are assisting a doctor. You can help with: medical diagnoses, patient care, treatment plans, prescriptions, medical records, and clinical decisions. You MUST REFUSE questions about financial management, system administration, or payroll.'
      },
      pharmacist: {
        allowed: ['medications', 'drug interactions', 'prescriptions', 'pharmacy inventory', 'dosage information'],
        blocked: ['patient medical history beyond prescriptions', 'financial data', 'system settings', 'clinical diagnoses'],
        description: 'You are assisting a pharmacist. You can help with: medication management, drug interactions, prescription verification, and pharmacy inventory. You MUST REFUSE questions about full patient medical histories, financial data, or system administration.'
      },
      lab_technician: {
        allowed: ['lab tests', 'specimen handling', 'test results', 'lab procedures', 'equipment'],
        blocked: ['clinical diagnoses', 'prescriptions', 'financial data', 'system settings', 'patient personal details beyond test orders'],
        description: 'You are assisting a lab technician. You can help with: lab tests, specimen handling, test results, and lab procedures. You MUST REFUSE questions about clinical diagnoses, prescriptions, financial data, or patient personal details beyond what is needed for tests.'
      },
      admin: {
        allowed: ['staff management', 'reports', 'user management', 'hospital operations', 'departments', 'scheduling'],
        blocked: ['system-level configuration', 'security settings', 'super admin functions'],
        description: 'You are assisting an admin. You can help with: staff management, reports, user management, and hospital operations. You MUST REFUSE system-level configuration and security settings — those require super admin access.'
      },
      super_admin: {
        allowed: ['everything'],
        blocked: [],
        description: 'You are assisting a super admin with full system access. You can help with any hospital management topic.'
      },
    };

    const restriction = roleRestrictions[userRole] || roleRestrictions.user;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { 
              role: 'system', 
              content: `You are SmartCare AI Assistant. Current page: ${currentPage}. User role: ${userRole}.

ROLE INSTRUCTIONS: ${restriction.description}

BLOCKED TOPICS for this role: ${restriction.blocked.join(', ') || 'none'}.

CRITICAL: You must strictly enforce these restrictions. Never reveal patient data, records, or information outside the user's role scope. If a user asks about blocked topics, politely decline and redirect them to what you CAN help with.` 
            },
            ...messages.filter(m => m.role === 'user').slice(-6).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.5,
          max_tokens: 500,
        }),
      });

      if (!response.ok) throw new Error('API Error');
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content || 'I apologize, but I could not process your request.';
      
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
        suggestions: getQuickActions()
      };
    } catch (error) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'AI service temporarily unavailable. Please try again later.',
        timestamp: new Date().toISOString()
      };
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      const aiResponse = await generateResponse(input);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-20 right-4 z-50 max-w-[calc(100vw-2rem)]"
    >
      <Card className={`bg-card shadow-2xl border-2 border-[#38bdf8] transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96'
      }`} style={{ height: isMinimized ? '64px' : '500px', maxHeight: '80vh' }}>
        <CardHeader className="p-4 bg-gradient-to-r from-[#38bdf8] to-[#0ea5e9] text-card-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="size-6" />
                <Sparkles className="size-3 absolute -top-1 -right-1 text-yellow-300" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Medical Assistant</CardTitle>
                <p className="text-xs opacity-90">Powered by Medical AI</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-card-foreground hover:bg-card/20 p-1"
              >
                {isMinimized ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggle}
                className="text-card-foreground hover:bg-card/20 p-1"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col" style={{ height: '420px' }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-[#38bdf8] text-card-foreground' 
                        : 'bg-muted text-gray-900'
                    }`}>
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="size-4 text-[#38bdf8]" />
                          <span className="text-xs font-medium text-[#38bdf8]">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      {message.suggestions && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="cursor-pointer hover:bg-[#38bdf8] hover:text-card-foreground text-xs"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="size-4 text-[#38bdf8] animate-pulse" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#38bdf8] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#38bdf8] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about symptoms, procedures, or hospital operations..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-[#38bdf8] hover:bg-[#0ea5e9]"
                >
                  <Send className="size-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center mt-2">
                <Badge variant="outline" className="text-xs">
                  <Brain className="size-3 mr-1" />
                  Medical AI • Context: {currentPage}
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

