'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useWorkout } from '@/contexts/WorkoutContext';
import type { Workout } from '@/types';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workoutData?: {
    prompt: string;
    canGenerate: boolean;
  };
};

type ChatApiResponse = {
  message: string;
  role: 'assistant';
  shouldOfferBuild?: boolean;
  buildPrompt?: string | null;
};

export default function AIChatbot({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { setWorkout } = useWorkout();
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    role: 'assistant',
    content: 'Hey! 💪 I\'m KINETIC AI, your workout assistant. Ask me about exercises, workout plans, or interval training! I can also build custom workouts for you.',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [buildingWorkout, setBuildingWorkout] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isSupported: speechSupported, isListening, toggleListening } = useSpeechToText(
    (text) => setInput(text)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildWorkout = async (prompt: string, messageId: string) => {
    setBuildingWorkout(messageId);
    try {
      const response = await fetch('/api/ai/build-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to build workout');
      }

      const result = (await response.json()) as { workout?: Workout };
      if (!result.workout || !Array.isArray(result.workout.intervals) || result.workout.intervals.length === 0) {
        throw new Error('Invalid workout payload');
      }
      setWorkout(result.workout);
      
      // Add success message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🔥 Workout created! Taking you to the builder...`,
        timestamp: new Date(),
      }]);
      
      // Navigate after a brief delay
      setTimeout(() => {
        onClose();
        router.push('/workouts');
      }, 1000);
    } catch (error) {
      console.error('Workout generation error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⚠️ Sorry, I had trouble creating that workout. Please try again or describe it differently.',
        timestamp: new Date(),
      }]);
    } finally {
      setBuildingWorkout(null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          message: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = (await response.json()) as ChatApiResponse;
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        workoutData: data.shouldOfferBuild ? {
          prompt: data.buildPrompt || userMessage.content,
          canGenerate: true,
        } : undefined,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-40 sm:bottom-24 right-4 sm:right-6 w-[400px] h-[600px] max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-8rem)] bg-surface-container-low border border-outline-variant rounded-3xl shadow-2xl flex flex-col z-[9999] animate-slide-in-bottom motion-reduce:animate-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-xl">psychology</span>
          </div>
          <div>
            <h3 className="font-bold text-sm">KINETIC AI</h3>
            <p className="text-xs text-on-surface-variant">Workout Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-surface-container-highest rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-highest text-on-surface'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
            
            {/* Build Workout Button */}
            {msg.role === 'assistant' && msg.workoutData?.canGenerate && (
              <div className="flex justify-start mt-2">
                <button
                  onClick={() => buildWorkout(msg.workoutData!.prompt, msg.id)}
                  disabled={buildingWorkout !== null}
                  className="bg-secondary text-on-secondary px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  {buildingWorkout === msg.id ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">hourglass_empty</span>
                      Building...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">fitness_center</span>
                      Build This Workout
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-surface-container-highest rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-outline-variant bg-surface-container rounded-b-3xl">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about workouts..."
            className="ui-input flex-1 rounded-full py-2 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              isListening ? 'bg-secondary text-on-secondary' : 'hover:bg-surface-container-highest'
            } ${!speechSupported ? 'opacity-40' : ''}`}
            disabled={!speechSupported || isLoading}
          >
            <span className="material-symbols-outlined text-xl">mic</span>
          </button>
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-primary text-on-primary rounded-full hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center w-9 h-9"
          >
            <span className="material-symbols-outlined text-xl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
