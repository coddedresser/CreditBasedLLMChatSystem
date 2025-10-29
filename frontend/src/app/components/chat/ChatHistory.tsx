'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchChats, createChat } from '@/store/slices/chatSlice';
import { chatService } from '@/services/chatService';
import { MessageSquare, Plus, Edit2, Check, X } from 'lucide-react';

export default function ChatHistory() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { chats, currentChat } = useAppSelector((state) => state.chat);
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const handleCreateChat = async () => {
    try {
      const result = await dispatch(createChat('New Chat')).unwrap();
      router.push(`/chat/${result.id}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleSelectChat = (chatId: number) => {
    if (editingChatId === null) {
      router.push(`/chat/${chatId}`);
    }
  };

  const startEditing = (chatId: number, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditTitle('');
  };

  const saveTitle = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      try {
        await chatService.updateChat(chatId.toString(), editTitle.trim());
        dispatch(fetchChats()); // Refresh the chat list
        setEditingChatId(null);
        setEditTitle('');
      } catch (error) {
        console.error('Failed to update chat title:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, chatId: number) => {
    if (e.key === 'Enter') {
      saveTitle(chatId, e as any);
    } else if (e.key === 'Escape') {
      cancelEditing(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={handleCreateChat}
        className="m-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
      >
        <Plus size={18} />
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
          Recent Chats
        </h3>
        
        {chats.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No chats yet. Create one to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`group relative w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer flex items-center gap-3 ${
                  currentChat?.id === chat.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <MessageSquare size={16} className="flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  {editingChatId === chat.id ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, chat.id)}
                        className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => saveTitle(chat.id, e)}
                        className="p-1 hover:bg-green-100 rounded text-green-600"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={(e) => cancelEditing(e)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium truncate">{chat.title || 'New Chat'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(chat.updated_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>

                {editingChatId !== chat.id && (
                  <button
                    onClick={(e) => startEditing(chat.id, chat.title, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded transition-opacity"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}