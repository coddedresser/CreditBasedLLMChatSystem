'use client';

import { useEffect, useState } from 'react';
import { organizationService } from '@/services/organizationService';
import { useAppDispatch } from '@/store/hooks';
import { fetchOrganizations } from '@/store/slices/organizationSlice';
import { Mail, Check, X, Building2 } from 'lucide-react';

interface Invitation {
  id: number;
  organization_id: number;
  organization_name: string;
  email: string;
  invited_by_username: string;
  status: string;
  created_at: string;
}

export default function InvitationsPage() {
  const dispatch = useAppDispatch();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const response = await organizationService.getMyInvitations();
      setInvitations(response.invitations);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (invitationId: number) => {
    try {
      setProcessingId(invitationId);
      await organizationService.acceptInvitation(invitationId);
      dispatch(fetchOrganizations()); // Refresh organizations list
      loadInvitations(); // Refresh invitations
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      alert('Failed to accept invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invitationId: number) => {
    try {
      setProcessingId(invitationId);
      await organizationService.rejectInvitation(invitationId);
      loadInvitations();
    } catch (error) {
      console.error('Failed to reject invitation:', error);
      alert('Failed to reject invitation');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organization Invitations</h1>
          <p className="text-gray-600 mt-2">Accept or reject invitations to join organizations</p>
        </div>

        {invitations.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Mail size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending invitations</h3>
            <p className="text-gray-600">You don't have any pending organization invitations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building2 size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {invitation.organization_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Invited by <span className="font-medium">{invitation.invited_by_username}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(invitation.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(invitation.id)}
                      disabled={processingId === invitation.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === invitation.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Check size={18} />
                      )}
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(invitation.id)}
                      disabled={processingId === invitation.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={18} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}