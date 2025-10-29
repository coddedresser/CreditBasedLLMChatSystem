'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import ChatMessage from './ChatMessage';

export default function ChatArea() {
  const { messages, isLoading, currentChat, isSending } = useAppSelector((state) => state.chat);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Welcome to LLM Chat Platform
          </h2>
          <p className="text-gray-500">
            Start a new conversation or select an existing chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-gray-50 p-4"
      style={{ 
        height: 'calc(100vh - 180px)', // Adjust based on your header/footer heights
        maxHeight: 'calc(100vh - 180px)'
      }}
    >
      {isLoading && messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4 pb-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          
          {isSending && (
            <div className="flex justify-start mb-4">
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-700">
                  <span className="text-white text-sm">🤖</span>
                </div>
                <div className="rounded-lg p-4 bg-white border border-gray-200">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}