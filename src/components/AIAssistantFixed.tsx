import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  session: any;
}

export function AIAssistant({ session }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Assistant for SmartCare Hospital Management System. I can help you with patient information, appointments, medical records, billing, and system navigation. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const userRole = session?.role || 'user';

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('patient') && lowerMessage.includes('search')) {
      return `To search for patients, go to the Patients section in the sidebar. You can search by name, ID, phone number, or medical record number. As a ${userRole}, you have access to view patient information according to your role permissions.`;
    }

    if (lowerMessage.includes('appointment')) {
      return `For appointments, navigate to the Appointments section. You can:
• Schedule new appointments
• View upcoming appointments
• Reschedule or cancel existing appointments
• Check doctor availability
• Send appointment reminders to patients`;
    }

    if (lowerMessage.includes('billing') || lowerMessage.includes('payment')) {
      return `For billing and payments, check the Payments section where you can:
• Generate invoices
• Process payments
• View payment history
• Handle insurance claims
• Generate financial reports`;
    }

    if (lowerMessage.includes('doctor') || lowerMessage.includes('physician')) {
      return `Doctor-related features are available in the Doctors section:
• View doctor profiles and schedules
• Manage doctor assignments
• Access the Doctor Portal for medical professionals
• View doctor performance metrics`;
    }

    if (lowerMessage.includes('lab') || lowerMessage.includes('laboratory')) {
      return `Laboratory management includes:
• Test ordering and tracking
• Result entry and reporting
• Specimen tracking
• Lab invoice generation
• Quality control monitoring`;
    }

    if (lowerMessage.includes('pharmacy') || lowerMessage.includes('medication')) {
      return `Pharmacy features include:
• Medication inventory management
• Prescription processing
• Drug interaction checking
• Inventory alerts for low stock
• Medication dispensing records`;
    }

    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      return `For emergency situations:
• Use the Front Office for immediate patient registration
• Access the Nursing Station for urgent care coordination
• Check the Inpatient Management for bed availability
• Contact the on-call doctor through the Doctor Portal`;
    }

    return `I understand you're asking about "${userMessage}". Based on your role as ${userRole}, I recommend checking the relevant sections in the sidebar. If you need specific help with patient care, appointments, billing, or system navigation, please provide more details and I'll give you targeted guidance.`;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or contact system support.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    'How do I search for a patient?',
    'Schedule an appointment',
    'Generate a billing report',
    'Check lab results',
    'View doctor schedules'
  ];

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="size-5 text-primary" />
            </div>
            AI Assistant
            <span className="text-sm font-normal text-muted-foreground ml-auto">
              SmartCare AI Helper
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="size-4 text-primary" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>

                    {message.type === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="size-4 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Loader2 className="size-4 text-primary animate-spin" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <p className="text-sm text-muted-foreground">AI is thinking...</p>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {messages.length === 1 && (
            <div className="p-4 border-t bg-muted/30">
              <p className="text-sm text-muted-foreground mb-3">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(action)}
                    className="text-xs"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about the hospital system..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

