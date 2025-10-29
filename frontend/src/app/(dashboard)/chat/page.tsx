'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { fetchChats } from '@/store/slices/chatSlice';

export default function ChatPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchChats()).then((result) => {
      if (result.payload && result.payload.length > 0) {
        router.push(`/chat/${result.payload[0].id}`);
      }
    });
  }, [dispatch, router]);

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Welcome to LLM Chat Platform
        </h2>
        <p className="text-gray-500">
          Select a chat from the sidebar or create a new one
        </p>
      </div>
    </div>
  );
}