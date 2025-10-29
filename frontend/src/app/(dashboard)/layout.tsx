'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { verifyToken, fetchOrganizationCredits } from '@/store/slices/authSlice';
import { fetchOrganizations } from '@/store/slices/organizationSlice';
import { fetchChats } from '@/store/slices/chatSlice';
import { setNotifications, addNotification, setUnreadCount } from '@/store/slices/notificationSlice';
import { socketService } from '@/services/socketService';
import Sidebar from '@/app/components/layout/Sidebar';
import TopBar from '@/app/components/layout/TopBar';
import api from '@/services/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { activeOrganization } = useAppSelector((state) => state.organization);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    dispatch(verifyToken()).then((result) => {
      if (verifyToken.fulfilled.match(result)) {
        dispatch(fetchOrganizations()).then(() => {
          // Fetch organization credits after organizations are loaded
          dispatch(fetchOrganizationCredits());
        });
        
        // Connect socket
        socketService.connect(token);

        // Load notifications
        api.get('/api/notifications').then((res) => {
          dispatch(setNotifications(res.data.notifications));
          dispatch(setUnreadCount(res.data.unreadCount));
        });

        // Socket listeners
        socketService.on('notification', (notification: any) => {
          dispatch(addNotification(notification));
        });

        socketService.on('unread_count', (data: any) => {
          dispatch(setUnreadCount(data.count));
        });
      } else {
        router.push('/login');
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, [dispatch, router]);

  // Refresh chats and credits when organization changes
  useEffect(() => {
    if (activeOrganization && isAuthenticated) {
      dispatch(fetchChats());
      dispatch(fetchOrganizationCredits());
    }
  }, [activeOrganization, isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}