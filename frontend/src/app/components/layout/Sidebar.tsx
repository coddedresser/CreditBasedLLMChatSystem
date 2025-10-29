'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { organizationService } from '@/services/organizationService';
import ChatHistory from '../chat/ChatHistory';
import { Building2, LogOut, Mail } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeOrganization } = useAppSelector((state) => state.organization);
  const [invitationCount, setInvitationCount] = useState(0);

  useEffect(() => {
    loadInvitationCount();
  }, []);

  const loadInvitationCount = async () => {
    try {
      const response = await organizationService.getMyInvitations();
      setInvitationCount(response.invitations.length);
    } catch (error) {
      console.error('Failed to load invitation count:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">LLM Chat</h1>
        {activeOrganization && (
          <p className="text-sm text-gray-500 mt-1 truncate">
            {activeOrganization.name}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatHistory />
      </div>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => router.push('/invitations')}
          className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Mail size={18} />
            <span>Invitations</span>
          </div>
          {invitationCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {invitationCount}
            </span>
          )}
        </button>

        <button
          onClick={() => router.push('/organizations')}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Building2 size={18} />
          <span>Organizations</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}