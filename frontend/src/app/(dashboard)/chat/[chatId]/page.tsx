'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { fetchChatById } from '@/store/slices/chatSlice';
import ChatArea from '@/app/components/chat/ChatArea';
import ChatInput from '@/app/components/chat/ChatInput';

export default function ChatDetailPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const chatId = params.chatId as string;

  useEffect(() => {
    if (chatId) {
      dispatch(fetchChatById(chatId));
    }
  }, [chatId, dispatch]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ChatArea />
      <ChatInput />
    </div>
  );
}