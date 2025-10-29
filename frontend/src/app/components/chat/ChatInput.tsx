'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { sendMessage, addUserMessage } from '@/store/slices/chatSlice';
import { updateCredits } from '@/store/slices/authSlice';
import { Send } from 'lucide-react';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const dispatch = useAppDispatch();
  const { currentChat, isSending, error } = useAppSelector((state) => state.chat);
  const { organizationCredits } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentChat || isSending) return;

    const userMessage = {
      id: Date.now(),
      chat_id: currentChat.id,
      role: 'user' as const,
      content: input.trim(),
      tokens_used: 0,
      created_at: new Date().toISOString(),
    };

    dispatch(addUserMessage(userMessage));
    setInput('');

    try {
      const result = await dispatch(
        sendMessage({ chatId: currentChat.id.toString(), content: userMessage.content })
      ).unwrap();
      
      if (result.credits !== undefined) {
        dispatch(updateCredits(result.credits));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!currentChat) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {organizationCredits <= 0 && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            ⚠️ Your organization has insufficient credits to send messages. Please contact an admin.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={organizationCredits > 0 ? "Type your message..." : "Insufficient organization credits"}
            disabled={isSending || organizationCredits <= 0}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim() || organizationCredits <= 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}