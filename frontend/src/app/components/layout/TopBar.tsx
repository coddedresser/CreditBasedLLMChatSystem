'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchOrganizationCredits } from '@/store/slices/authSlice';
import { Bell, Coins, RefreshCw } from 'lucide-react';
import NotificationPanel from './NotificationPanel';

export default function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const dispatch = useAppDispatch();
  const { organizationCredits, currentOrganizationId } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notification);
  const { activeOrganization } = useAppSelector((state) => state.organization);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch credits when organization changes
  useEffect(() => {
    if (activeOrganization) {
      dispatch(fetchOrganizationCredits());
    }
  }, [activeOrganization, dispatch]);

  const handleRefreshCredits = async () => {
    setIsRefreshing(true);
    await dispatch(fetchOrganizationCredits());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <>
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex-1">
          {activeOrganization && (
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{activeOrganization.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200 shadow-sm">
            <Coins size={18} className="text-green-600" />
            <div className="flex flex-col">
              <span className="text-xs text-green-600 font-medium">Organization Credits</span>
              <span className="font-bold text-green-700">
                {organizationCredits.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleRefreshCredits}
              disabled={isRefreshing}
              className="ml-2 p-1 hover:bg-green-100 rounded transition-colors"
              title="Refresh credits"
            >
              <RefreshCw 
                size={14} 
                className={`text-green-600 ${isRefreshing ? 'animate-spin' : ''}`} 
              />
            </button>
          </div>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} className="text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}