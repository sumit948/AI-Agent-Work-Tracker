'use client';

import { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { chatApi } from '@/lib/api/chat-api';
import { ApiError } from '@/lib/api-client';
import { Send, Loader2, MessageSquare, Lightbulb } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  'What did I do last week?',
  'How much time did I spend on bugs?',
  'Which task took the most time?',
  'What\'s my productivity trend?',
  'Give me a summary of my meetings',
  'Which categories did I work on most?',
];

const DEMO_RESPONSES: Record<string, string> = {
  default: 'Based on your work logs this week, you\'ve completed 12 tasks totalling 23.5 hours. Feature development was your primary focus at 53% of your time (12.5h), followed by bug fixes at 19% (4.5h). Your most productive day was yesterday with 5.5 hours logged across 2 tasks.',
  'last week': 'Last week you logged 23.5 hours across 12 tasks. Highlights: delivered AI-powered log structuring, fixed 3 bugs including a critical JWT auth issue, and optimised database queries for a 40% performance gain. Your productivity score was 82%.',
  'bug': 'You spent 4.5 hours on bug fixes this week across 3 bug tasks. That\'s about 19% of your total work time. The most time-intensive bug was the JWT token expiration fix (2.5h).',
  'most time': 'Your most time-intensive task was "Implemented AI log structuring with OpenAI" at 4.0 hours. Close behind was "Built REST API endpoints for user dashboard" at 3.5h and "Optimised database queries" at 3.0h.',
  'productivity': 'Your productivity trend is strong! You went from 2.0h on Monday to a peak of 5.5h on Thursday, then maintained 4.0h today. Your 7-day productivity score is 82%, above the typical 70-75% baseline.',
  'meeting': "You attended 2 meetings this week totalling 1.5 hours: the daily standup & sprint planning (1.0h) and a 1:1 with your engineering manager (0.5h). That's 6% of your work time - a healthy balance.",
  'categories': "Category breakdown this week: Feature (53%, 12.5h), Bug (19%, 4.5h), Other (9%, 2.0h), Review (11%, 2.5h), Documentation (6%, 1.5h), Meeting (6%, 1.5h). Feature work is dominating - great if you're in a delivery sprint.",
};

function getDemoResponse(question: string): string {
  const q = question.toLowerCase();
  for (const [key, val] of Object.entries(DEMO_RESPONSES)) {
    if (key !== 'default' && q.includes(key)) return val;
  }
  return DEMO_RESPONSES.default;
}

export default function ChatPage() {
  const { isDemoMode } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      type: 'assistant',
      content: 'Hi! I\'m your AI assistant. Ask me anything about your work, productivity, and logs. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 800));
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getDemoResponse(text),
        timestamp: new Date(),
      }]);
      setLoading(false);
      return;
    }

    try {
      const result = await chatApi.ask(text.trim());
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.answer,
        timestamp: new Date(result.timestamp),
      }]);
    } catch (err) {
      const errorText = err instanceof ApiError ? err.message : 'Sorry, something went wrong. Please try again.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: errorText,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        title="AI Assistant"
        subtitle="Ask questions about your work and productivity"
      />

      <div className="p-8 h-[calc(100vh-100px)] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.length === 1 && (
            <div className="mt-12 space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Ask Me Anything</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Query your work logs, get productivity insights, and ask about your tasks
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(question)}
                    className="text-left p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-foreground">{question}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-lg rounded-lg p-4 ${
                  msg.type === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-secondary text-foreground border border-border rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-2 ${msg.type === 'user' ? 'opacity-70' : 'text-muted-foreground'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary text-foreground border border-border rounded-lg rounded-bl-none p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border pt-6">
          <div className="flex gap-3">
            <Textarea
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              disabled={loading}
              className="max-h-24 resize-none"
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              size="lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}
