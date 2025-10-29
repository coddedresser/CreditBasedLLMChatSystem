'use client';

import { Message } from '@/types/chat.types';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-gray-700'
        }`}>
          {isUser ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
        </div>
        
        <div className={`rounded-lg p-4 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-900 border border-gray-200'
        }`}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <p className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date(message.created_at).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}