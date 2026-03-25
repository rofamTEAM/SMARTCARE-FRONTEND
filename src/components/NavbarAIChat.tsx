import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, X, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { aiService } from '../utils/aiService';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface NavbarAIChatProps {
  session: any;
  isOpen: boolean;
  onClose: () => void;
}

export function NavbarAIChat({ session, isOpen, onClose }: NavbarAIChatProps) {
  const userRole = session?.user?.user_metadata?.role || 'user';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hi! I'm your SmartCare AI assistant. As a ${userRole}, I can help you with system navigation and role-specific tasks. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await aiService.sendMessage([
        { role: 'user', content: userMessage }
      ], userRole, 'navbar-chat');
      
      if (response.error) {
        toast.error('AI service temporarily unavailable');
        return 'I apologize, but I\'m having trouble connecting right now. Please try again later.';
      }
      
      return response.content;
    } catch (error) {
      return 'I apologize, but I encountered an error. Please try again.';
    }
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
        content: 'Sorry, I encountered an error. Please try again.',
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Chat Window */}
          <motion.div
            className="fixed top-20 right-4 w-96 max-w-[calc(100vw-2rem)] bg-background border border-border rounded-lg shadow-2xl z-50 flex flex-col md:right-6 sm:w-80"
            style={{ height: '500px', maxHeight: 'calc(100vh - 140px)' }}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="size-4 text-primary" />
                </div>
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-6 w-6"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'assistant' && (
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="size-3 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="size-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="size-3 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-3 animate-spin" />
                      <span className="text-xs text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-9 w-9"
                >
                  {isLoading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Send className="size-3" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
