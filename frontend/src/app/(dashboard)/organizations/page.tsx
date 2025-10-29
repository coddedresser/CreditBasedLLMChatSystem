'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrganizations, createOrganization, setActiveOrganization, fetchMembers } from '@/store/slices/organizationSlice';
import { fetchOrganizationCredits } from '@/store/slices/authSlice';
import { organizationService } from '@/services/organizationService';
import OrganizationCard from '@/app/components/organization/OrganizationCard';
import CreateOrgModal from '@/app/components/organization/CreateOrgModel';
import MembersList from '@/app/components/organization/MembersList';
import SentInvitationsList from '@/app/components/organization/SentInvitations';
import InviteMemberModal from '@/app/components/organization/InviteMemberModal';
import CreditsManager from '@/app/components/organization/CreditsManager';
import { Plus, UserPlus, Users, Mail, Coins } from 'lucide-react';

export default function OrganizationsPage() {
  const dispatch = useAppDispatch();
  const { organizations, activeOrganization, members } = useAppSelector((state) => state.organization);
  const { user, organizationCredits } = useAppSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>('member');
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'credits'>('members');

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  useEffect(() => {
    if (activeOrganization) {
      setSelectedOrgId(activeOrganization.id);
      dispatch(fetchMembers(activeOrganization.id.toString()));
      
      const org = organizations.find(o => o.id === activeOrganization.id);
      if (org) {
        setUserRole(org.role || 'member');
      }
    }
  }, [activeOrganization, dispatch, organizations]);

  const handleCreateOrganization = async (name: string) => {
    await dispatch(createOrganization(name)).unwrap();
    dispatch(fetchOrganizations());
  };

  const handleSelectOrganization = async (orgId: number) => {
    await dispatch(setActiveOrganization(orgId.toString())).unwrap();
    setSelectedOrgId(orgId);
    dispatch(fetchMembers(orgId.toString()));
    dispatch(fetchOrganizationCredits());
  };

  const handleInviteMember = async (email: string) => {
    if (selectedOrgId) {
      await organizationService.inviteMember(selectedOrgId.toString(), email);
      dispatch(fetchMembers(selectedOrgId.toString()));
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (selectedOrgId) {
      await organizationService.removeMember(selectedOrgId.toString(), memberId);
      dispatch(fetchMembers(selectedOrgId.toString()));
    }
  };

  const handleChangeRole = async (memberId: number, newRole: string) => {
    if (selectedOrgId) {
      await organizationService.updateMemberRole(selectedOrgId.toString(), memberId, newRole);
      dispatch(fetchMembers(selectedOrgId.toString()));
    }
  };

  const handleCreditsUpdate = () => {
    dispatch(fetchOrganizationCredits());
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
            <p className="text-gray-600 mt-2">Manage your organizations, members, and credits</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium shadow-lg"
          >
            <Plus size={20} />
            Create Organization
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Organizations</h2>
            <div className="grid gap-4">
              {organizations.length === 0 ? (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                  <p className="text-gray-500">No organizations yet. Create one to get started!</p>
                </div>
              ) : (
                organizations.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    organization={org}
                    onSelect={handleSelectOrganization}
                    isActive={org.id === selectedOrgId}
                  />
                ))
              )}
            </div>
          </div>

          <div>
            {selectedOrgId && (
              <>
                {/* Tabs Section */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {[
                    { key: 'members', label: 'Members', icon: Users },
                    { key: 'invitations', label: 'Invites', icon: Mail },
                    { key: 'credits', label: 'Credits', icon: Coins },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as 'members' | 'invitations' | 'credits')}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                        activeTab === key
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Invite Button — separate and only visible in Members tab */}
                {userRole === 'admin' && activeTab === 'members' && (
                  <div className="mt-3">
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all font-medium shadow-md w-full sm:w-auto"
                    >
                      <UserPlus size={16} />
                      Invite Member
                    </button>
                  </div>
                )}

                {activeTab === 'members' && (
                  <MembersList 
                    members={members}
                    organizationId={selectedOrgId}
                    userRole={userRole}
                    currentUserId={user?.id}
                    onRemoveMember={handleRemoveMember}
                    onChangeRole={handleChangeRole}
                  />
                )}

                {activeTab === 'invitations' && (
                  <SentInvitationsList organizationId={selectedOrgId} />
                )}

                {activeTab === 'credits' && (
                  <CreditsManager
                    organizationId={selectedOrgId}
                    currentCredits={organizationCredits}
                    userRole={userRole}
                    onCreditsUpdate={handleCreditsUpdate}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateOrgModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateOrganization}
        />
      )}

      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteMember}
        />
      )}
    </div>
  );
}