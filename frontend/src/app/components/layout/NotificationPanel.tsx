'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { markAllAsRead } from '@/store/slices/notificationSlice';
import { X, CheckCheck } from 'lucide-react';
import api from '@/services/api';

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.notification);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      dispatch(markAllAsRead());
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'invitation':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Mark all as read"
              >
                <CheckCheck size={18} className="text-gray-600" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${getNotificationColor(notification.type)} ${
                    !notification.is_read ? 'border-l-4' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}