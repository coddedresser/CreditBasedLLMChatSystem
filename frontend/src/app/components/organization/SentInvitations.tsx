'use client';

import { useState, useEffect } from 'react';
import { organizationService } from '@/services/organizationService';
import { Mail, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface Invitation {
  id: number;
  email: string;
  invited_by_username: string;
  status: string;
  created_at: string;
}

interface SentInvitationsListProps {
  organizationId: number;
}

export default function SentInvitationsList({ organizationId }: SentInvitationsListProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInvitations();
  }, [organizationId]);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const response = await organizationService.getSentInvitations(organizationId.toString());
      setInvitations(response.invitations);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Mail size={18} />
          Sent Invitations ({invitations.length})
        </h3>
        <button
          onClick={loadInvitations}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {invitations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Mail size={48} className="mx-auto text-gray-300 mb-3" />
            <p>No invitations sent yet</p>
          </div>
        ) : (
          invitations.map((invitation) => (
            <div key={invitation.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{invitation.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Invited by {invitation.invited_by_username}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(invitation.status)}`}>
                    {getStatusIcon(invitation.status)}
                    {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}